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
    // Solo el texto: el destino (aula experimental) se cablea cuando exista esa pagina.
    ctaLabel: z.string().min(1),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          dojo: z.string().min(1),
          time: z.string().min(1),
        }),
      )
      .min(1),
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

const SCHEMAS = {
  home: homeSchema,
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

for (const [path, data] of Object.entries(modules)) {
  const match = /\/content\/([^/]+)\/([^/]+)\.json$/.exec(path)
  if (!match) continue

  const [, locale, page] = match as unknown as [string, string, string]

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
