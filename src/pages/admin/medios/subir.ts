import type { APIRoute } from 'astro'
import { subirImagen, type Variante } from '../../../lib/medios'

export const prerender = false

/**
 * Subida de una imagen (spec 0030). Responde JSON porque quien llama es la isla del campo
 * de imagen: sube sin recargar, asi no se pierde lo que haya escrito en el formulario.
 *
 * El guard de sesion es el del middleware: sin cookie esto ni se ejecuta.
 */
export const POST: APIRoute = async ({ request }) => {
  const json = (cuerpo: unknown, status: number) =>
    new Response(JSON.stringify(cuerpo), {
      status,
      headers: { 'content-type': 'application/json' },
    })

  let archivo: unknown
  let variante: Variante = 'foto'
  try {
    const form = await request.formData()
    archivo = form.get('archivo')
    // Un valor desconocido cae en 'foto': el ancho lo decide el servidor, no el cliente.
    if (form.get('variante') === 'icono') variante = 'icono'
  } catch {
    return json({ motivo: 'No se pudo leer el archivo.' }, 400)
  }

  if (!(archivo instanceof File)) return json({ motivo: 'Falta el archivo.' }, 400)

  const resultado = await subirImagen(archivo, variante)
  if (!resultado.ok) return json({ motivo: resultado.motivo }, 422)

  return json({ url: resultado.url, bytes: resultado.bytes, reusado: resultado.reusado }, 200)
}
