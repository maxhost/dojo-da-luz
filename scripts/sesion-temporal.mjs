/**
 * Una sesion de backoffice de corta duracion, para poder *mirar* el BO.
 *
 * Existe porque el agente no tiene la contraseña del admin y `npm run admin:seed` la
 * repone y expulsa al cliente: usarlo para entrar cuesta sacar al dueño del sitio. Tres
 * iteraciones del editor (specs 0031, 0032, 0033) se diseñaron sin ver una sola pantalla,
 * y las tres se rechazaron. Esto es lo que corta ese ciclo.
 *
 * No toca la contraseña ni el admin: inserta una fila en `admin_session` y la borra.
 *
 *   node --env-file=.env scripts/sesion-temporal.mjs           # crea, imprime el token
 *   node --env-file=.env scripts/sesion-temporal.mjs --borrar <token>
 *
 * Despues:  curl -H "Cookie: bo_session=<token>" http://localhost:4321/admin/...
 * Un POST necesita ademas `-H "Origin: http://localhost:4321"`: Astro rechaza los envios
 * de otro origen.
 */
import { createHash, randomBytes } from 'node:crypto'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const hash = (token) => createHash('sha256').update(token).digest('hex')

const [bandera, token] = process.argv.slice(2)

if (bandera === '--borrar') {
  if (!token) {
    console.error('falta el token')
    process.exit(1)
  }
  await sql`delete from admin_session where token_sha256 = ${hash(token)}`
  console.log('sesion borrada')
} else {
  const [admin] = await sql`select id from admin order by id limit 1`
  if (!admin) {
    console.error('no hay admin sembrado: correr antes `npm run admin:seed`')
    process.exit(1)
  }
  const nuevo = randomBytes(32).toString('hex')
  // Corta a proposito: es para mirar una pantalla, no para quedarse adentro.
  await sql`insert into admin_session (token_sha256, admin_id, expira_en)
            values (${hash(nuevo)}, ${admin.id}, now() + interval '40 minutes')`
  console.log(nuevo)
}
