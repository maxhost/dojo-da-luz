import { mediaSchema, type Media } from './media'
import { erroresDe, mediaDesdeForm, resumenDeErrores } from './forms'
import { leerContenido, publicar, serializar } from './publish'

/**
 * Publicacion de las imagenes de la portada (spec 0032). Mismo contrato que
 * `partners-edicion`: un archivo sin idioma, con su propio `sha` y su propio commit.
 */

export const RUTA_MEDIA = 'content/media.json'

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

export async function leerMedia(): Promise<{ media: Media; sha: string }> {
  const archivo = await leerContenido(RUTA_MEDIA)
  return { media: JSON.parse(archivo.contenido) as Media, sha: archivo.sha }
}

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso:
      'Alguien cambió las imágenes mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

export async function guardarMedia(form: FormData, sha: string): Promise<Guardado> {
  const validado = mediaSchema.safeParse(mediaDesdeForm(form))
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return {
      ok: false,
      estado: 422,
      aviso: `No se publicó nada. ${resumenDeErrores(errores)}`,
      errores,
    }
  }

  const contenido = serializar(validado.data)

  try {
    const actual = await leerContenido(RUTA_MEDIA)
    if (actual.sha !== sha) return conflicto()
    if (actual.contenido === contenido) {
      return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
    }

    const resultado = await publicar({
      ruta: RUTA_MEDIA,
      contenido,
      mensaje: 'contenido: imagenes de la portada desde el backoffice',
      sha: actual.sha,
    })

    if (resultado.ok) return { ok: true }
    if (resultado.motivo === 'conflicto') return conflicto()

    return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error)
    return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
  }
}
