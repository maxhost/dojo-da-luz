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

/** Icono visible del selector; el nombre completo sigue disponible para accesibilidad. */
export const LOCALE_ICON: Record<Locale, string> = {
  pt: '🇵🇹',
  es: '🇪🇸',
  fr: '🇫🇷',
  en: '🇬🇧',
}

export type PageKey = 'home' | 'classes' | 'adults' | 'children' | 'aikido' | 'dojo' | 'teacher' | 'contact' | 'otherArts'

/**
 * Slug por pagina y por idioma. Unica fuente de los paths del sitio: de aca salen
 * tanto las rutas generadas como los hreflang reciprocos. Slug vacio = raiz del idioma.
 */
export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { pt: '', es: '', fr: '', en: '' },
  classes: { pt: 'aulas', es: 'clases', fr: 'cours', en: 'classes' },
  adults: { pt: 'aulas/adultos', es: 'clases/adultos', fr: 'cours/adultes', en: 'classes/adults' },
  children: { pt: 'aulas/criancas', es: 'clases/ninos', fr: 'cours/enfants', en: 'classes/children' },
  aikido: { pt: 'aikido', es: 'aikido', fr: 'aikido', en: 'aikido' },
  dojo: { pt: 'dojo', es: 'dojo', fr: 'dojo', en: 'dojo' },
  teacher: { pt: 'professor-pablo-duran', es: 'profesor-pablo-duran', fr: 'professeur-pablo-duran', en: 'teacher-pablo-duran' },
  contact: { pt: 'contactos', es: 'contacto', fr: 'contact', en: 'contact' },
  otherArts: { pt: 'outras-artes', es: 'otras-artes', fr: 'autres-arts', en: 'other-arts' },
}

export const PAGES = Object.keys(ROUTES) as PageKey[]

const NAV_LABELS: Record<Locale, Record<'home' | 'classes' | 'aikido' | 'dojo' | 'otherArts' | 'contact', string>> = {
  pt: { home: 'Início', classes: 'Aulas', aikido: 'A prática', dojo: 'O dojo', otherArts: 'Outras artes', contact: 'Contacto' },
  es: { home: 'Inicio', classes: 'Clases', aikido: 'La práctica', dojo: 'El dojo', otherArts: 'Otras artes', contact: 'Contacto' },
  fr: { home: 'Accueil', classes: 'Cours', aikido: 'La pratique', dojo: 'Le dojo', otherArts: 'Autres arts', contact: 'Contact' },
  en: { home: 'Home', classes: 'Classes', aikido: 'The practice', dojo: 'The dojo', otherArts: 'Other arts', contact: 'Contact' },
}

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

/** Menú global único. Las páginas aún no construidas aterrizan en su resumen de la Home. */
export function siteNav(locale: Locale): { label: string; href: string }[] {
  const labels = NAV_LABELS[locale]
  const home = pathFor('home', locale)
  return [
    { label: labels.home, href: home },
    { label: labels.classes, href: pathFor('classes', locale) },
    { label: labels.aikido, href: pathFor('aikido', locale) },
    { label: labels.dojo, href: pathFor('dojo', locale) },
    { label: labels.otherArts, href: pathFor('otherArts', locale) },
    { label: labels.contact, href: pathFor('contact', locale) },
  ]
}

export function urlFor(page: PageKey, locale: Locale, site: URL | string): string {
  return new URL(pathFor(page, locale), site).href.replace(/\/$/, '') || String(site)
}
