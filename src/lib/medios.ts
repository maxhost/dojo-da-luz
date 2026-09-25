import { createHash } from 'node:crypto'
import sharp, { type Metadata } from 'sharp'
import { configR2, endpoint, existe, presignarPut, urlPublica, listar, subir } from './r2.ts'

/**
 * Subida de imagenes al bucket (spec 0030). De cada archivo quedan dos objetos:
 *
 * - `original.<ext>` — lo que subio el cliente, sin tocar. No se sirve: es el negativo del
 *   que se reprocesa el dia que el render sepa leer `srcset`.
 * - `w1600.webp` — la que se sirve. Una foto de movil son 4 MB y el cliente pidio carga
 *   hiper rapida: mandarla entera a la pagina no es una opcion.
 *
 * La clave sale del hash del contenido, asi que subir dos veces el mismo archivo no
 * duplica nada y el objeto se puede cachear para siempre.
 */

export const PREFIJO = 'medios/'
export const ANCHO_MAXIMO = 1600

/**
 * El ancho de un **icono**: el logo del navbar mide 56 px y el favicon 32. Servir la de
 * 1600 para pintar 32 son ~80 KB en cada una de las 44 paginas (spec 0044).
 */
export const ANCHO_ICONO = 256

export type Variante = 'foto' | 'icono'
const BYTES_MAXIMOS = 10 * 1024 * 1024
const LADO_MAXIMO = 8000

/** Lo que `sharp` tiene que reconocer. La extension del nombre no decide nada. */
const FORMATOS: Record<string, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
}

export type Subida =
  | { ok: true; url: string; clave: string; bytes: number; reusado: boolean }
  | { ok: false; motivo: string }

export type Medio = { url: string; clave: string; tamano: number; fecha: string }

function mensaje(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function subirImagen(archivo: File, variante: Variante = 'foto'): Promise<Subida> {
  // Validar primero: rechazar un PDF renombrado no necesita hablar con R2, y asi esta
  // parte se puede verificar sin credenciales.
  if (archivo.size === 0) return { ok: false, motivo: 'El archivo está vacío.' }
  if (archivo.size > BYTES_MAXIMOS) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1)
    return { ok: false, motivo: `El archivo pesa ${mb} MB y el máximo son 10 MB.` }
  }

  const original = Buffer.from(await archivo.arrayBuffer())

  // El formato lo decide `sharp` leyendo los bytes: un PDF renombrado a .jpg no pasa.
  let meta: Metadata
  try {
    meta = await sharp(original).metadata()
  } catch {
    return { ok: false, motivo: 'No es una imagen que se pueda leer.' }
  }

  const extension = meta.format ? FORMATOS[meta.format] : undefined
  if (!extension) {
    return {
      ok: false,
      motivo: `Formato no admitido (${meta.format ?? 'desconocido'}). Se aceptan JPG, PNG, WebP y AVIF.`,
    }
  }

  const ancho = meta.width ?? 0
  const alto = meta.height ?? 0
  if (ancho > LADO_MAXIMO || alto > LADO_MAXIMO) {
    return { ok: false, motivo: `La imagen mide ${ancho}×${alto} y el máximo son 8000 px de lado.` }
  }

  const cfg = configR2()
  if ('falta' in cfg) return { ok: false, motivo: `Falta configurar R2: ${cfg.falta.join(', ')}` }

  const hash = createHash('sha256').update(original).digest('hex').slice(0, 12)
  // La clave lleva el ancho, asi que el mismo archivo subido como foto y como icono son dos
  // objetos y ninguno pisa al otro.
  const anchoServido = variante === 'icono' ? ANCHO_ICONO : ANCHO_MAXIMO
  const claveServida = `${PREFIJO}${hash}/w${anchoServido}.webp`

  try {
    if (await existe(cfg, claveServida)) {
      return { ok: true, url: urlPublica(cfg, claveServida), clave: claveServida, bytes: 0, reusado: true }
    }

    const servida = await sharp(original)
      // `withoutEnlargement`: una imagen de 800 px no se estira al ancho servido.
      .resize({ width: anchoServido, withoutEnlargement: true })
      .rotate() // respeta la orientación EXIF antes de descartar los metadatos
      .webp({ quality: 82 })
      .toBuffer()

    await subir(cfg, {
      clave: `${PREFIJO}${hash}/original.${extension}`,
      cuerpo: original,
      contentType: `image/${meta.format}`,
    })
    await subir(cfg, { clave: claveServida, cuerpo: servida, contentType: 'image/webp' })

    return {
      ok: true,
      url: urlPublica(cfg, claveServida),
      clave: claveServida,
      bytes: servida.length,
      reusado: false,
    }
  } catch (error) {
    return { ok: false, motivo: `No se pudo subir a R2: ${mensaje(error)}` }
  }
}

const BYTES_MAXIMOS_VIDEO = 32 * 1024 * 1024
const VENCIMIENTO_FIRMA_SEGUNDOS = 300
const CONTENT_TYPE_VIDEO = 'video/mp4'
/** sha256 en hex: 64 caracteres. Lo calcula el navegador con `crypto.subtle`. */
const HASH_HEX = /^[0-9a-f]{64}$/

export type Firma =
  | { ok: true; requierePut: boolean; url: string | null; urlPublica: string }
  | { ok: false; motivo: string }

