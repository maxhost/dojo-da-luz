import { aikidoSchema } from './schemas'
import { filas, renglones, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_AIKIDO, SEMBRADOS_AIKIDO } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * `/aikido` como descriptor (spec 0037). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Lo unico que no se parece a Adultos: **los parrafos de cada seccion llegan en un solo
 * campo, un parrafo por renglon** (ADR-0033), porque son una lista dentro de una fila de
 * otra lista.
 */

export const TITULO = 'Aikido'
export const RUTA_BO = '/admin/paginas/aikido'

export const ruta = (locale: Locale) => `content/${locale}/aikido.json`

export const paginaAikido: Pagina = {
  clave: 'aikido',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: aikidoSchema,
  desdeForm: aikidoDesdeForm,
  listas: LISTAS_AIKIDO,
  sembrados: SEMBRADOS_AIKIDO,
}

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `aikidoSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Una seccion sin titulo o sin un solo parrafo es un error, no una fila que desaparece en
 * silencio.
 */
export function aikidoDesdeForm(form: FormData): unknown {
  const t = (campo: string) => texto(form, campo)

  return {
    seo: { title: t('seo.title'), description: t('seo.description') },
    chrome: {
      caption: t('chrome.caption'),
      menuLabel: t('chrome.menuLabel'),
      skipLink: t('chrome.skipLink'),
    },
    eyebrow: t('eyebrow'),
    title: t('title'),
    lead: t('lead'),
    heroPhoto: t('heroPhoto'),
    sections: filas(form, 'sections').map((f) => ({
      title: f.uno('title'),
      paragraphs: renglones(f.uno('paragraphs')),
    })),
    founder: {
      label: t('founder.label'),
      title: t('founder.title'),
      years: t('founder.years'),
      paragraphs: columna(form, 'founder.paragraphs'),
      photo: t('founder.photo'),
      photoAlt: t('founder.photoAlt'),
    },
    audienceTitle: t('audienceTitle'),
    adultsLabel: t('adultsLabel'),
    childrenLabel: t('childrenLabel'),
  }
}
