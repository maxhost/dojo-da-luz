import { dojoSchema, dojosSchema, type Dojo } from './dojos'
import { dojoDesdeForm, erroresDe, resumenDeErrores } from './forms'
import { leerContenido, publicar, serializar } from './publish'

/**
 * Alta, edicion y archivado de dojos (spec 0021). Vive aca y no en las paginas porque las
 * tres operaciones comparten lo unico delicado: validar con el schema del build, respetar
 * el `sha` de quien leyo el archivo y recien entonces commitear.
 */

export const RUTA_DOJOS = 'content/dojos.json'

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

/**
 * El repositorio es un servicio remoto: puede faltar el token, caerse GitHub o expirar el
 * PAT. Nada de eso es un 500 del backoffice — es un aviso que dice que no se publico.
 */
function sinRepositorio(error: unknown): Guardado {
  const detalle = error instanceof Error ? error.message : String(error)
  return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
}

export async function leerDojos(): Promise<{ dojos: Dojo[]; sha: string }> {
  const archivo = await leerContenido(RUTA_DOJOS)
  const datos = JSON.parse(archivo.contenido) as { dojos: Dojo[] }
  return { dojos: datos.dojos, sha: archivo.sha }
}

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso: 'Alguien editó los dojos mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

/** Escribe la lista entera: valida el archivo completo, no solo el dojo tocado. */
async function publicarLista(dojos: Dojo[], sha: string, mensaje: string): Promise<Guardado> {
  const validado = dojosSchema.safeParse({ dojos })
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return { ok: false, estado: 422, aviso: resumenDeErrores(errores), errores }
  }

  const contenido = serializar(validado.data)
  const actual = await leerContenido(RUTA_DOJOS)
  if (actual.sha !== sha) return conflicto()
  if (actual.contenido === contenido) {
    return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
  }

  const resultado = await publicar({ ruta: RUTA_DOJOS, contenido, mensaje, sha: actual.sha })
  if (resultado.ok) return { ok: true }
  if (resultado.motivo === 'conflicto') return conflicto()

  return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
}

/**
 * `slugOriginal` null = alta. El slug no se renombra: es la clave de la ficha y cambiarlo
 * en una edicion seria indistinguible de crear otra.
 */
export async function guardarDojo(
  form: FormData,
  slugOriginal: string | null,
): Promise<Guardado> {
  try {
    return await guardar(form, slugOriginal)
  } catch (error) {
    return sinRepositorio(error)
  }
}

async function guardar(form: FormData, slugOriginal: string | null): Promise<Guardado> {
  const estado = form.get('estado') === 'archivado' ? 'archivado' : 'activo'
  const propuesto = dojoDesdeForm(form, estado)

  const validado = dojoSchema.safeParse(propuesto)
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return {
      ok: false,
      estado: 422,
      aviso: `No se publicó nada. ${resumenDeErrores(errores)}`,
      errores,
    }
  }

  const dojo = validado.data
  const { dojos, sha } = await leerDojos()

  // El `sha` del formulario es el de cuando se abrio la pagina: si no coincide, alguien
  // publico en el medio y esta lista ya no es la que el cliente vio.
  if (sha !== String(form.get('sha') ?? '')) return conflicto()

  if (slugOriginal === null && dojos.some((d) => d.slug === dojo.slug)) {
    return {
      ok: false,
      estado: 422,
      aviso: 'Ya existe un dojo con ese identificador.',
      errores: { slug: 'ya existe un dojo con este slug' },
    }
  }

  if (slugOriginal !== null && !dojos.some((d) => d.slug === slugOriginal)) {
    return { ok: false, estado: 404, aviso: 'Ese dojo ya no existe.', errores: {} }
  }

  const lista =
    slugOriginal === null
      ? [...dojos, dojo]
      : dojos.map((d) => (d.slug === slugOriginal ? { ...dojo, slug: slugOriginal } : d))

  const mensaje =
    slugOriginal === null
      ? `contenido: alta del dojo ${dojo.slug} desde el backoffice`
      : `contenido: edicion del dojo ${slugOriginal} desde el backoffice`

  return publicarLista(lista, sha, mensaje)
}

export async function cambiarEstado(
  slug: string,
  estado: 'activo' | 'archivado',
  sha: string,
): Promise<Guardado> {
  try {
    return await cambiar(slug, estado, sha)
  } catch (error) {
    return sinRepositorio(error)
  }
}

async function cambiar(
  slug: string,
  estado: 'activo' | 'archivado',
  sha: string,
): Promise<Guardado> {
  const { dojos } = await leerDojos()
  if (!dojos.some((d) => d.slug === slug)) {
    return { ok: false, estado: 404, aviso: 'Ese dojo ya no existe.', errores: {} }
  }

  const lista = dojos.map((d) => (d.slug === slug ? { ...d, estado } : d))
  const verbo = estado === 'archivado' ? 'archiva' : 'reactiva'

  return publicarLista(lista, sha, `contenido: se ${verbo} el dojo ${slug} desde el backoffice`)
}
