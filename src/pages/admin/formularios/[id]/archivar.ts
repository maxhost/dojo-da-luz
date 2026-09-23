import type { APIRoute } from 'astro'
import { cambiarEstado } from '../../../../lib/formularios-edicion'

export const prerender = false

/**
 * Archivar y reactivar un formulario (spec 0050). Es un POST propio y no un campo del
 * editor porque se dispara desde el listado, sobre un formulario que no se esta editando.
 *
 * El servicio rechaza el archivado si alguna pagina todavia usa el formulario.
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = params.id!
  const form = await request.formData()
  const estado = form.get('estado') === 'archivado' ? 'archivado' : 'activo'

  const resultado = await cambiarEstado(id, estado, String(form.get('sha') ?? ''))

  const query = new URLSearchParams(
    resultado.ok
      ? { ok: `Formulario ${estado === 'archivado' ? 'archivado' : 'reactivado'}.` }
      : { fallo: resultado.aviso },
  )

  return redirect(`/admin/formularios?${query}`, 303)
}
