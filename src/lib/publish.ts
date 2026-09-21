import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Publicacion del backoffice (spec 0021, ADR-0002): el contenido es JSON en el repo y el
 * BO lo escribe commiteando a `main`. Dos backends con la misma interfaz:
 *
 * - `github` cuando hay `GITHUB_TOKEN` — produccion. Un commit por guardado.
 * - `disco` cuando no lo hay — desarrollo local. Escribe el archivo y Astro recarga.
 *
 * El `sha` es el object id de git del blob en los dos casos, asi que el control de
 * concurrencia es identico: si el archivo cambio desde que se leyo, no se pisa.
 */

const RUTA_VALIDA = /^content\/[a-z0-9-]+(\/[a-z0-9-]+)?\.json$/
const RAMA = 'main'
const API = 'https://api.github.com'

export type Archivo = { contenido: string; sha: string }

export type Resultado =
  | { ok: true }
  | { ok: false; motivo: 'conflicto' | 'error'; detalle: string }

function env(nombre: string): string {
  return process.env[nombre] ?? (import.meta.env[nombre] as string | undefined) ?? ''
}

/**
 * Lo decide el modo de ejecucion, no la presencia del token. Un `GITHUB_TOKEN` viejo
 * olvidado en el shell no puede hacer que `astro dev` publique contra el repo — el
 * 2026-09-21 uno vencido dejo el BO entero en 401. `BO_PUBLICAR` fuerza el otro camino
 * cuando hace falta probarlo a mano.
 */
export function backend(): 'github' | 'disco' {
  const forzado = env('BO_PUBLICAR')
  if (forzado === 'github' || forzado === 'disco') return forzado
  return import.meta.env.DEV ? 'disco' : 'github'
}

function exigirToken(): string {
  const token = env('GITHUB_TOKEN')
  if (!token) throw new Error('Falta GITHUB_TOKEN: el backoffice no puede publicar')
  return token
}

/** Mismo hash que `git hash-object`: sirve de ETag en los dos backends. */
export function blobSha(contenido: string): string {
  const bytes = Buffer.from(contenido, 'utf8')
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

/** Serializacion canonica. El archivo publicado es byte a byte el que el build sabe leer. */
export function serializar(datos: unknown): string {
  return JSON.stringify(datos, null, 2) + '\n'
}

function validarRuta(ruta: string): void {
  // El BO solo escribe contenido: ninguna ruta del formulario puede salirse de content/.
  if (!RUTA_VALIDA.test(ruta)) throw new Error(`ruta de contenido invalida: ${ruta}`)
}

async function github(ruta: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API}/repos/${env('GITHUB_REPO') || 'maxhost/dojo-da-luz'}/contents/${ruta}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${exigirToken()}`,
      'content-type': 'application/json',
      'user-agent': 'dojo-da-luz-backoffice',
      'x-github-api-version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  })
}

export async function leerContenido(ruta: string): Promise<Archivo> {
  validarRuta(ruta)

  if (backend() === 'disco') {
    const contenido = await readFile(resolve(process.cwd(), ruta), 'utf8')
    return { contenido, sha: blobSha(contenido) }
  }

  const res = await github(`${ruta}?ref=${RAMA}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GitHub ${res.status} al leer ${ruta}: ${await res.text()}`)

  const json = (await res.json()) as { content: string; sha: string }
  return { contenido: Buffer.from(json.content, 'base64').toString('utf8'), sha: json.sha }
}

export async function publicar(args: {
  ruta: string
  contenido: string
  mensaje: string
  sha: string
}): Promise<Resultado> {
  const { ruta, contenido, mensaje, sha } = args
  validarRuta(ruta)

  if (backend() === 'disco') {
    const destino = resolve(process.cwd(), ruta)
    const actual = await readFile(destino, 'utf8')
    if (blobSha(actual) !== sha) {
      return { ok: false, motivo: 'conflicto', detalle: 'el archivo cambio en el disco' }
    }
    await writeFile(destino, contenido, 'utf8')
    return { ok: true }
  }

  const res = await github(ruta, {
    method: 'PUT',
    body: JSON.stringify({
      branch: RAMA,
      message: mensaje,
      content: Buffer.from(contenido, 'utf8').toString('base64'),
      sha,
    }),
  })

  if (res.ok) return { ok: true }

  const detalle = await res.text()
  // 409 y 422 son el mismo caso: el `sha` que mandamos ya no es el de `main`.
  const motivo = res.status === 409 || res.status === 422 ? 'conflicto' : 'error'
  return { ok: false, motivo, detalle: `GitHub ${res.status}: ${detalle}` }
}
