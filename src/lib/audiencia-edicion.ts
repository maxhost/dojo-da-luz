import { audienceEntrySchema } from './schemas'
import { erroresDe, filas, resumenDeErrores, texto } from './forms'
import { LOCALES, type Locale } from './i18n'
import { LISTAS_AUDIENCIA, SEMBRADOS_AUDIENCIA, propagarEstructura } from './traduccion'
import { leerContenido, publicar, publicarVarios, serializar } from './publish'

/**
 * Publicacion de las paginas de audiencia —Adultos y Criancas— (spec 0036).
 *
 * Es el mismo contrato que `/aulas`: portugues manda la estructura de las listas
 * (ADR-0030) y publicar PT escribe los cuatro archivos en un commit. Lo que agrega es el
 * **sembrado** (ADR-0032): la foto de portada y los medios de la galeria se copian de
 * portugues siempre, tambien en filas que ya existian, porque una foto no se traduce.
 *
 * Las dos paginas comparten schema y formulario; lo unico que cambia es el archivo.
 */

export type PaginaAudiencia = 'adults' | 'children'

/** Como se llama la pagina en la pantalla del backoffice y en el mensaje del commit. */
export const TITULO_AUDIENCIA: Record<PaginaAudiencia, string> = {
  adults: 'Adultos',
  children: 'Crianças',
}

/** Dos editores separados: editan pantallas distintas aunque el formulario sea el mismo. */
export const RUTA_BO: Record<PaginaAudiencia, string> = {
  adults: '/admin/paginas/adultos',
  children: '/admin/paginas/criancas',
}

export const ruta = (pagina: PaginaAudiencia, locale: Locale) =>
  `content/${locale}/${pagina === 'adults' ? 'adults' : 'children'}.json`

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `audienceEntrySchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Filtrarlas en silencio es el defecto que ya tiene el editor de parcerias, donde una
 * subida fallida se publica como "no habia cambios".
 */
export function audienciaDesdeForm(form: FormData): unknown {
  const t = (campo: string) => texto(form, campo)

  return {
    seo: { title: t('seo.title'), description: t('seo.description') },
    chrome: {
      caption: t('chrome.caption'),
      menuLabel: t('chrome.menuLabel'),
      skipLink: t('chrome.skipLink'),
      footerNote: {
        areas: t('chrome.footerNote.areas'),
        orgType: t('chrome.footerNote.orgType'),
      },
    },
    eyebrow: t('eyebrow'),
    title: t('title'),
    lead: t('lead'),
    paragraphs: columna(form, 'paragraphs'),
    goalsTitle: t('goalsTitle'),
    goals: columna(form, 'goals'),
    facts: filas(form, 'facts').map((f) => ({ label: f.uno('label'), value: f.uno('value') })),
    photo: t('photo'),
    photoAlt: t('photoAlt'),
    gallery: {
      label: t('gallery.label'),
      title: t('gallery.title'),
      intro: t('gallery.intro'),
      items: filas(form, 'gallery.items').map((f) =>
        f.uno('type') === 'youtube'
          ? { type: 'youtube', url: f.uno('url'), alt: f.uno('alt') }
          : { type: 'image', src: f.uno('src'), alt: f.uno('alt') },
      ),
    },
    trialTitle: t('trialTitle'),
    trialText: t('trialText'),
    trialLabel: t('trialLabel'),
    formUrl: t('formUrl'),
    directLabel: t('directLabel'),
    closeLabel: t('closeLabel'),
    qa: {
      label: t('qa.label'),
      title: t('qa.title'),
      items: filas(form, 'qa.items').map((f) => ({
        pregunta: f.uno('pregunta'),
        respuesta: f.uno('respuesta'),
      })),
    },
  }
}

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

/**
 * Publicar portugues: alinear los otros tres —estructura y campos sembrados—, validarlos,
 * y escribir en un commit lo que cambio. Si un idioma no valida despues de propagar no se
 * publica **ninguno**: es lo que impide dejar la estructura a medio camino.
 */
async function guardarPortugues(
  pagina: PaginaAudiencia,
  datosPt: unknown,
  form: FormData,
): Promise<Guardado> {
  const cambios: { ruta: string; contenido: string }[] = []

  for (const locale of LOCALES) {
    const actual = await leerContenido(ruta(pagina, locale))
    if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

    const datos =
      locale === 'pt'
        ? datosPt
        : propagarEstructura(
            datosPt,
            JSON.parse(actual.contenido),
            LISTAS_AUDIENCIA,
            SEMBRADOS_AUDIENCIA,
          )

    const validado = audienceEntrySchema.safeParse(datos)
    if (!validado.success) return invalido(erroresDe(validado.error), `En ${locale}: `)

    const contenido = serializar(validado.data)
    if (contenido !== actual.contenido) cambios.push({ ruta: ruta(pagina, locale), contenido })
  }

  if (cambios.length === 0) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicarVarios({
    archivos: cambios,
    mensaje: `contenido: ${TITULO_AUDIENCIA[pagina]} desde el backoffice (${cambios.length} archivos)`,
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
  pagina: PaginaAudiencia,
  locale: Locale,
  datos: unknown,
  form: FormData,
): Promise<Guardado> {
  const actual = await leerContenido(ruta(pagina, locale))
  if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

  const pt = JSON.parse((await leerContenido(ruta(pagina, 'pt'))).contenido)
  const alineado = propagarEstructura(pt, datos, LISTAS_AUDIENCIA, SEMBRADOS_AUDIENCIA)

  const validado = audienceEntrySchema.safeParse(alineado)
  if (!validado.success) return invalido(erroresDe(validado.error))

  const contenido = serializar(validado.data)
  if (contenido === actual.contenido) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicar({
    ruta: ruta(pagina, locale),
    contenido,
    mensaje: `contenido: ${TITULO_AUDIENCIA[pagina]} en ${locale} desde el backoffice`,
    sha: actual.sha,
  })

  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()
  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

export async function guardarAudiencia(
  form: FormData,
  locale: Locale,
  pagina: PaginaAudiencia,
): Promise<Guardado> {
  const datos = audienciaDesdeForm(form)

  if (locale === 'pt') {
    const validado = audienceEntrySchema.safeParse(datos)
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
