// Crea o repone el unico admin del backoffice (spec 0019).
//
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:seed
//
// La contraseña nunca toca el repo: entra por entorno y sale como hash scrypt.
// Mientras no exista la spec 0022 (reset por email), este script ES la recuperacion.

import { neon } from '@neondatabase/serverless'
import { hashPassword } from '../src/lib/auth.ts'

const url = process.env.DATABASE_URL
const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ''

function abortar(mensaje) {
  console.error(`admin-seed: ${mensaje}`)
  process.exit(1)
}

if (!url) abortar('falta DATABASE_URL')
if (!email.includes('@')) abortar('falta ADMIN_EMAIL o no es un email')
if (password.length < 12) abortar('ADMIN_PASSWORD tiene que tener 12 caracteres o mas')

const sql = neon(url)
const hash = await hashPassword(password)

await sql`
  insert into admin (email, password_hash) values (${email}, ${hash})
  on conflict (solo_uno) do update
    set email = excluded.email,
        password_hash = excluded.password_hash,
        actualizado_en = now()
`

// Cambiar la contraseña tiene que echar al que estuviera dentro.
const borradas = await sql`delete from admin_session returning token_sha256`

console.log(`admin-seed: ok — ${email}; ${borradas.length} sesion(es) cerradas`)
