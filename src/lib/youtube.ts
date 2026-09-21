/**
 * Un video de la galeria se pega como enlace de YouTube (ADR-0031). Lo que se guarda es la
 * URL tal cual la reparte YouTube; el id se saca aca, al validar y al renderizar.
 *
 * **No se guarda el id.** El editor tiene que devolverle al cliente lo mismo que pego: un
 * campo que dice `dQw4w9WgXcQ` donde el escribio una direccion es un campo que no entiende.
 */

/** Los ids de YouTube son once caracteres de este alfabeto. */
const ID = /^[A-Za-z0-9_-]{11}$/

const RUTAS = [
  /^\/shorts\/([^/?#]+)/,
  /^\/embed\/([^/?#]+)/,
  /^\/live\/([^/?#]+)/,
  /^\/v\/([^/?#]+)/,
]

const DOMINIOS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

/**
 * El id de un enlace de YouTube, o `null` si no lo es.
 *
 * Acepta las formas que YouTube reparte desde sus propios botones: `watch?v=`, `youtu.be/`,
 * `shorts/`, `embed/`, con o sin `www`, con los parametros de campaña que agrega al copiar.
 */
export function idDeYoutube(enlace: string): string | null {
  let url: URL
  try {
    url = new URL(enlace.trim())
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const candidato = (() => {
    if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
      return url.pathname.slice(1).split('/')[0]
    }
    if (!DOMINIOS.has(url.hostname)) return undefined
    if (url.pathname === '/watch') return url.searchParams.get('v') ?? undefined
    for (const ruta of RUTAS) {
      const m = ruta.exec(url.pathname)
      if (m) return m[1]
    }
    return undefined
  })()

  return candidato && ID.test(candidato) ? candidato : null
}

export function esEnlaceDeYoutube(enlace: string): boolean {
  return idDeYoutube(enlace) !== null
}

/**
 * `hqdefault` y no `maxresdefault`: el segundo **no existe para todos los videos** y
 * devuelve un 404 con una imagen gris, que en una rejilla se ve como una foto rota.
 */
export function miniaturaDeYoutube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/** El reproductor. `nocookie` acota lo que YouTube deja antes de que alguien toque play. */
export function reproductorDeYoutube(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}

/** El destino cuando no hay JavaScript: la miniatura es un enlace al video. */
export function paginaDeYoutube(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}
