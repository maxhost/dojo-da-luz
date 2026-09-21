import type { z } from 'zod'
import { erroresDe, resumenDeErrores, texto } from './forms'
import { LOCALES, type Locale } from './i18n'
import { propagarEstructura } from './traduccion'
import { leerContenido, publicar, publicarVarios, serializar } from './publish'

/**
 * La publicacion de una pagina de contenido desde el backoffice, sin saber cual.
 *
 * Los tres editores que existen —`/aulas`, Adultos/Criancas y `/aikido`— hacen exactamente
 * lo mismo: leer los cuatro archivos, verificar el `sha`, propagar la estructura desde
 * portugues (ADR-0030), sembrar las imagenes (ADR-0032), validar y commitear. Lo unico que
 * cambia es **que archivo, que schema y que listas**. Eso es el descriptor.
 *
 * Con el tercer editor se paga la deuda: copiar el molde una tercera vez es como se llega a
 * tres copias del mismo bug. `/aulas` es la excepcion que no se migro, porque ademas
 * publica `content/media.json` en un commit aparte.
 */

export type Pagina = {
  /** Como se llama en el codigo. Aparece en la URL del BO y en el mensaje del commit. */
  clave: string
  /** Como se llama en la pantalla: "Adultos", "Crianças", "Aikido". */
  titulo: string
  /** La pagina del backoffice que la edita. */
  rutaBO: string
  archivo: (locale: Locale) => string
  schema: z.ZodType
  desdeForm: (form: FormData) => unknown
  /** Listas cuyo largo decide el portugues (ADR-0030). */
  listas: readonly string[]
  /** Campos que siempre vienen del portugues, tambien en filas que ya existen (ADR-0032). */
  sembrados: readonly string[]
}

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso:
      'Alguien editó esta página mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

function invalido(errores: Record<string, string>, prefijo = ''): Guardado {
  return {
    ok: false,
    estado: 422,
    aviso: `No se publicó nada. ${prefijo}${resumenDeErrores(errores)}`,
    errores,
  }
}

function sinCambios(): Guardado {
  return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
}

/**
 * Publicar portugues: alinear los otros tres —estructura y campos sembrados—, validarlos, y
 * escribir en un commit lo que cambio. Si un idioma no valida despues de propagar no se
 * publica **ninguno**: es lo que impide dejar la estructura a medio camino.
 */
async function guardarPortugues(
  pagina: Pagina,
  datosPt: unknown,
  form: FormData,
): Promise<Guardado> {
  const cambios: { ruta: string; contenido: string }[] = []

  for (const locale of LOCALES) {
    const actual = await leerContenido(pagina.archivo(locale))
    if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

    const datos =
      locale === 'pt'
        ? datosPt
        : propagarEstructura(
            datosPt,
            JSON.parse(actual.contenido),
            pagina.listas,
            pagina.sembrados,
          )

    const validado = pagina.schema.safeParse(datos)
    if (!validado.success) return invalido(erroresDe(validado.error), `En ${locale}: `)

    const contenido = serializar(validado.data)
    if (contenido !== actual.contenido) cambios.push({ ruta: pagina.archivo(locale), contenido })
  }

  if (cambios.length === 0) return sinCambios()

  const resultado = await publicarVarios({
    archivos: cambios,
    mensaje: `contenido: ${pagina.titulo} desde el backoffice (${cambios.length} archivos)`,
  })

  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()
  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

/**
 * Publicar es/fr/en: solo su archivo. La estructura **y las imagenes** se alinean contra el
 * portugues publicado antes de validar, asi que por esta puerta no entra ni una fila de mas
 * ni una foto distinta, aunque el formulario venga tocado.
 */
async function guardarTraduccion(
  pagina: Pagina,
  locale: Locale,
  datos: unknown,
  form: FormData,
): Promise<Guardado> {
  const actual = await leerContenido(pagina.archivo(locale))
  if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

  const pt = JSON.parse((await leerContenido(pagina.archivo('pt'))).contenido)
  const alineado = propagarEstructura(pt, datos, pagina.listas, pagina.sembrados)

  const validado = pagina.schema.safeParse(alineado)
  if (!validado.success) return invalido(erroresDe(validado.error))

  const contenido = serializar(validado.data)
  if (contenido === actual.contenido) return sinCambios()

  const resultado = await publicar({
    ruta: pagina.archivo(locale),
    contenido,
    mensaje: `contenido: ${pagina.titulo} en ${locale} desde el backoffice`,
    sha: actual.sha,
  })

  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()
  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

export async function guardarPagina(
  pagina: Pagina,
  form: FormData,
  locale: Locale,
): Promise<Guardado> {
  const datos = pagina.desdeForm(form)

  if (locale === 'pt') {
    const validado = pagina.schema.safeParse(datos)
    if (!validado.success) return invalido(erroresDe(validado.error))
  }

  try {
    return locale === 'pt'
      ? await guardarPortugues(pagina, datos, form)
      : await guardarTraduccion(pagina, locale, datos, form)
  } catch (error) {
    // El repositorio es un servicio remoto: sin token o con GitHub caido no se publica,
    // pero eso es un aviso, no un 500 del backoffice.
    const detalle = error instanceof Error ? error.message : String(error)
    return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
  }
}
