import type { AstroCookies } from 'astro'
import { sql } from './db'
import { newToken, tokenHash } from './auth'

/** Sesion y freno de login del backoffice (spec 0019, ADR-0015). */

export const SESSION_COOKIE = 'bo_session'
const DURACION_MS = 8 * 60 * 60 * 1000
const VENTANA_MINUTOS = 15
export const MAX_INTENTOS = 5

export type Admin = { id: string; email: string }
type AdminConHash = Admin & { password_hash: string }

export async function buscarAdminPorEmail(email: string): Promise<AdminConHash | null> {
  const filas = (await sql()`
    select id, email, password_hash from admin where email = ${email} limit 1
  `) as AdminConHash[]
  return filas[0] ?? null
}

export async function crearSesion(adminId: string, cookies: AstroCookies): Promise<void> {
  const token = newToken()
  const expira = new Date(Date.now() + DURACION_MS)

  await sql()`
    insert into admin_session (token_sha256, admin_id, expira_en)
    values (${tokenHash(token)}, ${adminId}, ${expira.toISOString()})
  `

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_MS / 1000,
  })
}

export async function leerSesion(cookies: AstroCookies): Promise<Admin | null> {
  const token = cookies.get(SESSION_COOKIE)?.value
  if (!token) return null

  const filas = (await sql()`
    select a.id, a.email
    from admin_session s
    join admin a on a.id = s.admin_id
    where s.token_sha256 = ${tokenHash(token)} and s.expira_en > now()
    limit 1
  `) as Admin[]

  return filas[0] ?? null
}

export async function cerrarSesion(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await sql()`delete from admin_session where token_sha256 = ${tokenHash(token)}`
  }
  cookies.delete(SESSION_COOKIE, { path: '/' })
}

export async function intentosFallidos(email: string): Promise<number> {
  const filas = (await sql()`
    select count(*)::int as n
    from admin_login_attempt
    where email = ${email}
      and exito = false
      and ocurrio_en > now() - make_interval(mins => ${VENTANA_MINUTOS})
  `) as { n: number }[]
  return filas[0]?.n ?? 0
}

export async function registrarIntento(email: string, exito: boolean): Promise<void> {
  await sql()`insert into admin_login_attempt (email, exito) values (${email}, ${exito})`
}
