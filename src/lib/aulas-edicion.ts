import { classesSchema } from './schemas'
import { erroresDe, filas, resumenDeErrores, texto } from './forms'
import { LOCALES, type Locale } from './i18n'
import { LISTAS_AULAS, propagarEstructura } from './traduccion'
import { leerContenido, publicar, publicarVarios, serializar } from './publish'

/**
 * Publicacion de `/aulas` (spec 0035). Se diferencia del editor de Home en una cosa:
 * **portugues es el dueño de la estructura** (ADR-0030). Publicar PT alinea las listas de
 * los otros tres idiomas y escribe los cuatro archivos en un solo commit; publicar
 * cualquier otro idioma escribe solo el suyo.
 */

export const ruta = (locale: Locale) => `content/${locale}/classes.json`

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `classesSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Filtrarlas en silencio es el defecto que ya tiene el editor de parcerias, donde una
 * subida fallida se publica como "no habia cambios".
 */
export function aulasDesdeForm(form: FormData): unknown {
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
    hero: {
      eyebrow: t('hero.eyebrow'),
      title: t('hero.title'),
      lead: t('hero.lead'),
      season: t('hero.season'),
      ctaLabel: t('hero.ctaLabel'),
    },
    schedule: {
      label: t('schedule.label'),
      title: t('schedule.title'),
      intro: t('schedule.intro'),
      adultsLabel: t('schedule.adultsLabel'),
      childrenLabel: t('schedule.childrenLabel'),
    },
    pricing: {
      label: t('pricing.label'),
      title: t('pricing.title'),
      intro: t('pricing.intro'),
      items: filas(form, 'pricing.items').map((f) => ({
        name: f.uno('name'),
        price: f.uno('price'),
        detail: f.uno('detail'),
      })),
      notes: columna(form, 'pricing.notes'),
    },
    children: {
      label: t('children.label'),
      title: t('children.title'),
      paragraphs: columna(form, 'children.paragraphs'),
      facts: filas(form, 'children.facts').map((f) => ({
        label: f.uno('label'),
        value: f.uno('value'),
      })),
    },
    trial: {
      label: t('trial.label'),
      title: t('trial.title'),
      text: t('trial.text'),
      note: t('trial.note'),
      ctaLabel: t('trial.ctaLabel'),
      formUrl: t('trial.formUrl'),
      directLabel: t('trial.directLabel'),
      closeLabel: t('trial.closeLabel'),
    },
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
 * Publicar portugues: alinear los otros tres, validarlos, y escribir en un commit lo que
 * cambio. Si un idioma no valida despues de propagar no se publica **ninguno** — es lo
 * que impide dejar la estructura a medio camino.
 */
async function guardarPortugues(datosPt: unknown, form: FormData): Promise<Guardado> {
  const cambios: { ruta: string; contenido: string }[] = []

  for (const locale of LOCALES) {
    const actual = await leerContenido(ruta(locale))
    if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

    const datos =
      locale === 'pt'
        ? datosPt
        : propagarEstructura(datosPt, JSON.parse(actual.contenido), LISTAS_AULAS)

    const validado = classesSchema.safeParse(datos)
    if (!validado.success) return invalido(erroresDe(validado.error), `En ${locale}: `)

    const contenido = serializar(validado.data)
    if (contenido !== actual.contenido) cambios.push({ ruta: ruta(locale), contenido })
  }

  if (cambios.length === 0) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicarVarios({
    archivos: cambios,
    mensaje: `contenido: Aulas desde el backoffice (${cambios.length} archivos)`,
  })

  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()
  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

/** Publicar es/fr/en: solo su archivo, y sin poder cambiar el largo de ninguna lista. */
async function guardarTraduccion(locale: Locale, datos: unknown, form: FormData): Promise<Guardado> {
  const actual = await leerContenido(ruta(locale))
  if (actual.sha !== texto(form, `sha.${locale}`)) return conflicto()

  // La estructura la manda el portugues: se alinea contra el publicado antes de validar,
  // asi que ni una fila de mas ni de menos puede entrar por esta puerta.
  const pt = JSON.parse((await leerContenido(ruta('pt'))).contenido)
  const alineado = propagarEstructura(pt, datos, LISTAS_AULAS)

  const validado = classesSchema.safeParse(alineado)
  if (!validado.success) return invalido(erroresDe(validado.error))

  const contenido = serializar(validado.data)
  if (contenido === actual.contenido) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicar({
    ruta: ruta(locale),
    contenido,
    mensaje: `contenido: Aulas en ${locale} desde el backoffice`,
    sha: actual.sha,
  })

  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()
  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

export async function guardarAulas(form: FormData, locale: Locale): Promise<Guardado> {
  const datos = aulasDesdeForm(form)

  if (locale === 'pt') {
    const validado = classesSchema.safeParse(datos)
    if (!validado.success) return invalido(erroresDe(validado.error))
  }

  try {
    return locale === 'pt'
      ? await guardarPortugues(datos, form)
      : await guardarTraduccion(locale, datos, form)
  } catch (error) {
    // El repositorio es un servicio remoto: sin token o con GitHub caido no se publica,
    // pero eso es un aviso, no un 500 del backoffice.
    const detalle = error instanceof Error ? error.message : String(error)
    return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
  }
}
