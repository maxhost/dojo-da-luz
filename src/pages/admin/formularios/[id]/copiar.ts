import type { APIRoute } from 'astro'
import { copiarFormulario } from '../../../../lib/formularios-copia'

export const prerender = false

/**
 * Copiar un formulario (spec 0059). Como Archivar, es un POST propio porque se dispara desde
 * el listado. La copia se publica en el acto y se abre su editor: lo que sigue es editarla.
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const form = await request.formData()
  const resultado = await copiarFormulario(params.id!, String(form.get('sha') ?? ''))

  if (resultado.ok) return redirect(`/admin/formularios/${resultado.id}?copiado=si`, 303)

  return redirect(`/admin/formularios?${new URLSearchParams({ fallo: resultado.aviso })}`, 303)
}
