---
spec: 0023
fecha: 2026-09-19
estado: implementada
resumen: Resumen citable en la Home y respuestas autocontenidas con FAQPage en Aulas, Adultos y Niños; robots con crawlers de IA por nombre y /llms.txt generado.
disjunta: no
archivos: src/lib/content.ts, src/lib/site.ts, src/components/{HomeView,ClassesView,AudienceView}.astro, src/pages/llms.txt.ts, public/robots.txt, content/{pt,es,fr,en}/{home,classes,adults,children}.json
---

# 0023 — Capa GEO

## Problema

El cliente pidio "mejorar GEO" y aclaro que se refiere a **generative engine
optimization**: que ChatGPT, Perplexity o las respuestas de IA de Google citen al dojo
cuando alguien pregunta donde practicar Aikido en Lisboa.

Dos huecos concretos:

1. **La Home no tiene una sola oracion citable.** Dice *"Entre o céu"*, *"Não vencer"*,
   *"Três lugares"*. Es la direccion del ADR-0010 y funciona con personas, pero un motor
   que extrae frases no tiene de donde agarrar: ninguna dice que es esto, donde queda y
   para quien.
2. **Las respuestas existen pero no sobreviven a la extraccion.** Aulas, Adultos y Niños ya
   contestan precio, edad minima, experiencia previa y que pasa en la primera clase — pero
   varias dependen del parrafo anterior ("no hace falta", "cuesta eso"). Un fragmento
   recuperado suelto pierde el sujeto.

El ADR-0018 fija que se hace y que no, con su correccion del 2026-09-19: **el FAQ va donde
vive la pregunta, no en la Home.**

## Alcance

**Entra:**

- `resumen` en la Home: 2-3 frases autocontenidas por idioma, visibles bajo la poesia de
  `01 · A montanha`. Alimentan ademas `description` del JSON-LD.
- `qa` en Aulas, Adultos y Niños: pares `{pregunta, respuesta}` construidos **a partir del
  contenido que ya existe**, reescrito para que cada respuesta se entienda sola. Se
  renderizan como HTML visible (`<h3>` + parrafo, sin `<details>`: colapsado se extrae
  peor).
- `FAQPage` en el JSON-LD de esas tres paginas, solo si hay al menos una entrada.
- `public/robots.txt`: `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`,
  `Google-Extended` y `CCBot` por nombre, con `Allow: /` y `Disallow: /admin`.
- `/llms.txt` generado desde el contenido: titulo, resumen y las 36 URLs por idioma.

**No entra:**

- **Seccion de FAQ en la Home.** Decision explicita: duplicaria contenido y rompe la
  austeridad de la pagina. La Home solo gana el `resumen`.
- Tocar la poesia existente: hero, rotulos `01 · A montanha` y titulos se quedan. La capa
  factual **se suma**.
- Texto oculto, `aria-hidden` con keywords, bloques solo para bots. Es cloaking y ademas no
  sirve: estos motores puntuan lo que el usuario ve.
- Medir posiciones en LLMs. No hay ranking estable; la verificacion es cualitativa y con
  fecha (ADR-0018).
- Inventar datos. Una respuesta inventada y citada por un motor es peor que ninguna.

## Diseño

En `homeSchema`:

```ts
resumen: z.array(z.string().min(40)).min(2).max(4),   // frases, no un parrafo suelto
```

En `classesSchema` y `audienceEntrySchema`:

```ts
qa: z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  items: z.array(z.object({
    pregunta: z.string().min(8),
    respuesta: z.string().min(40),
  })).min(3).max(12),
}),
```

El `min(40)` no es capricho: es el modo de fallo previsible cuando el cliente complete el
formulario apurado. Una respuesta de cinco palabras no se puede citar sin su contexto, y el
schema lo frena en el build y no en produccion.

**Regla de redaccion, que es lo que realmente mueve la aguja:** cada respuesta nombra el
sujeto. *"La primera clase en el Dojo da Luz es gratuita y no requiere experiencia previa"*,
no *"Es gratuita y no hace falta experiencia"*.

**`/llms.txt`**: ruta prerenderizada con markdown. Apuesta explicita del ADR-0018 — ningun
motor documento que lo lea. Cuesta veinte lineas y sale sin costo si no sirve.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/content.ts` | editar (`resumen` en home; `qa` en classes y audiencias) |
| `src/lib/site.ts` | editar (`faqJsonLd`) |
| `src/components/HomeView.astro` | editar (resumen bajo la practica) |
| `src/components/ClassesView.astro` | editar (seccion Q&A) |
| `src/components/AudienceView.astro` | editar (seccion Q&A) |
| `src/components/QaSection.astro` | crear (la seccion es la misma en las tres paginas) |
| `src/pages/llms.txt.ts` | crear |
| `public/robots.txt` | editar |
| `content/*/home.json` | editar (resumen) |
| `content/*/{classes,adults,children}.json` | editar (qa) |

### Disjunta?

**No.** Comparte `content.ts`, `site.ts` y los `home.json` con la 0020 (ya implementada) y
precede a la 0021, que tiene que editar estos campos. Orden: 0020 ✅ → 0023 → 0021.

## Desviacion

Se sumo `src/components/QaSection.astro`, que no estaba en la lista: el bloque es identico
en Aulas, Adultos y Niños y copiarlo tres veces era peor.

Ademas se corrigio la `seo.description` de la Home en los cuatro idiomas, que nombraba
"Benfica e Lumiar" cuando hay tres sedes — el mismo hueco que la spec 0020 arreglo en el
lead. Un dato incompleto en la meta description es tambien el que copia un motor.

## Verificacion

- [ ] `npm run typecheck` y `npm test` limpios; build con 36 estaticas + `/llms.txt`.
- [ ] Las 4 homes contienen el `resumen` como **texto visible** (`curl | grep`, sin JS).
- [ ] Aulas, Adultos y Niños en los 4 idiomas contienen las preguntas y respuestas visibles.
- [ ] El JSON-LD de esas paginas parsea e incluye `FAQPage` con tantas entradas como el JSON.
- [ ] Dejar una respuesta en 10 caracteres **rompe el build** nombrando el campo.
- [ ] Ninguna respuesta empieza con pronombre suelto (revision manual, 12 frases).
- [ ] `curl /robots.txt` lista los seis crawlers y ninguno tiene `Disallow: /`.
- [ ] `curl /llms.txt` devuelve markdown con las URLs de los cuatro idiomas.
- [ ] La home sigue con un solo `<script type="application/ld+json">` y cero JS ejecutable.

## Abierto

Las respuestas que hoy no estan en el sitio —precio exacto, edad minima, que llevar— se
escriben solo con lo que el cliente confirme. Las que falten quedan fuera del archivo.
