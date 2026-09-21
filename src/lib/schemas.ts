/**
 * Los schemas del contenido. Salieron de `content.ts` cuando ese archivo paso el limite de
 * 300 lineas: aca vive **que forma tiene** cada pagina, y en `content.ts` **como se carga**.
 * Las dos mitades no cambian por los mismos motivos.
 */
import { z } from 'zod'

export const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

export const linesSchema = z.array(z.string().min(1)).min(1)

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

export const gallerySchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  items: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('image'), src: z.url(), alt: z.string().min(1) }),
    z.object({ type: z.literal('video'), src: z.url(), poster: z.url(), alt: z.string().min(1) }),
  ])).length(6),
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
  chrome: z.object({
    caption: z.string().min(1),
    menuLabel: z.string().min(1),
    skipLink: z.string().min(1),
    nav: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).min(1),
    footerNote: z.object({
      areas: z.string().min(1),
      orgType: z.string().min(1),
    }),
  }),
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
  chrome: z.object({
    caption: z.string().min(1),
    menuLabel: z.string().min(1),
    skipLink: z.string().min(1),
    nav: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).min(1),
    footerNote: z.object({ areas: z.string().min(1), orgType: z.string().min(1) }),
  }),
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
  }),
  qa: qaSchema,
})

export const audienceEntrySchema = z.object({
  seo: seoSchema,
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

export const aikidoSchema = z.object({
  seo: seoSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  sections: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1) })).min(1),
  founder: z.object({ label: z.string().min(1), title: z.string().min(1), years: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1) }),
  audienceTitle: z.string().min(1), adultsLabel: z.string().min(1), childrenLabel: z.string().min(1),
})

export const dojoSchema = z.object({
  seo: seoSchema, eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  spaceTitle: z.string().min(1), spaceParagraphs: z.array(z.string().min(1)).min(1),
  teacher: z.object({ label:z.string().min(1), name:z.string().min(1), credentials:z.string().min(1), paragraphs:z.array(z.string().min(1)).min(1), linkLabel:z.string().min(1) }),
  lineageTitle:z.string().min(1), lineage:z.array(z.object({ name:z.string().min(1), role:z.string().min(1), text:z.string().min(1) })).min(1),
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

export const otherArtsSchema = z.object({
  seo:seoSchema, eyebrow:z.string().min(1), title:z.string().min(1), lead:z.string().min(1),
  activities:z.array(z.object({
    id:z.string().min(1), name:z.string().min(1), subtitle:z.string().min(1), photo:z.url(), photoAlt:z.string().min(1),
    paragraphs:z.array(z.string().min(1)).min(1), benefits:z.array(z.string().min(1)), schedule:z.array(z.string().min(1)),
    teacher:z.string().min(1).optional(), trialLabel:z.string().min(1), formUrl:z.url().nullable(), directLabel:z.string().min(1), closeLabel:z.string().min(1),
  })).min(1),
})

export const eventsSchema = z.object({
  seo: seoSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1), date: z.string().min(1), location: z.string().min(1),
    description: z.string().min(1), photo: z.url(), photoAlt: z.string().min(1),
  })).min(3).max(4),
})

export const schoolsSchema = z.object({
  seo: seoSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1), heroPhoto: z.url(),
  introduction: z.object({ eyebrow: z.string().min(1), title: z.string().min(1), subtitle: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1), photo: z.url(), photoAlt: z.string().min(1) }),
  gallery: z.array(z.object({ src: z.url(), alt: z.string().min(1) })).min(4).max(8),
})
