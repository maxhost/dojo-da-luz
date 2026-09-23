import { erroresDe, resumenDeErrores, texto } from './forms.ts'
import { formularioSchema, formulariosSchema, type Formulario } from './formularios.ts'
import { formularioDesdeForm, nuevoId } from './formularios-parse.ts'
import { isLocale } from './i18n.ts'
import { leerContenido, publicar, serializar } from './publish.ts'

/**
 * Alta, edicion y archivado de formularios (spec 0050). Mismo molde que los dojos: validar
 * con el schema del build, respetar el `sha` de quien leyo el archivo y recien entonces
 * commitear. Lo que cambia es que aca los cuatro idiomas viven en el **mismo** archivo, asi
 * que publicar una traduccion no toca la estructura de nadie.
 */

export const RUTA_FORMS = 'content/forms.json'

/** Las cuatro paginas cuyo CTA apunta a un formulario propio (ADR-0046). */
export const PAGINAS_CON_FORMULARIO = [
  { archivo: 'home', titulo: 'Home', campo: 'threshold.formId' },
  { archivo: 'classes', titulo: 'Aulas', campo: 'trial.formId' },
  { archivo: 'adults', titulo: 'Adultos', campo: 'formId' },
  { archivo: 'children', titulo: 'Crianças', campo: 'formId' },
  { archivo: 'other-arts', titulo: 'Outras artes · Shiatsu', campo: 'activities.0.formId' },
  { archivo: 'other-arts', titulo: 'Outras artes · Iaido', campo: 'activities.1.formId' },
  { archivo: 'other-arts', titulo: 'Outras artes · Tai Chi Chuan', campo: 'activities.2.formId' },
] as const

export type Guardado =
  | { ok: true; id: string }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

function sinRepositorio(error: unknown): Guardado {
  const detalle = error instanceof Error ? error.message : String(error)
  return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
}

/**
 * La lista para los selectores de las paginas. Se lee del repositorio y no del bundle: un
 * formulario creado hace un minuto todavia no esta en el sitio construido, pero si tiene
 * que poder elegirse. Un repositorio inalcanzable devuelve una lista vacia: el editor de la
 * pagina ya avisa por su cuenta y esto no puede tumbarlo.
 */
export async function formulariosParaElegir(): Promise<
  { id: string; nombre: string; estado: 'activo' | 'archivado' }[]
> {
  try {
    const { forms } = await leerFormularios()
    return forms.map(({ id, nombre, estado }) => ({ id, nombre, estado }))
  } catch {
    return []
  }
}

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso:
      'Alguien editó los formularios mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

export async function leerFormularios(): Promise<{ forms: Formulario[]; sha: string }> {
  const archivo = await leerContenido(RUTA_FORMS)
  const datos = JSON.parse(archivo.contenido) as { forms: Formulario[] }
  return { forms: datos.forms, sha: archivo.sha }
}

/**
 * Un id legible derivado del nombre, con sufijo solo si ya existe. No se muestra ni se
 * edita: se ve nada mas en la URL del backoffice y en el `formId` que guarda cada pagina.
 */
export function idDesdeNombre(nombre: string, existentes: string[]): string {
  const base =
    nombre
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'formulario'

  return existentes.includes(base) ? nuevoId(base) : base
}

/** Escribe la lista entera: valida el archivo completo, no solo el formulario tocado. */
async function publicarLista(
  forms: Formulario[],
  sha: string,
  mensaje: string,
  id: string,
): Promise<Guardado> {
  const validado = formulariosSchema.safeParse({ forms })
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return { ok: false, estado: 422, aviso: resumenDeErrores(errores), errores }
  }

  const contenido = serializar(validado.data)
  const actual = await leerContenido(RUTA_FORMS)
  if (actual.sha !== sha) return conflicto()
  if (actual.contenido === contenido) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicar({ ruta: RUTA_FORMS, contenido, mensaje, sha: actual.sha })
  if (resultado.ok) return { ok: true, id }
  if (resultado.motivo === 'conflicto') return conflicto()

  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

/**
 * `idOriginal` null = alta. El alta siempre ocurre en portugues: la estructura no se crea
 * desde una traduccion (ADR-0046).
 */
export async function guardarFormulario(
  form: FormData,
  idOriginal: string | null,
): Promise<Guardado> {
  try {
    return await guardar(form, idOriginal)
  } catch (error) {
    return sinRepositorio(error)
  }
}

