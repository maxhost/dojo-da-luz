import { eventsSchema } from './schemas.ts'
import { filas, texto } from './forms.ts'
import type { Locale } from './i18n.ts'
import { LISTAS_EVENTOS, SEMBRADOS_EVENTOS } from './traduccion.ts'
import type { Pagina } from './editor-pagina.ts'

/**
 * `/eventos` como descriptor (spec 0039). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Lo unico que no se parece a las otras cuatro: **la lista puede quedar vacia**. No hay
 * nada especial que hacer para eso —el schema ya no tiene minimo— pero si hay un campo que
 * existe justamente para ese caso, `emptyText`, y se escribe siempre.
 */

export const TITULO = 'Eventos'
export const RUTA_BO = '/admin/paginas/eventos'

export const ruta = (locale: Locale) => `content/${locale}/events.json`

export const paginaEventos: Pagina = {
  clave: 'events',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: eventsSchema,
  desdeForm: eventosDesdeForm,
  listas: LISTAS_EVENTOS,
  sembrados: SEMBRADOS_EVENTOS,
}

/**
 * `FormData` → el objeto que valida `eventsSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Un evento sin titulo o sin foto es un error, no una fila que desaparece en silencio —
 * para que un evento no exista se lo quita, que es un boton con nombre.
 */
export function eventosDesdeForm(form: FormData): unknown {
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
    items: filas(form, 'items').map((f) => ({
      title: f.uno('title'),
      date: f.uno('date'),
      location: f.uno('location'),
      description: f.uno('description'),
      photo: f.uno('photo'),
      photoAlt: f.uno('photoAlt'),
    })),
    emptyText: t('emptyText'),
  }
}
