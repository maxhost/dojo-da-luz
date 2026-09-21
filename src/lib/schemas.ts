/**
 * Los schemas del contenido. Salieron de `content.ts` cuando ese archivo paso el limite de
 * 300 lineas: aca vive **que forma tiene** cada pagina, y en `content.ts` **como se carga**.
 * Las dos mitades no cambian por los mismos motivos.
 */
import { z } from 'zod'
import { esEnlaceDeYoutube } from './youtube.ts'

export const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

export const linesSchema = z.array(z.string().min(1)).min(1)

/** Los cinco textos del borde de la pagina: bajada del logo, menu, salto y las dos del pie. */
export const chromeSchema = z.object({
  caption: z.string().min(1),
  menuLabel: z.string().min(1),
  skipLink: z.string().min(1),
  footerNote: z.object({
    areas: z.string().min(1),
    orgType: z.string().min(1),
  }),
})

/**
 * Capa GEO (ADR-0018). Los minimos no son decorativos: una respuesta de cinco palabras no
 * se puede citar sin el parrafo que la rodea, y ese es el modo de falla previsible cuando
 * alguien completa el formulario apurado. El build lo frena antes de publicar.
 */
export const qaSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  items: z
    .array(
      z.object({
        pregunta: z.string().min(8),
        respuesta: z.string().min(40),
      }),
    )
    .min(3)
    .max(12),
})

/**
 * La galeria es de largo libre y cada medio es una foto subida o un video de YouTube
 * (ADR-0031). Sin minimo: con cero medios la seccion no se pinta, que es mejor que un
 * titulo sobre una rejilla vacia.
 *
 * Del video se guarda **el enlace, no el id**: es lo que el cliente pego y lo que el
 * editor le tiene que devolver. El id lo saca `idDeYoutube` al renderizar.
 */
export const galleryItemSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'), src: z.url(), alt: z.string().min(1) }),
  z.object({
    type: z.literal('youtube'),
    url: z
      .url()
      .refine(esEnlaceDeYoutube, 'no es un enlace de YouTube: pega la direccion del video'),
    alt: z.string().min(1),
  }),
])

export const gallerySchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  items: z.array(galleryItemSchema),
})

/** Tarjeta de audiencia de la Home: foto y texto propios, no prestados de la landing. */
export const audienceCardSchema = z.object({
  photoAlt: z.string().min(1),
  title: z.string().min(1),
  lead: z.string().min(1),
})

export const homeSchema = z.object({
  seo: seoSchema,
  /** Frases autocontenidas, con sujeto explicito: lo que un motor generativo puede citar. */
  resumen: z.array(z.string().min(40)).min(2).max(4),
  chrome: chromeSchema,
  hero: z.object({
    eyebrowLines: linesSchema,
    titleLines: linesSchema,
    titleHighlight: z.string().min(1),
    tagline: z.string().min(1),
  }),
  practice: z.object({
    label: z.string().min(1),
    titleLines: linesSchema,
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  audiences: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    adultsLabel: z.string().min(1),
    childrenLabel: z.string().min(1),
    ctaLabel: z.string().min(1),
    /**
     * Contenido propio de la portada (ADR-0026). Antes se tomaba prestado de adults.json y
     * children.json, asi que editar la tarjeta cambiaba el hero de la landing.
     */
    adults: audienceCardSchema,
    children: audienceCardSchema,
  }),
  places: z.object({
    label: z.string().min(1),
    titleLines: linesSchema,
    lead: z.string().min(1),
    // Las sedes ya no viven aca: son una entidad en content/dojos.json (ADR-0017).
    ctaLabel: z.string().min(1),
  }),
  dojo: z.object({
    label: z.string().min(1),
    titleLines: linesSchema,
    photoCaption: z.string().min(1),
    photoAlt: z.string().min(1),
    teacher: z.object({
      name: z.string().min(1),
      credentialsLines: linesSchema,
      bio: z.string().min(1),
      photoAlt: z.string().min(1),
    }),
  }),
  threshold: z.object({
    label: z.string().min(1),
    titleLines: linesSchema,
    text: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  partnerships: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
  }),
})

