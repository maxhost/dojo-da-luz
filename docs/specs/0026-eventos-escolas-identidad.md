---
spec: 0026
fecha: 2026-09-20
estado: implementada
resumen: Páginas Eventos y Escolas en cuatro idiomas, parceiros en la Home, Instagram verificado e identidad azul en todo el sitio.
disjunta: no
archivos: src/lib/{i18n,content}.ts, src/components/**, src/pages/{eventos,escolas}/**, src/pages/[lang]/[...page].astro, content/*/{home,events,schools}.json, src/styles/global.css, docs/**
---

# 0026 — Eventos, Escolas e identidad azul

## Problema

Tres huecos observables:

1. No hay dónde anunciar seminarios ni treinos abertos, y no hay página que muestre las
   escuelas y la comunidad — material que el sitio Wix sí tiene.
2. La Home no nombra a las entidades con las que el dojo colabora, presentes en el sitio
   actual.
3. El acento rojo óxido de las direcciones 0006/0010 no es el color con el que la
   asociación se identifica (ADR-0021).

## Alcance

**Entra:**

- Páginas Eventos y Escolas en pt/es/fr/en con slug localizado y entrada en el menú global.
- `eventsSchema` y `schoolsSchema` en `content.ts`; ocho ficheros de contenido nuevos.
- Sección de parceiros en la Home, con los logotipos que ya publica el sitio Wix.
- Instagram en `SocialLinks`, junto a Facebook.
- Sustitución del acento rojo por `#0099ff` en todos los componentes y tipografía
  Oxanium para la marca.
- Fotografía de hero en Aikido, retrato de la familia Ueshiba y tres instructores
  adicionales en Dojo.

**No entra:**

- Fechas reales de los eventos: el contenido queda con "Data a confirmar".
- Descargar o rehospedar los medios: siguen servidos desde `static.wixstatic.com`.
- Cambios en formularios, backoffice o redirects activos.

## Diseño

`PageKey` gana `events` y `schools`; `ROUTES`, `NAV_LABELS` y `siteNav` los acompañan, de
modo que rutas, hreflang y menú siguen saliendo de una sola fuente. Los idiomas no
canónicos se generan en `[lang]/[...page].astro`; el portugués tiene su página propia sin
prefijo, como el resto.

`EventsView` y `SchoolsView` leen contenido validado: la lista de eventos exige entre 3 y
4 entradas y la galería de escuelas entre 4 y 8, así que un contenido incompleto rompe el
build en vez de publicar un hueco.

Los parceiros son una constante en `HomeView` duplicada para el carrusel CSS; no hay
JavaScript nuevo.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/i18n.ts` | editar |
| `src/lib/content.ts` | editar |
| `src/components/{EventsView,SchoolsView}.astro` | crear |
| `src/components/{HomeView,ClassesView,AudienceView,AikidoView,DojoView,TeacherView,ContactView,OtherArtsView,FormModal,SocialLinks}.astro` | editar |
| `src/layouts/Base.astro` | editar |
| `src/pages/{eventos,escolas}/index.astro` | crear |
| `src/pages/[lang]/[...page].astro` | editar |
| `src/pages/admin/entrar.astro` | editar |
| `content/{pt,es,fr,en}/{events,schools}.json` | crear |
| `content/{pt,es,fr,en}/home.json` | editar |
| `src/styles/global.css` | editar |
| `docs/adr/{0021-identidad-azul,0022-eventos-y-escolas}.md` | crear |
| `docs/design/09-arquitectura-urls-y-redirects.md` | editar |
| `docs/{INDEX,TASKS}.md` | editar |

### Disjunta?

No. Toca `i18n.ts`, `content.ts` y casi todos los componentes a la vez. Se implementa en
serie con cualquier otra spec abierta.

### Archivos compartidos

No requiere contratos previos de otro agente.

## Verificación

- [x] `astro check` → 0 errores, 0 warnings, 0 hints.
- [x] `npm test` → 5/5.
- [x] `npm run build` → 44 `index.html` en `.vercel/output/static` (36 antes).
- [x] Las 8 rutas nuevas existen y declaran el idioma correcto: `/eventos` y `/escolas`
      en `pt-PT`, `/es/eventos` y `/es/escuelas` en `es`, `/fr/evenements` en `fr`,
      `/en/schools` en `en`.
- [x] La raíz `/` sigue siendo portuguesa: `<html lang="pt-PT">`, título en portugués y
      `hreflang="x-default"` apuntando a `/`.
- [x] El perfil `instagram.com/dojodaluz` responde 200 y su `og:title` es "Pablo Duran"
      (ADR-0014: solo URLs verificadas).
- [x] `git diff --check` limpio.

## Abierto

- Las fechas de los eventos son marcadores ("Data a confirmar"). Hasta que el cliente las
  confirme, la página no debe anunciarse como agenda.
- Los tres instructores adicionales de Dojo (`Inês Martins`, `Miguel Costa`,
  `Sofia Almeida`) son contenido de relleno hardcodeado en el componente: hay que
  confirmarlos con el dojo y, si se quedan, moverlos a `content/*/dojo.json`.
- Los logotipos de parceiros sin nombre confirmado se publican como "Parceiro do Dojo da
  Luz"; faltan sus nombres reales.
