import { ajustesSchema, type Ajustes } from './ajustes'
import { erroresDe, lineas, opcional, resumenDeErrores, texto } from './forms'
import { LOCALES } from './i18n'
import { leerContenido, publicar, serializar } from './publish'

/**
 * Publicacion de los ajustes del sitio (spec 0044). Mismo contrato que `partners-edicion`
 * y `dojos-edicion`: validar con el schema del build, respetar el `sha` de quien leyo el
 * archivo, y recien entonces commitear.
 *
 * **No hay pestañas de idioma**: un telefono no se traduce. Lo unico por idioma son las
 * lineas del pie, y viajan las cuatro en el mismo formulario y el mismo commit — asi que
 * aca no hay nada que propagar ni que sembrar (ADR-0042).
 */

export const RUTA_AJUSTES = 'content/site.json'

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

export async function leerAjustes(): Promise<{ ajustes: Ajustes; sha: string }> {
  const archivo = await leerContenido(RUTA_AJUSTES)
  return { ajustes: JSON.parse(archivo.contenido) as Ajustes, sha: archivo.sha }
}

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso:
      'Alguien editó los ajustes mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

/**
 * `FormData` → el objeto que valida `ajustesSchema`.
 *
 * Casi todo es opcional y **vacio se guarda como `null`**, no como cadena vacia: es la
 * diferencia entre "no hay telefono" y "hay un telefono que es la cadena vacia", y el
 * schema solo acepta la primera.
 */
export function ajustesDesdeForm(form: FormData): unknown {
  return {
    marca: {
      logo: opcional(form, 'marca.logo'),
      favicon: opcional(form, 'marca.favicon'),
      // En minusculas: `#0099FF` y `#0099ff` son el mismo color y dos diffs distintos.
      acento: texto(form, 'marca.acento').toLowerCase(),
    },
    contacto: {
      telefono: opcional(form, 'contacto.telefono'),
      telefonoEnlace: opcional(form, 'contacto.telefonoEnlace'),
      email: opcional(form, 'contacto.email'),
      direccion: opcional(form, 'contacto.direccion'),
    },
    redes: {
      facebook: opcional(form, 'redes.facebook'),
      instagram: opcional(form, 'redes.instagram'),
    },
    pie: Object.fromEntries(LOCALES.map((locale) => [locale, lineas(form, `pie.${locale}`)])),
  }
}

export async function guardarAjustes(form: FormData, sha: string): Promise<Guardado> {
  const validado = ajustesSchema.safeParse(ajustesDesdeForm(form))
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
    const actual = await leerContenido(RUTA_AJUSTES)
    if (actual.sha !== sha) return conflicto()
    if (actual.contenido === contenido) {
      return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
    }

    const resultado = await publicar({
      ruta: RUTA_AJUSTES,
      contenido,
      mensaje: 'contenido: ajustes del sitio desde el backoffice',
      sha: actual.sha,
    })

    if (resultado.ok) return { ok: true }
    if (resultado.motivo === 'conflicto') return conflicto()

    return { ok: false, estado: 502, aviso: `No se pudo publicar: ${resultado.detalle}`, errores: {} }
  } catch (error) {
    // El repositorio es un servicio remoto: sin token o con GitHub caido no se publica,
    // pero eso es un aviso, no un 500 del backoffice.
    const detalle = error instanceof Error ? error.message : String(error)
    return { ok: false, estado: 503, aviso: `No se pudo publicar: ${detalle}`, errores: {} }
  }
}
