import { contactSchema } from './schemas'
import { renglones, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_CONTACTOS, SEMBRADOS_CONTACTOS } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * `/contactos` como descriptor (spec 0042). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Es la unica de las ocho **sin listas de largo libre y sin fotos**: las sedes salen de la
 * entidad de dojos (ADR-0038) y lo unico que queda es como se llega a cada una.
 */

export const TITULO = 'Contactos'
export const RUTA_BO = '/admin/paginas/contactos'

export const ruta = (locale: Locale) => `content/${locale}/contact.json`

export const paginaContactos: Pagina = {
  clave: 'contact',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: contactSchema,
  desdeForm: contactosDesdeForm,
  listas: LISTAS_CONTACTOS,
  sembrados: SEMBRADOS_CONTACTOS,
}

/**
 * Las lineas de transporte, indexadas por el `slug` del dojo.
 *
 * Se arma recorriendo **lo que trae el formulario** y no la lista de dojos activos, y es a
 * proposito: el formulario manda tambien, en campos ocultos, las lineas de los dojos
 * archivados. Sin eso, publicar `/contactos` una vez borraria las de Encarnação, y
 * reactivar ese dojo lo devolveria a la pagina sin saber como se llega.
 *
 * Un dojo al que se le borran todas las lineas se queda sin clave, no con una lista vacia:
 * la pagina pinta su tarjeta igual, sin la lista.
 *
 * **Las claves salen ordenadas alfabeticamente** y no en el orden en que el formulario las
 * mando: los campos ocultos de los dojos archivados se pintan antes que los visibles, asi
 * que sin ordenar, archivar un dojo reescribiria el bloque entero en el diff del commit sin
 * que hubiera cambiado ni una linea. El orden canonico es del schema (ADR-0025), y un
 * `record` no lo fija solo.
 */
function transporteDesdeForm(form: FormData): Record<string, string[]> {
  const transporte: [string, string[]][] = []

  for (const [clave, valor] of form.entries()) {
    const slug = /^transport\.(.+)$/.exec(clave)?.[1]
    if (!slug) continue

    const lineas = renglones(String(valor))
    if (lineas.length > 0) transporte.push([slug, lineas])
  }

  return Object.fromEntries(transporte.sort(([a], [b]) => a.localeCompare(b)))
}

/** `FormData` → el objeto que valida `contactSchema`. */
export function contactosDesdeForm(form: FormData): unknown {
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
    transport: transporteDesdeForm(form),
    privateTitle: t('privateTitle'),
    privateText: t('privateText'),
    formTitle: t('formTitle'),
    fields: {
      name: t('fields.name'),
      email: t('fields.email'),
      subject: t('fields.subject'),
      message: t('fields.message'),
      submit: t('fields.submit'),
      pending: t('fields.pending'),
    },
  }
}