/**
 * Firma un `PUT` prefirmado para subir el video de la portada directo a R2 (spec 0047).
 * No toca los bytes: valida lo que se puede validar sin ellos —tamaño, tipo declarado y que
 * el hash tenga forma de hash— y firma. `sharp` no entra en este camino: no hay forma de
 * validar que un `.mp4` sea un video real sin decodificarlo, y eso no cabe en la funcion.
 */
export async function firmarVideo(args: {
  contentType: string
  tamano: number
  hash: string
}): Promise<Firma> {
  if (args.contentType !== CONTENT_TYPE_VIDEO) {
    return { ok: false, motivo: 'Tiene que ser un archivo .mp4 (video/mp4).' }
  }
  if (!Number.isFinite(args.tamano) || args.tamano <= 0) {
    return { ok: false, motivo: 'El archivo está vacío.' }
  }
  if (args.tamano > BYTES_MAXIMOS_VIDEO) {
    const mb = (args.tamano / 1024 / 1024).toFixed(1)
    return { ok: false, motivo: `El archivo pesa ${mb} MB y el máximo son 32 MB.` }
  }
  if (!HASH_HEX.test(args.hash)) {
    return { ok: false, motivo: 'El hash del archivo no es válido.' }
  }

  const cfg = configR2()
  if ('falta' in cfg) return { ok: false, motivo: `Falta configurar R2: ${cfg.falta.join(', ')}` }

  // La clave sale del hash del contenido, igual que las imagenes: subir el mismo video dos
  // veces no duplica nada y el objeto se puede cachear para siempre.
  const clave = `${PREFIJO}${args.hash}/video.mp4`

  if (await existe(cfg, clave)) {
    return { ok: true, requierePut: false, url: null, urlPublica: urlPublica(cfg, clave) }
  }

  const host = endpoint(cfg)
  const url = presignarPut({
    host,
    ruta: `/${cfg.bucket}/${clave}`,
    contentType: CONTENT_TYPE_VIDEO,
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    fecha: new Date(),
    vencimientoSegundos: VENCIMIENTO_FIRMA_SEGUNDOS,
  })

  return { ok: true, requierePut: true, url, urlPublica: urlPublica(cfg, clave) }
}

const BYTES_MAXIMOS_IMAGEN_GRANDE = 20 * 1024 * 1024

/** A diferencia de `FORMATOS` (que lee lo que `sharp` detecto en los bytes), esto lee el
 * `content-type` que declaro el navegador: aca no hay bytes que leer todavia. */
const FORMATOS_IMAGEN: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/**
 * Firma un `PUT` prefirmado para una imagen de mas de 4 MB (spec 0047): el mismo camino que
 * `firmarVideo`, pero para el caso que motivo el ADR-0044 —una foto de movil no entra en el
 * corte de 4,5 MB de Vercel—. `CampoImagen` decide del lado del navegador cuando usar este
 * camino en vez de `/admin/medios/subir`.
 *
 * Se pierde lo que da `sharp` en el camino chico: no hay resize a WebP ni validacion de que
 * los bytes sean una imagen real. El archivo se sirve tal cual llega, bajo `original.<ext>`
 * — es el trade-off que el ADR ya acepto, no un descuido.
 */
export async function firmarImagen(args: {
  contentType: string
  tamano: number
  hash: string
}): Promise<Firma> {
  const extension = FORMATOS_IMAGEN[args.contentType]
  if (!extension) {
    return {
      ok: false,
      motivo: `Formato no admitido (${args.contentType}). Se aceptan JPG, PNG, WebP y AVIF.`,
    }
  }
  if (!Number.isFinite(args.tamano) || args.tamano <= 0) {
    return { ok: false, motivo: 'El archivo está vacío.' }
  }
  if (args.tamano > BYTES_MAXIMOS_IMAGEN_GRANDE) {
    const mb = (args.tamano / 1024 / 1024).toFixed(1)
    return { ok: false, motivo: `El archivo pesa ${mb} MB y el máximo son 20 MB.` }
  }
  if (!HASH_HEX.test(args.hash)) {
    return { ok: false, motivo: 'El hash del archivo no es válido.' }
  }

  const cfg = configR2()
  if ('falta' in cfg) return { ok: false, motivo: `Falta configurar R2: ${cfg.falta.join(', ')}` }

  const clave = `${PREFIJO}${args.hash}/original.${extension}`

  if (await existe(cfg, clave)) {
    return { ok: true, requierePut: false, url: null, urlPublica: urlPublica(cfg, clave) }
  }

  const host = endpoint(cfg)
  const url = presignarPut({
    host,
    ruta: `/${cfg.bucket}/${clave}`,
    contentType: args.contentType,
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    fecha: new Date(),
    vencimientoSegundos: VENCIMIENTO_FIRMA_SEGUNDOS,
  })

  return { ok: true, requierePut: true, url, urlPublica: urlPublica(cfg, clave) }
}

/** Solo las servibles: el original no se ofrece para elegir porque no se sirve. */
export async function listarMedios(): Promise<Medio[]> {
  const cfg = configR2()
  if ('falta' in cfg) throw new Error(`Falta configurar R2: ${cfg.falta.join(', ')}`)

  const objetos = await listar(cfg, PREFIJO)
  return objetos
    .filter((o) => o.clave.endsWith('.webp') && o.clave.includes('/w'))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map((o) => ({ url: urlPublica(cfg, o.clave), clave: o.clave, tamano: o.tamano, fecha: o.fecha }))
}
