export const LOCALES = ['pt', 'es', 'fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'pt'

/** Codigo que va en hreflang. pt-PT y no pt: el publico es de Lisboa, no de Brasil. */
export const HREFLANG: Record<Locale, string> = {
  pt: 'pt-PT',
  es: 'es',
  fr: 'fr',
  en: 'en',
}

export const LOCALE_NAME: Record<Locale, string> = {
  pt: 'Portugues',
  es: 'Espanol',
  fr: 'Francais',
  en: 'English',
}

export type PageKey = 'home'

/**
 * Slug por pagina y por idioma. Unica fuente de los paths del sitio: de aca salen
 * tanto las rutas generadas como los hreflang reciprocos. Slug vacio = raiz del idioma.
 */
export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { pt: '', es: '', fr: '', en: '' },
}

export const PAGES = Object.keys(ROUTES) as PageKey[]

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Path absoluto sin barra final (salvo la raiz). */
export function pathFor(page: PageKey, locale: Locale): string {
  const slug = ROUTES[page][locale]
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  const path = `${prefix}/${slug}`.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function urlFor(page: PageKey, locale: Locale, site: URL | string): string {
  return new URL(pathFor(page, locale), site).href.replace(/\/$/, '') || String(site)
}