export const classesSchema = z.object({
  seo: seoSchema,
  chrome: chromeSchema,
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
    season: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  // Las sedes salen de `content/dojos.json`, no de aca (spec 0034): archivar un dojo en el
  // backoffice tiene que sacarlo de /aulas igual que lo saca de la Home.
  schedule: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    // Los dos botones estaban escritos dentro de `ClassesView.astro` (spec 0035): texto
    // visible que no se podia editar porque no existia en ningun JSON.
    adultsLabel: z.string().min(1),
    childrenLabel: z.string().min(1),
  }),
  pricing: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    items: z.array(z.object({ name: z.string().min(1), price: z.string().min(1), detail: z.string().min(1) })).min(1),
    notes: z.array(z.string().min(1)).min(1),
  }),
  children: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  }),
  trial: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    text: z.string().min(1),
    note: z.string().min(1),
    ctaLabel: z.string().min(1),
    // El boton abria `mailto:EMAIL-PENDENTE`. Ahora abre el mismo modal que Adultos y
    // Crianças. `formUrl` no se edita desde el BO: un destino mal escrito deja el modal
    // en blanco sin avisar, y el diseño de los formularios es otra spec.
    formUrl: z.url(),
    directLabel: z.string().min(1),
    closeLabel: z.string().min(1),
  }),
  qa: qaSchema,
})

export const audienceEntrySchema = z.object({
  seo: seoSchema,
  chrome: chromeSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  goalsTitle: z.string().min(1), goals: z.array(z.string().min(1)).min(1),
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  photo: z.url(), photoAlt: z.string().min(1),
  gallery: gallerySchema,
  trialTitle: z.string().min(1), trialText: z.string().min(1), trialLabel: z.string().min(1),
  formUrl: z.url(), directLabel: z.string().min(1), closeLabel: z.string().min(1),
  qa: qaSchema,
})

/**
 * `/aikido` (spec 0037). La lista numerada es de largo libre y **no lleva un id por
 * seccion**: el que habia era un ancla HTML que no usaba nadie, distinta por idioma, y un
 * identificador tecnico no es contenido que el cliente deba escribir (ADR-0026). El ancla
 * la pone la vista por posicion.
 *
 * `heroPhoto` no tiene `alt`: es un fondo detras del titular, con un velo negro encima, y
 * se publica como decorativa.
 */
export const aikidoSchema = z.object({
  seo: seoSchema,
  chrome: chromeSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  heroPhoto: z.url(),
  sections: z.array(z.object({ title: z.string().min(1), paragraphs: linesSchema })).min(1),
  founder: z.object({
    label: z.string().min(1), title: z.string().min(1), years: z.string().min(1),
    paragraphs: linesSchema,
    photo: z.url(), photoAlt: z.string().min(1),
  }),
  audienceTitle: z.string().min(1), adultsLabel: z.string().min(1), childrenLabel: z.string().min(1),
})

/**
 * `/dojo` (spec 0038). Tres cosas que antes vivian dentro de `DojoView.astro`: los cinco
 * textos del borde, las dos fotos grandes y **el equipo docente**, que era un objeto con
 * los cuatro idiomas escritos a mano y tres fotos de Wix.
 *
 * `teachers` es de largo libre y **sin minimo** (ADR-0034): con la lista vacia la rejilla
 * de fichas no se pinta, que es mejor que una franja oscura vacia.
 *
 * `lineage` es lo contrario: exactamente tres cajas, sin alta ni baja en la pantalla. Son
 * tres nombres historicos —Franck Noel, Seigo Yamaguchi, la familia Ueshiba— y el `.length(3)`
 * es lo que frena una cuarta metida por un POST forjado.
 */
export const dojoSchema = z.object({
  seo: seoSchema, chrome: chromeSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  heroPhoto: z.url(), heroPhotoAlt: z.string().min(1),
  spaceTitle: z.string().min(1), spaceParagraphs: z.array(z.string().min(1)).min(1),
  teacher: z.object({
    label: z.string().min(1), name: z.string().min(1), credentials: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    photo: z.url(), photoAlt: z.string().min(1),
    linkLabel: z.string().min(1),
  }),
  teachers: z.array(z.object({
    name: z.string().min(1), credentials: z.string().min(1),
    paragraphs: linesSchema,
    photo: z.url(), photoAlt: z.string().min(1),
  })),
  lineageTitle: z.string().min(1),
  lineage: z.array(z.object({ name: z.string().min(1), role: z.string().min(1), text: z.string().min(1) })).length(3),
})

