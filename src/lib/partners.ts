import { z } from 'zod'
// El atributo lo exige Node al correr los tests; Vite lo acepta igual.
import datos from '../../content/partners.json' with { type: 'json' }

/**
 * Los parceiros son una entidad compartida por los cuatro idiomas (ADR-0027): un logo no se
 * traduce. Viven en `content/partners.json` y los edita el backoffice (spec 0031).
 *
 * La lista se valida en el build, como los dojos: un JSON roto tiene que aparecer al
 * publicar, no en produccion.
 */

export const partnerSchema = z.object({
  /** Lo que se lee como `alt`. Es lo unico que percibe quien navega sin ver la imagen. */
  nombre: z.string().min(1),
  src: z.url(),
  /**
   * Ampliacion opcional del logo dentro de su celda. Nace del logo "55+", cuyo archivo trae
   * tanto aire alrededor que a tamaño natural se lee la mitad que los demas.
   */
  escala: z.number().min(1).max(4).optional(),
})

export type Partner = z.infer<typeof partnerSchema>

export const partnersSchema = z.array(partnerSchema)

let cache: Partner[] | null = null

export function getPartners(): Partner[] {
  if (!cache) cache = partnersSchema.parse(datos)
  return cache
}
