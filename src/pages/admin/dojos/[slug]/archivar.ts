import type { APIRoute } from 'astro'
import { cambiarEstado } from '../../../../lib/dojos-edicion'

export const prerender = false

/**
 * Archivar y reactivar (spec 0021). Es un POST propio y no un campo del formulario porque
 * se dispara desde el listado, sobre una ficha que no se esta editando.
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const slug = params.slug!
  const form = await request.formData()
  const estado = form.get('estado') === 'archivado' ? 'archivado' : 'activo'

  const resultado = await cambiarEstado(slug, estado, String(form.get('sha') ?? ''))

  const query = new URLSearchParams(
    resultado.ok
      ? { ok: `Dojo ${estado === 'archivado' ? 'archivado' : 'reactivado'}.` }
      : { fallo: resultado.aviso },
  )

  return redirect(`/admin/dojos?${query}`, 303)
}
