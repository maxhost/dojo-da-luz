import { schoolsSchema } from './schemas'
import { filas, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_ESCOLAS, SEMBRADOS_ESCOLAS } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * `/escolas` como descriptor (spec 0041). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Lo unico que no se parece a las otras seis: **la galeria no esta envuelta en un objeto**.
 * En esta pagina no lleva rotulo ni titulo (ADR-0037), asi que `gallery` es la lista misma
 * y no `gallery.items`.
 */

export const TITULO = 'Escolas'
export const RUTA_BO = '/admin/paginas/escolas'

export const ruta = (locale: Locale) => `content/${locale}/schools.json`

export const paginaEscolas: Pagina = {
  clave: 'schools',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: schoolsSchema,
  desdeForm: escolasDesdeForm,
  listas: LISTAS_ESCOLAS,
  sembrados: SEMBRADOS_ESCOLAS,
}

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `schoolsSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 */
export function escolasDesdeForm(form: FormData): unknown {
  const t = (campo: string) => texto(form, campo)

  return {
    seo: { title: t('seo.title'), description: t('seo.description') },
    eyebrow: t('eyebrow'),
    title: t('title'),
    lead: t('lead'),
    heroPhoto: t('heroPhoto'),
    introduction: {
      eyebrow: t('introduction.eyebrow'),
      title: t('introduction.title'),
      subtitle: t('introduction.subtitle'),
      paragraphs: columna(form, 'introduction.paragraphs'),
      photo: t('introduction.photo'),
      photoAlt: t('introduction.photoAlt'),
    },
    gallery: filas(form, 'gallery').map((f) =>
      f.uno('type') === 'youtube'
        ? { type: 'youtube', url: f.uno('url'), alt: f.uno('alt') }
        : { type: 'image', src: f.uno('src'), alt: f.uno('alt') },
    ),
  }
}
