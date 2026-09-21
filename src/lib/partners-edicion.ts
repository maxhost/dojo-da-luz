import { partnersSchema, type Partner } from './partners'
import { erroresDe, partnersDesdeForm, resumenDeErrores } from './forms'
import { leerContenido, publicar, serializar } from './publish'

/**
 * Publicacion de la lista de parceiros (spec 0031). Mismo contrato que `dojos-edicion`:
 * validar con el schema del build, respetar el `sha` de quien leyo el archivo, y recien
 * entonces commitear.
 *
 * Es un archivo aparte de `home.json` porque un logo no se traduce (ADR-0027): un solo
 * archivo para los cuatro idiomas, con su propio sha y su propio commit.
 */

export const RUTA_PARTNERS = 'content/partners.json'

export type Guardado =
  | { ok: true }
  | { ok: false; estado: number; aviso: string; errores: Record<string, string> }

export async function leerPartners(): Promise<{ partners: Partner[]; sha: string }> {
  const archivo = await leerContenido(RUTA_PARTNERS)
  return { partners: JSON.parse(archivo.contenido) as Partner[], sha: archivo.sha }
}

function conflicto(): Guardado {
  return {
    ok: false,
    estado: 409,
    aviso:
      'Alguien editó las parcerías mientras tanto. No se pisó nada: recargá y volvé a aplicar tu cambio.',
    errores: {},
  }
}

export async function guardarPartners(form: FormData, sha: string): Promise<Guardado> {
  const validado = partnersSchema.safeParse(partnersDesdeForm(form))
  if (!validado.success) {
    const errores = erroresDe(validado.error)
    return { ok: false, estado: 422, aviso: `No se publicó nada. ${resumenDeErrores(errores)}`, errores }
  }

  const contenido = serializar(validado.data)

  try {
    const actual = await leerContenido(RUTA_PARTNERS)
    if (actual.sha !== sha) return conflicto()
    if (actual.contenido === contenido) {
      return { ok: false, estado: 200, aviso: 'No había cambios: no se publicó nada.', errores: {} }
    }

    const resultado = await publicar({
      ruta: RUTA_PARTNERS,
      contenido,
      mensaje: 'contenido: parcerias desde el backoffice',
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
