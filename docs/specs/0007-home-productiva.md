---
spec: 0007
fecha: 2026-09-17
estado: implementada
resumen: Migrar el Diseño C de /mockup/ a la home productiva, con contenido en JSON validado y /mockup/ retirado.
disjunta: no
archivos: src/pages/index.astro, src/pages/mockup.astro, src/components/HomeView.astro, src/components/SectionLabel.astro, src/layouts/Base.astro, src/lib/content.ts, content/*/home.json, docs/design/README.md, docs/design/07-preview-local.md, docs/INDEX.md, docs/TASKS.md
---

# 0007 — Home productiva con el Diseño C

## Problema

La home real (`/`, vía `HomeView.astro`) sigue siendo el marcado provisional del scaffold
(spec 0001) con contenido placeholder genérico. La dirección visual aceptada (ADR-0009,
paisaje sol → montaña → tierra → dojo → umbral) sólo existe en `/mockup/`, una ruta
`noindex` con texto embebido y sin contrato de contenido. Task #4 de `docs/TASKS.md`
queda abierta: "falta migrarlo a componentes productivos y JSON".

## Alcance

**Entra:**
- Reemplazar el contenido de `HomeView.astro` por el paisaje del Diseño C (hero, montaña,
  tierra, dojo, umbral) consumiendo contenido vía `getContent('home', locale)`, igual que
  hoy hace el scaffold.
- Nuevo `homeSchema` (zod) que reemplaza al placeholder actual: refleja las cinco secciones
  reales en vez de `values`/`benefits`/`quote` genéricos.
- Los 4 `content/<locale>/home.json` reescritos contra el nuevo schema.
  - **pt** lleva el texto ya aceptado del mockup (dirección validada por ADR-0008/0009):
    no es contenido final del cliente, pero es la copia directional vigente, no un
    placeholder inventado de cero.
  - **es/fr/en** quedan con placeholder estructurado y explícitamente marcado como tal
    (mismo criterio que ya usa el scaffold hoy) — traducirlos es decisión de contenido,
    no de este spec.
- `Base.astro`: sacar el `max-w-3xl` fijo del `<main>` (rompe el layout full-bleed del
  paisaje) y adaptar la paleta del header/footer a paper/ink/red. Se agrega un prop
  opcional `nav` (lista de anclas) para el menú de sección — vacío por defecto, así no
  afecta a una futura página sin anclas propias — y un slot opcional para la nota de pie
  (sedes) que hoy sólo llena la home.
- `SectionLabel.astro`: único átomo que se repite igual 4 veces en el mockup (`01 · A
  montanha`, etc.) — se extrae. El resto de las secciones no se abstrae: cada una es un
  SVG y layout distinto, no hay repetición real que justifique un componente por sección.
- Retirar `src/pages/mockup.astro`: su función (evaluar el diseño antes de comprometerlo)
  se cumplió; mantenerlo vivo en paralelo a la home productiva es andamiaje que diverge en
  silencio. `docs/specs/0003-home-mockup.md` (implementada) queda como registro histórico,
  no se reescribe.
- Actualizar `docs/design/README.md` y `docs/design/07-preview-local.md` (docs vivos) para
  apuntar a `/` en vez de `/mockup/`.
- Fila nueva en `docs/INDEX.md`, actualizar `docs/TASKS.md`.

**No entra:**
- Contenido final del cliente (task #3, bloqueada por baseline/crawl).
- Traducción de la copia nueva a es/fr/en.
- Descarga de las imágenes de wixstatic a repo/R2 (task #1, "próximo"): se mantienen las
  mismas URLs hotlinked que ya usaba `/mockup/`, como constantes del componente — no son
  contenido editable por backoffice todavía.
- Carga real de Newsreader/IBM Plex Sans autohospedadas (pendiente, no bloquea el layout):
  se sigue usando `font-serif`/`font-sans` de Tailwind, igual que el mockup.
- Nav productiva a otras páginas (Clases, Aikido, Dojo, Contacto): no existen todavía
  (`PageKey` sólo tiene `'home'`). El menú de esta spec son anclas dentro de la home.
- Destino real del CTA de aula experimental: sigue `mailto:EMAIL-PENDENTE`, igual que hoy.

## Diseño

`homeSchema` nuevo (reemplaza al de spec 0001, que era placeholder puro):

```
seo: { title, description }
chrome: {
  caption, menuLabel, skipLink,
  nav: [{ label, href }]          // anclas de la home: #montanha #terra #dojo #umbral
  footerNote: { areas, orgType }  // "Benfica · Lumiar" / "Associação sem fins lucrativos"
}
hero: { eyebrowLines[], titleLines[], titleHighlight, tagline }
practice: { label, titleLines[], paragraphs[] }        // 01 · A montanha
places: { label, titleLines[], lead, ctaLabel, items: [{ name, dojo, time }] }  // 02 · A terra
dojo: { label, titleLines[], photoCaption, photoAlt, teacher: { name, credentialsLines[], bio, photoAlt } } // 03
threshold: { label, titleLines[], text, ctaLabel }      // 04 · O umbral
```

El caracter 合気道 del hero es decorativo y no traducible (es la palabra "aikido" en
kanji, no cambia por idioma) — queda como constante en `HomeView.astro`, no en el JSON.

`Base.astro` gana:
- `<main id="conteudo">` sin `max-w-3xl px-6 py-12` fijo — cada página controla su ancho.
- Paleta paper (`#f7f5ed`)/ink (`#1d1c19`)/red (`#a32d21`) en header y footer, vía el mismo
  patrón `style is:inline` con variables CSS que ya usaba el mockup (no se toca
  `tailwind.config`, son valores puntuales).
- Prop `nav?: { label: string; href: string }[] = []`: si no está vacío, renderiza el
  `<details>`/`Menu` que hoy vive sólo en el mockup.
- `<slot name="footer-note" />` opcional en el footer, para la línea de sedes.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/content.ts` | editar — nuevo `homeSchema` |
| `content/pt/home.json` | editar — copia del mockup, estructurada |
| `content/es/home.json`, `content/fr/home.json`, `content/en/home.json` | editar — placeholder estructurado |
| `src/components/SectionLabel.astro` | crear |
| `src/components/HomeView.astro` | editar — reemplazo completo por el paisaje |
| `src/layouts/Base.astro` | editar — main full-bleed, paleta, prop `nav`, slot `footer-note` |
| `src/pages/mockup.astro` | eliminar |
| `docs/design/README.md` | editar — artefacto ahora es `/`, no `/mockup/` |
| `docs/design/07-preview-local.md` | editar — preview apunta a `/` |
| `docs/INDEX.md` | editar — fila spec 0007 |
| `docs/TASKS.md` | editar — cerrar task #4, mover a Hecho |

### Disjunta?

No: toca `Base.astro` y `HomeView.astro`, que son los mismos archivos de la spec 0001
(scaffold, ya implementada) y comparte `content/*/home.json` con esa spec. No hay otra
spec abierta en paralelo — se ejecuta sola.

### Archivos compartidos

Ninguno nuevo: todo lo que se toca ya existe.

## Verificación

- [x] `npm run typecheck` limpio — 0 errores, 0 warnings
- [x] `npm run build` genera `/`, `/es/`, `/fr/`, `/en/` (no `/mockup/`) — verificado listando
      `.vercel/output/static/**/index.html`; único `<script>` es el JSON-LD de `Seo.astro`
      (dato, no JS ejecutable — mismo criterio que ADR-0001 viene aplicando desde spec 0002)
- [x] `homeSchema` nuevo: el build rompe si un JSON no matchea (probado durante el
      desarrollo — zod tira `content: ... no valida` con el detalle del campo)
- [x] Verificado en el HTML generado: los 4 `id` de sección (`montanha`, `terra`, `dojo`,
      `umbral`) presentes; hero y footer de `pt` con la copia del mockup; `es` con 45
      ocurrencias de `Placeholder` (contrato nuevo, sin traducir); hreflang recíproco
      pt-PT/es/fr/en/x-default correcto. No se pudo abrir en un navegador real: el sandbox
      de esta sesión no expone binarios de browser ni permite bind a un puerto (mismo
      límite que ya documentaba `docs/design/07-preview-local.md`).
- [x] `rg "mockup"` en `src/` no devuelve nada (ruta retirada)

## Abierto

- Traducción real de es/fr/en queda pendiente de la migración de contenido (task #3).
- Paleta/tipografía definitiva de todo el sitio (más allá de la home) se decide cuando
  existan más páginas — por ahora los cambios de `Base.astro` son los mínimos para que la
  home no choque visualmente con el chrome compartido.
