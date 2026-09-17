---
spec: 0001
fecha: 2026-09-17
estado: implementada
resumen: Scaffold Astro estatico con i18n de 4 idiomas, contenido JSON validado con zod y head de SEO completo (canonical, hreflang, OG, JSON-LD). Solo la home.
disjunta: si
archivos: package.json, astro.config.mjs, tsconfig.json, src/**, content/**
---

# 0001 — Scaffold

## Problema

No hay proyecto. Antes de migrar 34 paginas hace falta que la maquinaria este probada en
una: que el contenido salga de un JSON validado, que las 4 variantes de idioma se generen
como HTML estatico, y que el `<head>` emita canonical, hreflang y JSON-LD correctos.

Si esa maquinaria se valida recien con 34 paginas cargadas, cada error se paga 34 veces.

## Alcance

**Entra:**
- Proyecto Astro `output: 'static'`, TypeScript en `strict`.
- Routing i18n: `pt` sin prefijo (`/`), `es`/`fr`/`en` con prefijo (`/es/`, `/fr/`, `/en/`).
- `content/<locale>/<pagina>.json` + schema zod + loader que **falla el build** si un JSON
  no valida o si falta un idioma.
- Layout base + componente `Seo` con: `<title>`, `description`, canonical, `hreflang`
  reciproco de los 4 idiomas + `x-default`, Open Graph, y JSON-LD `SportsClub` con las 3
  sedes (Benfica, Lumiar, Encarnacao).
- Una sola pagina: **home**, en los 4 idiomas, con contenido **placeholder**.
- Tailwind v4.
- `npm run build`, `npm run typecheck`.

**No entra:** (explicito — es lo que evita el scope creep)
- Backoffice, auth, DB, R2, Resend. Son las specs 0002 y 0003.
- Contenido real. El scaffold usa placeholders; migrar textos es otra tarea.
- Las otras 10 paginas. Entran cuando exista el baseline (tarea 1 de TASKS).
- Diseño visual definitivo. El scaffold usa marcado semantico sin maquetar; el rediseño
  es trabajo aparte y no bloquea la maquinaria.
- Redirects 301. Necesitan el mapa completo de URLs (tarea 6).
- Sitemap y `robots.txt`. Entran con el set completo de paginas.

## Diseño

**Nomenclatura de contenido.** El ADR-0002 ilustraba los archivos con el slug traducido
(`fr/accueil.json`). Se usa la **clave de pagina** en vez del slug — `content/fr/home.json`
— porque el loader necesita la misma clave en los 4 idiomas para cruzarlos y emitir
hreflang. El slug localizado vive en el registro de rutas, que es donde corresponde: es
routing, no contenido.

**Registro de rutas** (`src/lib/i18n.ts`): una tabla `pagina -> slug por idioma`. Es la
unica fuente de los paths, y de ahi salen tanto las rutas generadas como los `hreflang`.
La home tiene slug vacio en los 4 idiomas.

**Loader** (`src/lib/content.ts`): `import.meta.glob` eager sobre `content/**/*.json`,
valida cada uno con su schema zod y tira si falta o no valida. Eager y en build: un JSON
mal cargado tiene que romper el build, no producir una pagina rota en produccion.

**PT sin prefijo** es deliberado: la home actual es `/` y es la pagina con mas autoridad
del sitio. Mantener su URL exacta elimina el unico redirect que podria dolar de verdad.

## Archivos

| Archivo | Accion |
|---|---|
| `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example` | crear |
| `src/lib/i18n.ts` | crear — locales, registro de rutas, helpers de path |
| `src/lib/content.ts` | crear — schemas zod + loader |
| `src/lib/site.ts` | crear — datos de la organizacion (sedes, redes) para el JSON-LD |
| `src/components/Seo.astro` | crear |
| `src/layouts/Base.astro` | crear |
| `src/pages/index.astro`, `src/pages/[lang]/index.astro` | crear |
| `src/styles/global.css` | crear |
| `content/{pt,es,fr,en}/home.json` | crear |

### Disjunta?

**Si.** Es la primera spec; no hay otras abiertas con las que colisionar.

## Verificacion

Corrida el 2026-09-17:

- [x] `npm run typecheck` → 0 errors, 0 warnings
- [x] `npm run build` genera `dist/index.html`, `dist/es/index.html`, `dist/fr/index.html`,
      `dist/en/index.html` — 4 paginas, 247ms
- [x] El HTML emitido no tiene **ningun script ejecutable**. El unico `<script>` es el
      bloque `application/ld+json`, que es datos, no codigo. `dist/` pesa 28K entero.
- [x] Cada HTML tiene canonical propio, los 4 `hreflang` + `x-default`, y el JSON-LD
      `SportsClub` con Benfica, Lumiar y Encarnacao
- [x] Sacar `quote.author` de `content/fr/home.json` → build **exit 1** con
      `content: ../../content/fr/home.json no valida / quote.author: expected string`

## Abierto

Nada. El contenido real entra con la migracion, que es otra tarea.
