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
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  en: 'English',
}

/** Icono visible del selector; el nombre completo sigue disponible para accesibilidad. */
export const LOCALE_ICON: Record<Locale, string> = {
  pt: '🇵🇹',
  es: '🇪🇸',
  fr: '🇫🇷',
  en: '🇬🇧',
}

export type PageKey = 'home' | 'classes' | 'adults' | 'children' | 'aikido' | 'dojo' | 'teacher' | 'contact' | 'events' | 'schools' | 'otherArts'

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
  events: { pt: 'eventos', es: 'eventos', fr: 'evenements', en: 'events' },
  schools: { pt: 'escolas', es: 'escuelas', fr: 'ecoles', en: 'schools' },
  otherArts: { pt: 'outras-artes', es: 'otras-artes', fr: 'autres-arts', en: 'other-arts' },
}

export const PAGES = Object.keys(ROUTES) as PageKey[]

const NAV_LABELS: Record<Locale, Record<'home' | 'classes' | 'aikido' | 'dojo' | 'events' | 'schools' | 'otherArts' | 'contact', string>> = {
  pt: { home: 'Início', classes: 'Aulas', aikido: 'A prática', dojo: 'O dojo', events: 'Eventos', schools: 'Escolas', otherArts: 'Outras artes', contact: 'Contacto' },
  es: { home: 'Inicio', classes: 'Clases', aikido: 'La práctica', dojo: 'El dojo', events: 'Eventos', schools: 'Escuelas', otherArts: 'Otras artes', contact: 'Contacto' },
  fr: { home: 'Accueil', classes: 'Cours', aikido: 'La pratique', dojo: 'Le dojo', events: 'Événements', schools: 'Écoles', otherArts: 'Autres arts', contact: 'Contact' },
  en: { home: 'Home', classes: 'Classes', aikido: 'The practice', dojo: 'The dojo', events: 'Events', schools: 'Schools', otherArts: 'Other arts', contact: 'Contact' },
}

/**
 * Nombre de los dos `<nav>` del encabezado: lo primero que anuncia un lector de pantalla
 * al entrar en la navegacion (spec 0048). Es vocabulario de interfaz, como NAV_LABELS, y
 * por eso vive aca y no en el contenido. Portugues y español comparten valor y aun asi
 * estan escritos los dos: la tabla completa se lee de un golpe.
 */
export const NAV_ARIA: Record<Locale, { principal: string; idioma: string }> = {
  pt: { principal: 'Principal', idioma: 'Idioma' },
  es: { principal: 'Principal', idioma: 'Idioma' },
  fr: { principal: 'Principale', idioma: 'Langue' },
  en: { principal: 'Main', idioma: 'Language' },
}

/**
 * Etiquetas de los horarios de dojo (spec 0020). Los datos duros —dias, horas— viven en
 * `content/dojos.json` sin traducir; aca se traduce como se leen.
 */

export const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const
export type Dia = (typeof DIAS)[number]

export const AUDIENCIAS = ['adultos', 'criancas'] as const
export type Audiencia = (typeof AUDIENCIAS)[number]

export const VARIANTES = ['almuerzo', 'tarde', 'armas'] as const
export type Variante = (typeof VARIANTES)[number]

/** Plural: "Tercas e quintas", no "Terca e quinta". Asi lo dice el sitio actual. */
export const DIA_LABEL: Record<Locale, Record<Dia, string>> = {
  pt: { lun: 'Segundas', mar: 'Terças', mie: 'Quartas', jue: 'Quintas', vie: 'Sextas', sab: 'Sábados', dom: 'Domingos' },
  es: { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábados', dom: 'Domingos' },
  fr: { lun: 'Lundis', mar: 'Mardis', mie: 'Mercredis', jue: 'Jeudis', vie: 'Vendredis', sab: 'Samedis', dom: 'Dimanches' },
  en: { lun: 'Mondays', mar: 'Tuesdays', mie: 'Wednesdays', jue: 'Thursdays', vie: 'Fridays', sab: 'Saturdays', dom: 'Sundays' },
}

/** Caso especial de lunes a viernes: la enumeracion completa se lee peor que el rango. */
export const SEMANA_LABEL: Record<Locale, string> = {
  pt: 'Segunda a sexta',
  es: 'De lunes a viernes',
  fr: 'Du lundi au vendredi',
  en: 'Monday to Friday',
}

export const CONJUNCION: Record<Locale, string> = { pt: ' e ', es: ' y ', fr: ' et ', en: ' and ' }

export const AUDIENCIA_LABEL: Record<Locale, Record<Audiencia, string>> = {
  pt: { adultos: 'Adultos', criancas: 'Crianças' },
  es: { adultos: 'Adultos', criancas: 'Niños' },
  fr: { adultos: 'Adultes', criancas: 'Enfants' },
  en: { adultos: 'Adults', criancas: 'Children' },
}

/** "Buki Waza" no se traduce: es el nombre de la practica con armas. */
export const VARIANTE_LABEL: Record<Locale, Record<Variante, string>> = {
  pt: { almuerzo: 'almoço', tarde: 'tarde', armas: 'Buki Waza' },
  es: { almuerzo: 'mediodía', tarde: 'tarde', armas: 'Buki Waza' },
  fr: { almuerzo: 'midi', tarde: 'soir', armas: 'Buki Waza' },
  en: { almuerzo: 'midday', tarde: 'evening', armas: 'Buki Waza' },
}

/**
 * Vocabulario de los formularios publicos (spec 0050). No es contenido editable: son los
 * estados de un boton y el aviso de que algo fallo, que el visitante ve mientras el
 * formulario habla con el servidor. El texto que **si** escribe el dojo —label del boton y
 * mensaje de confirmacion— vive en la definicion del formulario.
 */
export const FORM_UI: Record<
  Locale,
  { enviando: string; error: string; indisponible: string; opcional: string; elegir: string }
> = {
  pt: {
    enviando: 'A enviar…',
    error: 'Não foi possível enviar. Tente novamente dentro de instantes.',
    indisponible: 'O envio está temporariamente indisponível. Escreva-nos por e-mail.',
    opcional: 'opcional',
    elegir: 'Escolha uma opção',
  },
  es: {
    enviando: 'Enviando…',
    error: 'No se ha podido enviar. Vuelve a intentarlo en unos instantes.',
    indisponible: 'El envío no está disponible ahora mismo. Escríbenos por email.',
    opcional: 'opcional',
    elegir: 'Elige una opción',
  },
  fr: {
    enviando: 'Envoi en cours…',
    error: "L'envoi a échoué. Réessayez dans quelques instants.",
    indisponible: "L'envoi est momentanément indisponible. Écrivez-nous par e-mail.",
    opcional: 'facultatif',
    elegir: 'Choisissez une option',
  },
  en: {
    enviando: 'Sending…',
    error: 'The message could not be sent. Please try again in a moment.',
    indisponible: 'Sending is temporarily unavailable. Please write to us by email.',
    opcional: 'optional',
    elegir: 'Choose an option',
  },
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
    { label: labels.events, href: pathFor('events', locale) },
    { label: labels.schools, href: pathFor('schools', locale) },
    { label: labels.otherArts, href: pathFor('otherArts', locale) },
    { label: labels.contact, href: pathFor('contact', locale) },
  ]
}

export function urlFor(page: PageKey, locale: Locale, site: URL | string): string {
  return new URL(pathFor(page, locale), site).href.replace(/\/$/, '') || String(site)
}
