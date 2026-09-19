import { z } from 'zod'
import { LOCALES, PAGES, isLocale, type Locale, type PageKey } from './i18n'

const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

const linesSchema = z.array(z.string().min(1)).min(1)

export const homeSchema = z.object({
  seo: seoSchema,
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
  schedule: z.object({
    label: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    venues: z.array(z.object({
      name: z.string().min(1),
      area: z.string().min(1),
      classes: z.array(z.object({ audience: z.string().min(1), time: z.string().min(1) })).min(1),
    })).min(1),
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
})

const audienceEntrySchema = z.object({
  seo: seoSchema,
  eyebrow: z.string().min(1), title: z.string().min(1), lead: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  goalsTitle: z.string().min(1), goals: z.array(z.string().min(1)).min(1),
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  photo: z.url(), photoAlt: z.string().min(1),
  trialTitle: z.string().min(1), trialText: z.string().min(1), trialLabel: z.string().min(1),
  formUrl: z.url(), directLabel: z.string().min(1), closeLabel: z.string().min(1),
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

const SCHEMAS = {
  home: homeSchema,
  classes: classesSchema,
  adults: audienceEntrySchema,
  children: audienceEntrySchema,
  aikido: aikidoSchema,
  dojo: dojoSchema,
  teacher: teacherSchema,
  contact: contactSchema,
  otherArts: otherArtsSchema,
} as const satisfies Record<PageKey, z.ZodType>

export type ContentOf<P extends PageKey> = z.infer<(typeof SCHEMAS)[P]>
export type Home = ContentOf<'home'>

/**
 * Carga eager en build. Si un JSON falta o no valida, esto **rompe el build** — que es
 * el punto: un error de contenido tiene que aparecer al publicar, no en produccion.
 */
const modules = import.meta.glob('../../content/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const store = new Map<string, unknown>()

// Los nombres de archivo pueden usar kebab-case aunque la clave interna sea camelCase.
const CONTENT_PAGE_KEYS: Record<string, PageKey> = {
  'other-arts': 'otherArts',
}

for (const [path, data] of Object.entries(modules)) {
  const match = /\/content\/([^/]+)\/([^/]+)\.json$/.exec(path)
  if (!match) continue

  const [, locale, filePage] = match as unknown as [string, string, string]
  const page = CONTENT_PAGE_KEYS[filePage] ?? filePage

  if (!isLocale(locale)) {
    throw new Error(`content: idioma desconocido "${locale}" en ${path}`)
  }
  if (!(page in SCHEMAS)) {
    throw new Error(`content: pagina desconocida "${page}" en ${path}. Falta en ROUTES?`)
  }

  const result = SCHEMAS[page as PageKey].safeParse(data)
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`content: ${path} no valida\n${detail}`)
  }

  store.set(`${locale}:${page}`, result.data)
}

// Cobertura completa: sin los 4 idiomas no se pueden emitir hreflang reciprocos.
const faltantes = PAGES.flatMap((page) =>
  LOCALES.filter((locale) => !store.has(`${locale}:${page}`)).map(
    (locale) => `content/${locale}/${page}.json`,
  ),
)

if (faltantes.length > 0) {
  throw new Error(`content: faltan archivos:\n${faltantes.map((f) => `  ${f}`).join('\n')}`)
}

export function getContent<P extends PageKey>(page: P, locale: Locale): ContentOf<P> {
  return store.get(`${locale}:${page}`) as ContentOf<P>
}
