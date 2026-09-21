import { z } from 'zod'
import { LOCALES, PAGES, isLocale, type Locale, type PageKey } from './i18n'
import {
  aikidoSchema,
  audienceEntrySchema,
  classesSchema,
  contactSchema,
  dojoSchema,
  eventsSchema,
  homeSchema,
  otherArtsSchema,
  schoolsSchema,
  teacherSchema,
} from './schemas'

// Quien ya importaba un schema de `content` lo sigue encontrando aca.
export * from './schemas'

const SCHEMAS = {
  home: homeSchema,
  classes: classesSchema,
  adults: audienceEntrySchema,
  children: audienceEntrySchema,
  aikido: aikidoSchema,
  dojo: dojoSchema,
  teacher: teacherSchema,
  contact: contactSchema,
  events: eventsSchema,
  schools: schoolsSchema,
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
