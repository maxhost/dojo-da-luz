import { otherArtsSchema } from './schemas'
import { filas, renglones, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_OUTRAS_ARTES, SEMBRADOS_OUTRAS_ARTES } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * `/outras-artes` como descriptor (spec 0040). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Dos cosas que no se parecen a las otras cinco:
 *
 * - **Cada arte trae tres listas adentro** —parrafos, beneficios, horarios— y las tres
 *   llegan en un solo campo, una entrada por renglon (ADR-0033).
 * - **`formUrl` no se edita** (spec 0035): viaja en un `hidden` para no perderse al
 *   guardar, y ademas se siembra desde portugues.
 */

export const TITULO = 'Outras artes'
export const RUTA_BO = '/admin/paginas/outras-artes'

export const ruta = (locale: Locale) => `content/${locale}/other-arts.json`

export const paginaOutrasArtes: Pagina = {
  clave: 'otherArts',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: otherArtsSchema,
  desdeForm: outrasArtesDesdeForm,
  listas: LISTAS_OUTRAS_ARTES,
  sembrados: SEMBRADOS_OUTRAS_ARTES,
}

/**
 * `FormData` → el objeto que valida `otherArtsSchema`.
 *
 * `teacher` es el unico campo opcional de la pagina: vacio significa que ese arte no
 * anuncia profesor, y la clave **no se escribe** en vez de guardarse como cadena vacia,
 * que el schema rechazaria.
 */
export function outrasArtesDesdeForm(form: FormData): unknown {
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
    activities: filas(form, 'activities').map((f) => {
      const profesor = f.uno('teacher')
      return {
        name: f.uno('name'),
        subtitle: f.uno('subtitle'),
        photo: f.uno('photo'),
        photoAlt: f.uno('photoAlt'),
        paragraphs: renglones(f.uno('paragraphs')),
        benefits: renglones(f.uno('benefits')),
        schedule: renglones(f.uno('schedule')),
        ...(profesor ? { teacher: profesor } : {}),
        trialLabel: f.uno('trialLabel'),
        formUrl: f.uno('formUrl') || null,
        directLabel: f.uno('directLabel'),
        closeLabel: f.uno('closeLabel'),
      }
    }),
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
  }
}
