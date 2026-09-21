import { createHash } from 'node:crypto'
import sharp, { type Metadata } from 'sharp'
import { configR2, existe, listar, subir, urlPublica } from './r2'

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

export async function subirImagen(archivo: File): Promise<Subida> {
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
  const claveServida = `${PREFIJO}${hash}/w${ANCHO_MAXIMO}.webp`

  try {
    if (await existe(cfg, claveServida)) {
      return { ok: true, url: urlPublica(cfg, claveServida), clave: claveServida, bytes: 0, reusado: true }
    }

    const servida = await sharp(original)
      // `withoutEnlargement`: una imagen de 800 px no se estira a 1600.
      .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
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
