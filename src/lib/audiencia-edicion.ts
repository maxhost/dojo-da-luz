import { audienceEntrySchema } from './schemas'
import { filas, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_AUDIENCIA, SEMBRADOS_AUDIENCIA } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * Las paginas de audiencia —Adultos y Criancas— como descriptor (spec 0036).
 *
 * La publicacion en si es generica y vive en `editor-pagina.ts`: portugues manda la
 * estructura (ADR-0030) y siembra las imagenes (ADR-0032). Aca queda lo unico que es
 * propio de estas dos paginas: como se llaman, que archivo escriben y como se lee su
 * formulario.
 *
 * Las dos comparten schema y formulario; lo unico que cambia es el archivo.
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

export function paginaAudiencia(clave: PaginaAudiencia): Pagina {
  return {
    clave,
    titulo: TITULO_AUDIENCIA[clave],
    rutaBO: RUTA_BO[clave],
    archivo: (locale) => ruta(clave, locale),
    schema: audienceEntrySchema,
    desdeForm: audienciaDesdeForm,
    listas: LISTAS_AUDIENCIA,
    sembrados: SEMBRADOS_AUDIENCIA,
  }
}

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
