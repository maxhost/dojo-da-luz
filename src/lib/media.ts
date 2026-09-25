import { z } from 'zod'
// El atributo lo exige Node al correr los tests; Vite lo acepta igual.
import datos from '../../content/media.json' with { type: 'json' }

/**
 * Las imagenes de la Home son las mismas en los cuatro idiomas (ADR-0028): una foto no se
 * traduce. Viven aca y no en `content/<locale>/home.json` para que no exista el estado
 * "cambiada en tres idiomas de cuatro", que ninguna validacion podria detectar.
 *
 * El texto que las describe —`photoAlt`, `photoCaption`— si es por idioma y sigue en
 * `home.json`, al lado de la foto que describe.
 *
 * Las claves dicen para que se usa la imagen, no donde cae en el arbol de la Home: lo que
 * necesita leer quien la cambia es "la foto del dojo", no una ruta.
 */

export const mediaSchema = z.object({
  heroPoster: z.url(),
  /**
   * El video de fondo del titular (spec 0047). Vacio es un estado valido —la portada se ve
   * solo con el poster de arriba— y no un error, asi que no es `z.url()` a secas.
   */
  heroVideo: z.union([z.literal(''), z.url()]),
  adultsPhoto: z.url(),
  childrenPhoto: z.url(),
  dojoPhoto: z.url(),
  teacherPhoto: z.url(),
  classesHero: z.url(),
})

export type Media = z.infer<typeof mediaSchema>

/** El orden en que se ven en el editor y en la portada. */
export const CLAVES_MEDIA = [
  'heroPoster',
  'heroVideo',
  'adultsPhoto',
  'childrenPhoto',
  'dojoPhoto',
  'teacherPhoto',
  'classesHero',
] as const

export const ETIQUETA_MEDIA: Record<keyof Media, string> = {
  heroPoster: 'Portada del vídeo',
  heroVideo: 'Vídeo de la portada',
  adultsPhoto: 'Foto de la tarjeta de Adultos',
  childrenPhoto: 'Foto de la tarjeta de Crianças',
  dojoPhoto: 'Foto de la sección del dojo',
  teacherPhoto: 'Retrato del profesor',
  classesHero: 'Portada de Aulas',
}

let cache: Media | null = null

export function getMedia(): Media {
  if (!cache) cache = mediaSchema.parse(datos)
  return cache
}
