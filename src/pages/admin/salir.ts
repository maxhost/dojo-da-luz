import type { APIRoute } from 'astro'
import { cerrarSesion } from '../../lib/admin'

export const prerender = false

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await cerrarSesion(cookies)
  return redirect('/admin/entrar', 302)
}
