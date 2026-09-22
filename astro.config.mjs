// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { redirectsParaAstro } from './src/lib/redirects.ts'

// ADR-0001: output estatico y cero APIs propietarias del host. Nada de ISR ni
// middleware — el sitio publico tiene que poder mudarse de Vercel en horas.
export default defineConfig({
  site: 'https://www.aikido-duran.com',
  output: 'static',
  // Solo las rutas con `prerender = false` se vuelven funciones. Las paginas del
  // sitio publico siguen siendo HTML prerenderizado.
  adapter: vercel(),
  trailingSlash: 'never',
  // Las 36 URLs del Wix (spec 0045). El mapa vive en `src/lib/redirects.ts` para que
  // `redirects.test.ts` pueda cruzar cada destino contra las 44 rutas reales: escritas
  // aca serian literales que nadie puede probar hasta el dia del cambio de DNS.
  redirects: redirectsParaAstro(),
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'es', 'fr', 'en'],
    // pt sin prefijo: la home actual es "/" y es la URL con mas autoridad del sitio.
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
})
