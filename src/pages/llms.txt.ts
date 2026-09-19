import type { APIRoute } from 'astro'
import { getContent } from '../lib/content'
import { HREFLANG, LOCALES, LOCALE_NAME, PAGES, pathFor } from '../lib/i18n'
import { ORG } from '../lib/site'

/**
 * Mapa del sitio en markdown para motores generativos (llmstxt.org).
 *
 * Apuesta explicita del ADR-0018: **ningun motor documento que lo consuma**. Entra porque
 * se genera del mismo contenido y cuesta veinte lineas; sale sin costo si no sirve.
 */
export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://www.aikido-duran.com/').replace(/\/$/, '')
  const home = getContent('home', 'pt')

  const lineas = [`# ${ORG.name} — ${ORG.alternateName}`, '']

  for (const frase of home.resumen) lineas.push(`> ${frase}`)
  lineas.push('')

  for (const locale of LOCALES) {
    lineas.push(`## ${LOCALE_NAME[locale]} (${HREFLANG[locale]})`, '')

    for (const page of PAGES) {
      const contenido = getContent(page, locale)
      lineas.push(`- [${contenido.seo.title}](${base}${pathFor(page, locale)}): ${contenido.seo.description}`)
    }

    lineas.push('')
  }

  return new Response(lineas.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
