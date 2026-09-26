import { teacherSchema } from './schemas'
import { filas, texto } from './forms'
import type { Locale } from './i18n'
import { LISTAS_PROFESSOR, SEMBRADOS_PROFESSOR } from './traduccion'
import type { Pagina } from './editor-pagina'

/**
 * `/professor-pablo-duran` como descriptor (spec 0043). La publicacion es generica y vive
 * en `editor-pagina.ts`; aca queda lo propio de esta pagina.
 *
 * Es la novena y ultima: con esta no queda ninguna pagina de contenido sin editor.
 *
 * Lo propio de esta: **cinco listas de largo libre y una sola foto**. `milestones` es el
 * Percurso —el motivo de la spec—, y las otras cuatro son parrafos y las cajas del linaje
 * (ADR-0039).
 *
 * El archivo se llama `teacher.json` y la pantalla `professor`: el contenido esta en
 * ingles desde el scaffold y la URL publica en portugues. No se renombra ninguno de los
 * dos — mover once archivos de contenido por consistencia de nombres es un commit de
 * riesgo sin ningun efecto visible.
 */

export const TITULO = 'Professor'
export const RUTA_BO = '/admin/paginas/professor'

export const ruta = (locale: Locale) => `content/${locale}/teacher.json`

export const paginaProfessor: Pagina = {
  clave: 'teacher',
  titulo: TITULO,
  rutaBO: RUTA_BO,
  archivo: ruta,
  schema: teacherSchema,
  desdeForm: professorDesdeForm,
  listas: LISTAS_PROFESSOR,
  sembrados: SEMBRADOS_PROFESSOR,
}

/** Una tabla de una sola columna: la fila **es** el texto. */
function columna(form: FormData, prefijo: string): string[] {
  return filas(form, prefijo).map((fila) => fila.uno('valor'))
}

/**
 * `FormData` → el objeto que valida `teacherSchema`.
 *
 * Las filas vacias **no se descartan**: las rechaza el schema y el error se ve en la fila.
 * Un hito sin año o sin texto es un error, no una fila que desaparece en silencio.
 */
export function professorDesdeForm(form: FormData): unknown {
  const t = (campo: string) => texto(form, campo)

  return {
    seo: { title: t('seo.title'), description: t('seo.description') },
    eyebrow: t('eyebrow'),
    title: t('title'),
    lead: t('lead'),
    credentials: t('credentials'),
    photo: t('photo'),
    photoAlt: t('photoAlt'),
    biographyTitle: t('biographyTitle'),
    biography: columna(form, 'biography'),
    milestonesTitle: t('milestonesTitle'),
    milestones: filas(form, 'milestones').map((f) => ({
      year: f.uno('year'),
      title: f.uno('title'),
      text: f.uno('text'),
    })),
    formationTitle: t('formationTitle'),
    formation: columna(form, 'formation'),
    teachingTitle: t('teachingTitle'),
    teaching: columna(form, 'teaching'),
    lineageTitle: t('lineageTitle'),
    lineageIntro: t('lineageIntro'),
    lineage: filas(form, 'lineage').map((f) => ({
      name: f.uno('name'),
      role: f.uno('role'),
      text: f.uno('text'),
    })),
    dojoCta: {
      title: t('dojoCta.title'),
      text: t('dojoCta.text'),
      label: t('dojoCta.label'),
    },
  }
}
