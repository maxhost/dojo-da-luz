import { z } from 'zod'
// El atributo lo exige Node al correr los tests; Vite lo acepta igual.
import datos from '../../content/site.json' with { type: 'json' }

/**
 * Los ajustes del sitio (spec 0044, ADR-0042): lo que **no es de una pagina sino de las 44**
 * —el logo, el favicon, el color de acento, el contacto, las redes y las lineas del pie—.
 *
 * Vive en `content/site.json`, un solo archivo como `dojos.json` y `partners.json`, y se
 * valida en el build: un archivo roto tiene que aparecer al publicar, no en produccion.
 *
 * **Casi todo es opcional, y vacio significa "no se pinta"**: sin Facebook no hay icono,
 * sin telefono no hay linea en el pie, sin logo vuelve el circulo con 合気. Es lo que
 * permite que el sitio no publique un dato de contacto inventado mientras el cliente
 * consigue el real — que es exactamente el estado de hoy.
 */

/** Un texto opcional: el JSON guarda `null`, no cadena vacia. */
const textoOpcional = z.string().min(1).nullable()
const urlOpcional = z.url().nullable()

/**
 * Las lineas del pie de un idioma. Puede quedar vacia: el pie se pinta sin nota.
 * Es texto libre de un renglon por linea (ADR-0033).
 */
const lineasPie = z.array(z.string().min(1))

export const ajustesSchema = z.object({
  marca: z.object({
    /** Reemplaza **solo el circulo** del navbar; el texto "Dojo da Luz" se queda (ADR-0042). */
    logo: urlOpcional,
    favicon: urlOpcional,
    /**
     * El color de la marca. Los tonos claro y oscuro se calculan de este por CSS
     * (ADR-0041): no son campos.
     */
    acento: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'tiene que ser un color en formato #rrggbb'),
  }),
  contacto: z.object({
    /** Lo que se lee. Con espacios y prefijo, como lo escribe una persona. */
    telefono: textoOpcional,
    /** Lo que va en el `tel:`, sin espacios. Un telefono se marca, no se lee. */
    telefonoEnlace: textoOpcional,
    email: textoOpcional,
    direccion: textoOpcional,
  }),
  redes: z.object({
    facebook: urlOpcional,
    instagram: urlOpcional,
  }),
  pie: z.object({
    pt: lineasPie,
    es: lineasPie,
    fr: lineasPie,
    en: lineasPie,
  }),
})

export type Ajustes = z.infer<typeof ajustesSchema>

let cache: Ajustes | null = null

export function getAjustes(): Ajustes {
  if (!cache) cache = ajustesSchema.parse(datos)
  return cache
}
