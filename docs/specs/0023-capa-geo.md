---
spec: 0023
fecha: 2026-09-18
estado: cerrada
resumen: Capa GEO de la Home: resumen citable y FAQ visibles en los cuatro idiomas, FAQPage en el JSON-LD, robots con crawlers de IA por nombre y /llms.txt generado.
disjunta: no
archivos: src/lib/content.ts, src/lib/site.ts, src/components/HomeView.astro, src/pages/llms.txt.ts, public/robots.txt, content/{pt,es,fr,en}/home.json
---

# 0023 — Capa GEO de la Home

## Problema

El cliente pidio "mejorar GEO" y aclaro que se refiere a **generative engine
optimization**: que ChatGPT, Perplexity o las respuestas de IA de Google citen al dojo
cuando alguien pregunta donde practicar Aikido en Lisboa.

La home de hoy es poesia: *"Entre o céu"*, *"Não vencer"*, *"Três lugares"*. Funciona con
personas y es la direccion elegida en el ADR-0010. Pero un motor que extrae frases para
responder no tiene de donde agarrar: no hay una sola oracion autocontenida que diga que es
esto, donde queda y para quien es. Tampoco hay preguntas respondidas, que es exactamente el
formato que estos motores consumen.

El ADR-0018 fija que se hace y, sobre todo, que no.

## Alcance

**Entra, solo para Home:**

- `resumen`: 2-3 frases autocontenidas por idioma, con sujeto explicito, visibles en la
  pagina. Alimentan ademas `description` del JSON-LD.
- `faq`: lista de `{pregunta, respuesta}` por idioma, renderizada como HTML visible
  (`<h3>` + parrafo, sin `<details>`: el contenido colapsado se extrae peor y no aporta).
- `FAQPage` en el JSON-LD de la home, solo si hay al menos una entrada.
- `public/robots.txt`: `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`,
  `Google-Extended` y `CCBot` por nombre, con `Allow: /` y `Disallow: /admin`.
- `/llms.txt` generado desde el contenido: titulo, resumen y lista de paginas por idioma.

**No entra:**

- El resto de las paginas. Home primero; el patron se replica despues con su propia spec.
- Tocar la poesia existente. El hero, los rotulos `01 · A montanha` y los titulos se quedan
  como estan: la capa factual **se suma**, no reemplaza.
- Texto oculto, `aria-hidden` con keywords, bloques solo para bots. Es cloaking y ademas no
  funciona: estos motores puntuan lo que el usuario ve.
- Medir posiciones en LLMs. No hay ranking estable; la verificacion es cualitativa y con
  fecha (ADR-0018).

## Diseño

Se agrega a `homeSchema`:

```ts
resumen: z.array(z.string().min(40)).min(2).max(4),   // frases, no un parrafo suelto
faq: z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  items: z.array(z.object({
    pregunta: z.string().min(8),
    respuesta: z.string().min(40),
  })).min(3).max(12),
}),
```

El `min(40)` no es capricho: una respuesta de cinco palabras no se puede citar sin el
contexto, y es el modo de fallo previsible cuando el cliente complete el formulario
apurado. El schema lo frena en el build, no en produccion.

**Ubicacion en la pagina:** la FAQ va antes del umbral final (`04 · O umbral`), como
seccion `05 · Perguntas`. El `resumen` va en la seccion de practica, como bajada factual
debajo de la poesia — el lugar donde hoy el lector busca "¿de que va esto?".

**`/llms.txt`** es una ruta prerenderizada que emite markdown con el resumen y el indice de
las 36 URLs agrupadas por idioma. Apuesta explicita del ADR-0018: ningun motor documento que
lo lea. Cuesta veinte lineas.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/content.ts` | editar (`resumen` y `faq` en `homeSchema`) |
| `src/lib/site.ts` | editar (`faqJsonLd`) |
| `src/components/HomeView.astro` | editar (resumen + seccion FAQ) |
| `src/pages/llms.txt.ts` | crear |
| `public/robots.txt` | editar |
| `content/{pt,es,fr,en}/home.json` | editar |

### Disjunta?

**No.** Comparte `src/lib/content.ts`, `src/lib/site.ts`, `HomeView.astro` y los cuatro
`home.json` con la spec 0020. Orden: **0020 → 0023 → 0021**.

## Verificacion

- [ ] `npm run typecheck` y `npm test` limpios; build con 36 estaticas + `/llms.txt`.
- [ ] Las 4 homes contienen el `resumen` y las preguntas como **texto visible** en el HTML
      (verificable con `curl | grep`, sin ejecutar JS).
- [ ] El JSON-LD de cada home parsea e incluye un `FAQPage` con tantas entradas como el JSON.
- [ ] Borrar una respuesta o dejarla en 10 caracteres **rompe el build** nombrando el campo.
- [ ] `curl /robots.txt` lista los seis crawlers y ninguno tiene `Disallow: /`.
- [ ] `curl /llms.txt` devuelve markdown con las URLs de los cuatro idiomas.
- [ ] Cero `<script>` ejecutable nuevo en la home: sigue siendo solo `application/ld+json`.

## Abierto

Las respuestas de la FAQ las tiene que dar el cliente (precio real, edad minima, que llevar
a la primera clase). Se arranca con las que ya estan respondidas en el contenido actual y
las que falten quedan fuera del archivo hasta que lleguen: **no se inventan datos** — una
respuesta inventada citada por un motor es peor que ninguna.
