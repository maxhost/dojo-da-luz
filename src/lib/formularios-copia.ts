import type { Formulario } from './formularios.ts'
import {
  idDesdeNombre,
  leerFormularios,
  publicarLista,
  sinRepositorio,
  type Guardado,
} from './formularios-edicion.ts'

/**
 * La copia de un formulario (spec 0059): todo igual —campos, opciones y los cuatro idiomas—
 * salvo el nombre, el id y el estado. Nace activa pero sin ninguna pagina que la use, asi
 * que el sitio publico no cambia hasta que alguien la asigne.
 *
 * Los ids de campos y opciones se conservan: son locales a cada formulario, y mantenerlos
 * es lo que deja las traducciones alineadas con su campo.
 */
export function copiaDe(original: Formulario, idsExistentes: string[]): Formulario {
  const nombre = `${original.nombre} (copia)`
  return {
    ...structuredClone(original),
    id: idDesdeNombre(nombre, idsExistentes),
    nombre,
    estado: 'activo',
  }
}

/**
 * Publica la copia al momento, por el mismo camino que el alta. El `sha` es el del listado:
 * un doble clic manda el segundo POST con el `sha` ya viejo y da conflicto, no dos copias.
 */
export async function copiarFormulario(id: string, sha: string): Promise<Guardado> {
  try {
    const { forms } = await leerFormularios()
    const original = forms.find((f) => f.id === id)
    if (!original) {
      return { ok: false, estado: 404, aviso: 'Ese formulario ya no existe.', errores: {} }
    }

    const copia = copiaDe(original, forms.map((f) => f.id))

    return await publicarLista(
      [...forms, copia],
      sha,
      `contenido: copia del formulario ${id} desde el backoffice`,
      copia.id,
    )
  } catch (error) {
    return sinRepositorio(error)
  }
}
