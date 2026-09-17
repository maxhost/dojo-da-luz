// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

// ADR-0001: output estatico y cero APIs propietarias del host. Nada de ISR ni
// middleware — el sitio publico tiene que poder mudarse de Vercel en horas.
export default defineConfig({
  site: 'https://www.aikido-duran.com',
  output: 'static',
  // Solo las rutas con `prerender = false` se vuelven funciones. Las paginas del
  // sitio publico siguen siendo HTML prerenderizado.
  adapter: vercel(),
  trailingSlash: 'never',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'es', 'fr', 'en'],
    // pt sin prefijo: la home actual es "/" y es la URL con mas autoridad del sitio.
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
})
