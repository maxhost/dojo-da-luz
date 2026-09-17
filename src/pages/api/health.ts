import type { APIRoute } from 'astro'
import { sql } from '../../lib/db'

// Unica ruta con runtime del proyecto. El resto es HTML estatico.
export const prerender = false

/**
 * Oraculo del deploy: prueba que la funcion serverless corre y que Neon responde.
 * Sin esto, "el deploy anda" seria una suposicion.
 */
export const GET: APIRoute = async () => {
  const empezado = Date.now()

  try {
    await sql()`select 1`
    return Response.json(
      { ok: true, db: 'up', ms: Date.now() - empezado },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    return Response.json(
      { ok: false, db: 'down', error: error instanceof Error ? error.message : String(error) },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }
}
