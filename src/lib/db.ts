import { neon } from '@neondatabase/serverless'

/**
 * Cliente HTTP de Neon. Sin pool: cada invocacion serverless es un proceso distinto
 * y un pool no sobrevive entre invocaciones.
 *
 * `process.env` es lo que existe en el runtime de Vercel; `import.meta.env` es lo que
 * carga Vite desde .env en `astro dev`. Hacen falta los dos.
 */
export function sql() {
  const url = process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL
  if (!url) throw new Error('Falta DATABASE_URL')
  return neon(url)
}
