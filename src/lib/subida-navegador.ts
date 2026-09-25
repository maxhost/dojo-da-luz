/**
 * Lo que comparten los campos que suben prefirmado a R2 (spec 0047): `CampoImagen` para
 * fotos grandes y `CampoVideo` para el video de la portada. Solo corre en el navegador
 * —`crypto.subtle`, `XMLHttpRequest`— y por eso vive aparte de `medios.ts`, que es servidor.
 */

export async function hashDe(archivo: File): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', await archivo.arrayBuffer())
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function subirConProgreso(
  url: string,
  archivo: File,
  contentType: string,
  onProgreso: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('content-type', contentType)
    xhr.upload.addEventListener('progress', (evento) => {
      if (evento.lengthComputable) onProgreso(Math.round((evento.loaded / evento.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`R2 respondió ${xhr.status}`))
    })
    xhr.addEventListener('error', () => reject(new Error('No se pudo conectar con R2.')))
    xhr.send(archivo)
  })
}

/**
 * `res.json()` a secas revienta con "Unexpected token" cuando el servidor no contesta JSON
 * —el 413 de Vercel es texto plano, y ese error de parseo es justo lo que el cliente
 * terminaba viendo en vez de "el archivo es muy grande" (ADR-0044). Nunca deja pasar la
 * excepcion: un cuerpo no-JSON se convierte en un `motivo` legible.
 */
export async function leerJsonSeguro(
  res: Response,
): Promise<{ url?: string; urlPublica?: string; requierePut?: boolean; motivo?: string }> {
  try {
    return await res.json()
  } catch {
    return {
      motivo:
        res.status === 413
          ? 'El archivo es demasiado grande para este camino de subida.'
          : `El servidor respondió ${res.status} sin un mensaje legible.`,
    }
  }
}
