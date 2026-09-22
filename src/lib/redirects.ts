/**
 * Las 36 reglas `301` que traen las URLs del Wix al sitio nuevo (spec 0045).
 *
 * El dato manda: la matriz sale de `docs/design/10-inventario-wix.md`, que es el crawl del
 * 2026-09-21 contra `www.aikido-duran.com`, no del diseño del documento 09. Donde los dos
 * difieren —`/parcerias`, `/enlaces-es` y `/links-fr`— gana el crawl, porque la rejilla de
 * parceiros vive en la Home desde el ADR-0024 y los anchors que proponia el 09 no existen
 * en ninguna pagina.
 *
 * Esto es un modulo y no literales dentro de `astro.config.mjs` por una sola razon: asi se
 * puede testear. `redirects.test.ts` cruza cada destino contra `PAGES × LOCALES` y contra
 * los anchors verificados, que es lo unico que impide mandar una URL con backlinks a un
 * 404.
 *
 * Reglas: un solo salto, sin comodines, destinos **sin barra final** (`trailingSlash:
 * 'never'` en la config: con barra habria un segundo salto).
 *
 * `/` y `/outras-artes` no figuran: son las mismas rutas en el sitio nuevo y las sirve el
 * build. Son las dos que completan los 38 origenes conocidos del inventario.
 */
export const REDIRECTS_WIX: Record<string, string> = {
  // Inicio
  '/iniciopt': '/',
  '/inicioes': '/es',
  '/accueil-fr': '/fr',

  // Aulas y conversion
  '/horarios-e-preospt': '/aulas',
  '/horarios-tarifases': '/es/clases',
  '/horaires-et-tarifs-fr': '/fr/cours',
  '/aula-experimental': '/aulas/adultos#aula-experimental',
  '/criancas': '/aulas/criancas',

  // Aikido, videos y lecturas. Los videos historicos y la bibliografia no tienen pagina
  // propia en el sitio nuevo: su tema es la disciplina.
  '/aikidopt': '/aikido',
  '/aikidoes': '/es/aikido',
  '/akido-fr': '/fr/aikido', // typo historico del origen: se preserva tal cual esta vivo
  '/videospt': '/aikido',
  '/videos-es': '/es/aikido',
  '/videos-fr': '/fr/aikido',
  '/lectura-es': '/es/aikido',
  '/lecture-fr': '/fr/aikido',
  '/_files/ugd/ae7240_bf5b66ead42f42c189d64ba5bbbb3f47.pdf': '/fr/aikido',

  // Dojo, profesor y galerias. Las fotos eran del dojo: no hay galeria suelta.
  '/dojo-da-luz-pt': '/dojo',
  '/dojo-da-luz-es': '/es/dojo',
  '/dojo-da-luz-fr': '/fr/dojo',
  '/prefessorpt': '/professor-pablo-duran', // otro typo historico vivo
  '/profesores': '/es/profesor-pablo-duran',
  '/enseignant-fr': '/fr/professeur-pablo-duran', // fuera del sitemap del Wix
  '/fotospt': '/dojo',
  '/fotos-es': '/es/dojo',
  '/photos-fr': '/fr/dojo',

  // Contacto
  '/contactospt': '/contactos', // fuera del sitemap del Wix
  '/contacto-es': '/es/contacto',
  '/coordonnees-fr': '/fr/contact',

  // Actualidad y eventos
  '/eventos-e-destaquespt': '/eventos',
  '/atualidadept': '/eventos', // fuera del sitemap del Wix
  '/actualidad-es': '/es/eventos',
  '/actualit-fr': '/fr/evenements',

  // Parcerias y enlaces: corrige el documento 09, que apuntaba a anchors inexistentes
  '/parcerias': '/#parcerias',
  '/enlaces-es': '/es#parcerias',
  '/links-fr': '/fr#parcerias',
}

/**
 * Los anchors que existen de verdad, y en que paginas. Verificados contra el HTML
 * construido el 2026-09-21 (`docs/design/10-inventario-wix.md`). El test los usa para
 * rechazar un destino con `#` que apunte a una pagina donde ese `id` no esta.
 */
export const ANCHORS_VERIFICADOS: Record<string, string[]> = {
  '/': ['parcerias', 'aulas', 'dojo', 'umbral'],
  '/es': ['parcerias', 'aulas', 'dojo', 'umbral'],
  '/fr': ['parcerias', 'aulas', 'dojo', 'umbral'],
  '/en': ['parcerias', 'aulas', 'dojo', 'umbral'],
  // El anchor de las cuotas esta traducido —`quotas`, `cuotas`, `tarifs`, `fees`—, al
  // contrario de lo que decia el inventario. Medido en el HTML, no copiado del documento.
  '/aulas': ['aula-experimental', 'horarios', 'quotas', 'criancas', 'faq'],
  '/es/clases': ['aula-experimental', 'horarios', 'cuotas', 'criancas', 'faq'],
  '/fr/cours': ['aula-experimental', 'horarios', 'tarifs', 'criancas', 'faq'],
  '/en/classes': ['aula-experimental', 'horarios', 'fees', 'criancas', 'faq'],
  '/aulas/adultos': ['aula-experimental'],
  '/es/clases/adultos': ['aula-experimental'],
  '/fr/cours/adultes': ['aula-experimental'],
  '/en/classes/adults': ['aula-experimental'],
  '/dojo': ['pablo-duran'],
  '/es/dojo': ['pablo-duran'],
  '/fr/dojo': ['pablo-duran'],
  '/en/dojo': ['pablo-duran'],
}

/** Separa `/aulas/adultos#aula-experimental` en su path y su anchor. */
export function partirDestino(destino: string): { path: string; anchor: string | null } {
  const i = destino.indexOf('#')
  if (i === -1) return { path: destino, anchor: null }
  // `/#parcerias` es la raiz con anchor, no un path vacio.
  return { path: destino.slice(0, i) || '/', anchor: destino.slice(i + 1) }
}

/** La forma que espera `astro.config.mjs`: permanente y explicito, nunca 302. */
export const redirectsParaAstro = (): Record<string, { status: 301; destination: string }> =>
  Object.fromEntries(
    Object.entries(REDIRECTS_WIX).map(([origen, destino]) => [origen, { status: 301 as const, destination: destino }]),
  )
