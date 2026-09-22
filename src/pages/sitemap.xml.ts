import type { APIRoute } from 'astro'
import { HREFLANG, LOCALES, PAGES, pathFor, DEFAULT_LOCALE } from '../lib/i18n'

/**
 * `sitemap.xml` de las 44 paginas, generado de `PAGES × LOCALES` — la misma fuente que
 * construye las rutas y que emite `/llms.txt` (spec 0045).
 *
 * No se usa `@astrojs/sitemap` a proposito: el integrador no conoce la relacion entre las
 * cuatro versiones de una pagina, y lo que le importa a Google aca es justamente el
 * `hreflang` reciproco — las once paginas x cuatro idiomas son una sola pagina en cuatro
 * lenguas, no 44 paginas sueltas.
 *
 * **Ninguna URL redirigida entra.** Los 36 origenes del Wix viven en
 * `src/lib/redirects.ts` y no salen de aca: un sitemap que lista una URL que devuelve 301
 * es un error de Search Console, no una ayuda.
 *
 * Sin `lastmod`: el contenido lo edita el backoffice commiteando a `main` (ADR-0025) y no
 * hay una fecha por pagina que no sea mentira. Una fecha inventada es peor que ninguna.
 */
export const prerender = true

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.aikido-duran.com/')

  // La misma forma exacta que emite el `canonical` de `Seo.astro`, barra final incluida:
  // un `<loc>` que no coincide con el canonical de su pagina es ruido en Search Console.
  const absoluta = (p: string) => new URL(p, base).href.replace(/(.)\/$/, '$1')
  const url = (page: (typeof PAGES)[number], locale: (typeof LOCALES)[number]) => escapar(absoluta(pathFor(page, locale)))

  const lineas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']

  for (const page of PAGES) {
    // Los `xhtml:link` son los mismos cuatro en las cuatro entradas de la pagina: eso es
    // lo que significa reciproco. `x-default` va al portugues, que es el idioma del dojo.
    const alternates = [
      ...LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${url(page, l)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(page, DEFAULT_LOCALE)}"/>`,
    ]

    for (const locale of LOCALES) {
      lineas.push('  <url>', `    <loc>${url(page, locale)}</loc>`, ...alternates, '  </url>')
    }
  }

  lineas.push('</urlset>', '')

  return new Response(lineas.join('\n'), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