export const teacherSchema = z.object({
  seo:seoSchema,
  eyebrow:z.string().min(1), title:z.string().min(1), lead:z.string().min(1), credentials:z.string().min(1),
  photo:z.url(), photoAlt:z.string().min(1),
  biographyTitle:z.string().min(1), biography:z.array(z.string().min(1)).min(1),
  milestonesTitle:z.string().min(1), milestones:z.array(z.object({ year:z.string().min(1), title:z.string().min(1), text:z.string().min(1) })).min(1),
  formationTitle:z.string().min(1), formation:z.array(z.string().min(1)).min(1),
  teachingTitle:z.string().min(1), teaching:z.array(z.string().min(1)).min(1),
  lineageTitle:z.string().min(1), lineageIntro:z.string().min(1), lineage:z.array(z.object({ name:z.string().min(1), role:z.string().min(1), text:z.string().min(1) })).min(1),
  dojoCta:z.object({ title:z.string().min(1), text:z.string().min(1), label:z.string().min(1) }),
})

export const contactSchema = z.object({
  seo: seoSchema, eyebrow:z.string().min(1), title:z.string().min(1), lead:z.string().min(1),
  venues:z.array(z.object({ name:z.string().min(1), area:z.string().min(1), transport:z.array(z.string().min(1)).min(1) })).min(1),
  privateTitle:z.string().min(1), privateText:z.string().min(1), formTitle:z.string().min(1),
  fields:z.object({ name:z.string().min(1), email:z.string().min(1), subject:z.string().min(1), message:z.string().min(1), submit:z.string().min(1), pending:z.string().min(1) }),
})

/**
 * `/outras-artes` (spec 0040). Tres cambios sobre lo que habia:
 *
 * - **Portada con foto** (ADR-0036), decorativa: va detras de un velo negro y del titular.
 * - **Una galeria de la pagina**, no una por arte, con la misma forma que las de audiencia
 *   (ADR-0031). Nace vacia y mientras lo este la seccion no se pinta.
 * - **Sin `id` por arte**: era un ancla HTML que no enlazaba nadie, igual que en `/aikido`.
 *   El ancla la pone la vista por posicion.
 *
 * `formUrl` sigue sin editarse desde el BO (spec 0035): viaja oculto en el formulario y
 * sembrado desde portugues.
 */
export const otherArtsSchema = z.object({
  seo: seoSchema, chrome: chromeSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  heroPhoto: z.url(),
  activities: z.array(z.object({
    name: z.string().min(1), subtitle: z.string().min(1),
    photo: z.url(), photoAlt: z.string().min(1),
    paragraphs: linesSchema, benefits: z.array(z.string().min(1)), schedule: z.array(z.string().min(1)),
    teacher: z.string().min(1).optional(),
    trialLabel: z.string().min(1), formUrl: z.url().nullable(),
    directLabel: z.string().min(1), closeLabel: z.string().min(1),
  })).min(1),
  gallery: gallerySchema,
})

export const eventsSchema = z.object({
  seo: seoSchema,
  chrome: chromeSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  heroPhoto: z.url(),
  items: z.array(z.object({
    title: z.string().min(1), date: z.string().min(1), location: z.string().min(1),
    description: z.string().min(1), photo: z.url(), photoAlt: z.string().min(1),
  })),
  emptyText: z.string().min(1),
})

export const schoolsSchema = z.object({
  seo: seoSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1), heroPhoto: z.url(),
  introduction: z.object({ eyebrow: z.string().min(1), title: z.string().min(1), subtitle: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1), photo: z.url(), photoAlt: z.string().min(1) }),
  gallery: z.array(z.object({ src: z.url(), alt: z.string().min(1) })).min(4).max(8),
})
