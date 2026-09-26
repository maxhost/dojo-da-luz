import { dojoSchema } from './schemas.ts'
import { filas, renglones, texto } from './forms.ts'
import type { Locale } from './i18n.ts'
import { LISTAS_DOJO, SEMBRADOS_DOJO } from './traduccion.ts'
import type { Pagina } from './editor-pagina.ts'

/**
 * La pagina `/dojo` como descriptor (spec 0038). La publicacion es generica y vive en
 * `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * **No confundir con `dojos-edicion.ts`**, en plural: ese es la entidad —una sede, con su
 * direccion y sus horarios, en `content/dojos.json`— y no tiene nada que ver con esta
 * pantalla. Por eso este archivo y su formulario dicen "pagina".
 */

export const TITULO = 'O dojo'
export const RUTA_BO = '/admin/paginas/dojo'

export const ruta = (locale: Locale) => `content/${locale}/dojo.json`

export const paginaDojo: Pagina = {
  clave: 'dojo',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: dojoSchema,
  desdeForm: dojoDesdeForm,
  listas: LISTAS_DOJO,
  sembrados: SEMBRADOS_DOJO,
}

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `dojoSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Un profesor sin nombre o sin foto es un error, no una fila que desaparece en silencio.
 *
 * Los parrafos de cada profesor llegan en un solo campo, uno por renglon (ADR-0033): son
 * una lista dentro de una fila de otra lista.
 */
export function dojoDesdeForm(form: FormData): unknown {
  const t = (campo: string) => texto(form, campo)

  return {
    seo: { title: t('seo.title'), description: t('seo.description') },
    eyebrow: t('eyebrow'),
    title: t('title'),
    lead: t('lead'),
    heroPhoto: t('heroPhoto'),
    heroPhotoAlt: t('heroPhotoAlt'),
    spaceTitle: t('spaceTitle'),
    spaceParagraphs: columna(form, 'spaceParagraphs'),
    teacher: {
      label: t('teacher.label'),
      name: t('teacher.name'),
      credentials: t('teacher.credentials'),
      paragraphs: columna(form, 'teacher.paragraphs'),
      photo: t('teacher.photo'),
      photoAlt: t('teacher.photoAlt'),
      linkLabel: t('teacher.linkLabel'),
    },
    teachers: filas(form, 'teachers').map((f) => ({
      name: f.uno('name'),
      credentials: f.uno('credentials'),
      paragraphs: renglones(f.uno('paragraphs')),
      photo: f.uno('photo'),
      photoAlt: f.uno('photoAlt'),
      photoFoco: f.uno('photoFoco'),
    })),
    lineageTitle: t('lineageTitle'),
    lineage: filas(form, 'lineage').map((f) => ({
      name: f.uno('name'),
      role: f.uno('role'),
      text: f.uno('text'),
    })),
  }
}
