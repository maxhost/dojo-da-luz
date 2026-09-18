import { defineMiddleware } from 'astro:middleware'
import { leerSesion } from './lib/admin'

/**
 * Guard unico del backoffice (ADR-0016). Va en middleware y no en cada pagina porque
 * una pagina nueva no puede quedar desprotegida por olvido.
 */

const SIN_SESION = new Set(['/admin/entrar'])
const ROBOTS = 'noindex, nofollow, noarchive'

function esRutaBo(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/')
}

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/+$/, '') || '/'
  if (!esRutaBo(path)) return next()

  // Con BO_HOST definida el BO solo existe en ese host: es el subdominio del ADR-0016.
  const boHost = process.env.BO_HOST ?? import.meta.env.BO_HOST
  if (boHost && context.request.headers.get('host') !== boHost) {
    return new Response('Not Found', { status: 404, headers: { 'X-Robots-Tag': ROBOTS } })
  }

  context.locals.admin = await leerSesion(context.cookies)

  const respuesta =
    context.locals.admin || SIN_SESION.has(path)
      ? await next()
      : context.redirect('/admin/entrar', 302)

  respuesta.headers.set('X-Robots-Tag', ROBOTS)
  return respuesta
})
