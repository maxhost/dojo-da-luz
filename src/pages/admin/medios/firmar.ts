import type { APIRoute } from 'astro'
import { firmarVideo } from '../../../lib/medios'

export const prerender = false

/**
 * Firma de subida prefirmada (spec 0047). Recibe solo metadatos —nunca el archivo, que es
 * justo lo que evita el corte de 4,5 MB de Vercel— y devuelve una URL `PUT` para que el
 * navegador suba directo a R2.
 *
 * El guard de sesion es el del middleware: sin cookie esto ni se ejecuta.
 */
export const POST: APIRoute = async ({ request }) => {
  const json = (cuerpo: unknown, status: number) =>
    new Response(JSON.stringify(cuerpo), {
      status,
      headers: { 'content-type': 'application/json' },
    })

  let datos: unknown
  try {
    datos = await request.json()
  } catch {
    return json({ motivo: 'No se pudo leer la petición.' }, 400)
  }

  const { contentType, tamano, hash } = (datos ?? {}) as Record<string, unknown>
  if (typeof contentType !== 'string' || typeof tamano !== 'number' || typeof hash !== 'string') {
    return json({ motivo: 'Faltan metadatos del archivo.' }, 400)
  }

  const resultado = await firmarVideo({ contentType, tamano, hash })
  if (!resultado.ok) return json({ motivo: resultado.motivo }, 422)

  return json(
    { url: resultado.url, urlPublica: resultado.urlPublica, requierePut: resultado.requierePut },
    200,
  )
}
