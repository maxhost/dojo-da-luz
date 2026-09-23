// Aplica una migracion de `db/migrations` contra Neon.
//
//   npm run db:migrate -- db/migrations/0003_form_rate_limit.sql
//
// Las migraciones son idempotentes (`create table if not exists`), asi que volver a
// correr una ya aplicada no rompe nada. El script no imprime `DATABASE_URL` ni ninguna
// otra variable: solo dice que sentencia corrio y con que resultado.

import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
const archivo = process.argv[2]

function abortar(mensaje) {
  console.error(`migrar: ${mensaje}`)
  process.exit(1)
}

if (!url) abortar('falta DATABASE_URL')
if (!archivo) abortar('falta la ruta de la migracion')

const contenido = await readFile(archivo, 'utf8')

// Se quitan los comentarios antes de cortar: un `;` dentro de un comentario partiria una
// sentencia al medio.
const sentencias = contenido
  .split('\n')
  .filter((linea) => !linea.trimStart().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

const sql = neon(url)

for (const sentencia of sentencias) {
  const resumen = sentencia.replace(/\s+/g, ' ').slice(0, 72)
  await sql.query(sentencia)
  console.log(`  ok  ${resumen}`)
}

console.log(`migrar: ${sentencias.length} sentencias aplicadas desde ${archivo}`)