async function guardar(form: FormData, idOriginal: string | null): Promise<Guardado> {
  const idioma = texto(form, 'idioma')
  if (!isLocale(idioma)) {
    return { ok: false, estado: 400, aviso: 'Idioma desconocido.', errores: {} }
  }

  const { forms, sha } = await leerFormularios()

  // El `sha` del formulario es el de cuando se abrio la pagina: si no coincide, alguien
  // publico en el medio y esta lista ya no es la que el cliente vio.
  if (sha !== texto(form, 'sha')) return conflicto()

  const publicado = idOriginal === null ? null : (forms.find((f) => f.id === idOriginal) ?? null)

  if (idOriginal !== null && publicado === null) {
    return { ok: false, estado: 404, aviso: 'Ese formulario ya no existe.', errores: {} }
  }

  if (idOriginal === null && idioma !== 'pt') {
    return {
      ok: false,
      estado: 400,
      aviso: 'Un formulario nuevo se crea en portugués: la estructura es suya.',
      errores: {},
    }
  }

  const idNuevo = idDesdeNombre(texto(form, 'nombre'), forms.map((f) => f.id))
  const propuesto = formularioDesdeForm(form, idioma, publicado, idNuevo)

  const validado = formularioSchema.safeParse(propuesto)
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return {
      ok: false,
      estado: 422,
      aviso: `No se publicó nada. ${resumenDeErrores(errores)}`,
      errores,
    }
  }

  const formulario = validado.data
  const lista =
    publicado === null
      ? [...forms, formulario]
      : forms.map((f) => (f.id === publicado.id ? formulario : f))

  const mensaje =
    publicado === null
      ? `contenido: alta del formulario ${formulario.nombre} desde el backoffice`
      : idioma === 'pt'
        ? `contenido: formulario ${formulario.nombre} desde el backoffice`
        : `contenido: formulario ${formulario.nombre} en ${idioma} desde el backoffice`

  return publicarLista(lista, sha, mensaje, formulario.id)
}

export async function cambiarEstado(
  id: string,
  estado: 'activo' | 'archivado',
  sha: string,
): Promise<Guardado> {
  try {
    const { forms } = await leerFormularios()
    if (!forms.some((f) => f.id === id)) {
      return { ok: false, estado: 404, aviso: 'Ese formulario ya no existe.', errores: {} }
    }

    if (estado === 'archivado') {
      const usos = (await referenciasPorFormulario(true))[id] ?? []
      if (usos.length > 0) {
        return {
          ok: false,
          estado: 409,
          aviso: `No se puede archivar: primero asigná otro formulario en ${usos.join(', ')}.`,
          errores: {},
        }
      }
    }

    const lista = forms.map((f) => (f.id === id ? { ...f, estado } : f))
    const verbo = estado === 'archivado' ? 'archiva' : 'reactiva'

    return await publicarLista(
      lista,
      sha,
      `contenido: se ${verbo} el formulario ${id} desde el backoffice`,
      id,
    )
  } catch (error) {
    return sinRepositorio(error)
  }
}

function leerRuta(datos: unknown, ruta: string): unknown {
  return ruta
    .split('.')
    .reduce<unknown>(
      (actual, clave) =>
        actual && typeof actual === 'object' ? (actual as Record<string, unknown>)[clave] : undefined,
      datos,
    )
}

/**
 * Que paginas apuntan hoy a cada formulario. Se lee el **portugues**: el `formId` se siembra
 * desde ahi a los otros tres idiomas, asi que las cuatro copias dicen lo mismo.
 *
 * Tambien protege el archivado: un formulario asignado no se puede archivar.
 *
 * Se leen los cuatro archivos **una vez** y se indexa al reves. Preguntar por formulario
 * seria cuatro lecturas del repositorio por cada fila del listado.
 */
export async function referenciasPorFormulario(estricto = false): Promise<Record<string, string[]>> {
  const mapa: Record<string, string[]> = {}
  const contenidos = new Map<string, unknown>()

  for (const pagina of PAGINAS_CON_FORMULARIO) {
    try {
      let datos = contenidos.get(pagina.archivo)
      if (!datos) {
        const archivo = await leerContenido(`content/pt/${pagina.archivo}.json`)
        datos = JSON.parse(archivo.contenido)
        contenidos.set(pagina.archivo, datos)
      }
      const id = leerRuta(datos, pagina.campo)
      if (typeof id === 'string' && id) (mapa[id] ??= []).push(pagina.titulo)
    } catch (error) {
      if (estricto) throw error
      // Un archivo ilegible no puede impedir que se vea el listado: se omite.
    }
  }

  return mapa
}
