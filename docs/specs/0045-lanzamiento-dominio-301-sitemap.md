---
spec: 0045
fecha: 2026-09-21
estado: cerrada
resumen: Los 301 de las 38 URLs del Wix, el sitemap.xml generado del contenido y el cambio de dominio a www.aikido-duran.com, en ese orden.
disjunta: si
archivos: astro.config.mjs, src/pages/sitemap.xml.ts, public/robots.txt, src/lib/redirects.ts, src/lib/redirects.test.ts, docs/design/10-inventario-wix.md
---

# 0045 — Lanzamiento: dominio, 301 y sitemap

> Lo unico que decide si todo el trabajo de SEO de las 44 paginas cuenta o no cuenta.

## Problema

1. **Las 38 URLs viejas no tienen redirect.** La matriz esta diseñada en el documento 09
   desde el 2026-09-18 y **no hay una sola regla implementada**: no existe `vercel.json` ni
   `redirects` en `astro.config.mjs`. El dia que el DNS cambie, las 38 dan 404.
2. **No hay `sitemap.xml`.** El propio `robots.txt` lo admite en un comentario.
3. **Los 44 `canonical` apuntan a un dominio que les devuelve 404.** Verificado:
   `/aulas`, `/dojo` y `/professor-pablo-duran` dan 404 en `www.aikido-duran.com`.

## Alcance

**Entra:**

- **La matriz de 301** completa, uno a uno, segun `docs/design/10-inventario-wix.md`.
- **`sitemap.xml`** generado de `PAGES × LOCALES`, la misma fuente que `/llms.txt`.
- La linea `Sitemap:` en `robots.txt`.
- **Un test** que recorre la matriz y comprueba que ningun destino es un 404 ni un anchor
  inexistente, y que ningun origen aparece dos veces.
- El dominio agregado en Vercel y la verificacion post-cambio.

**No entra:**

- **Cambiar `astro.config.mjs` `site`.** Ya dice `https://www.aikido-duran.com` (ADR-0043).
- **Tocar el DNS.** Lo hace el cliente; esta spec deja todo listo y probado antes.
- **`410` para nada.** Las 38 URLs tienen destino equivalente. Ninguna se declara muerta.
- **Reescribir el documento 09.** Es el diseño; el 10 es el dato y manda donde difieran.

## Diseño

**Los redirects como dato, no como configuracion escrita a mano.** `src/lib/redirects.ts`
exporta el mapa; `astro.config.mjs` lo consume en su clave `redirects`, y el adapter de
Vercel lo traduce a redirects de plataforma: se resuelven antes de cualquier funcion.

```ts
export const REDIRECTS_WIX: Record<string, string> = {
  '/iniciopt': '/',
  '/inicioes': '/es',
  '/prefessorpt': '/professor-pablo-duran',
  '/parcerias': '/#parcerias',
  // … 38 en total, ver docs/design/10-inventario-wix.md
}
```

Que el mapa sea un modulo y no literales en la config es lo que permite **testearlo**: el
test cruza cada destino contra `PAGES × LOCALES` y contra la lista de anchors conocidos.

`sitemap.xml` se genera como `/llms.txt` (`prerender = true`), con las 44 URLs finales, su
`hreflang` reciproco por `xhtml:link` y **ningun origen redirigido**.

## Tres correcciones que salieron del crawl

1. **`/parcerias`, `/enlaces-es` y `/links-fr`** apuntaban en el documento 09 a
   `/dojo/#parcerias`, `#colaboraciones` y `#partenaires`. La rejilla de parceiros vive en
   la **Home** desde el ADR-0024 y esos dos anchors **no existen en ninguna pagina**. Van a
   `/#parcerias`, `/es/#parcerias` y `/fr/#parcerias`, verificados en el HTML construido.
2. **Tres paginas vivas no estan en el sitemap del Wix**: `/contactospt`, `/atualidadept` y
   `/enseignant-fr`. Las dos primeras el documento 09 las daba por confirmadas sin estar en
   el sitemap; la tercera cierra su "ruta francesa de Enseignant por confirmar"
   (`/professeur-fr` da 404, `/enseignant-fr` da 200).
3. **El inventario no se cierra con el sitemap.** Ya se demostro incompleto, asi que el
   export de Search Console del cliente es parte del gate, no un extra.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/redirects.ts` | crear (el mapa de 38 reglas) |
| `src/lib/redirects.test.ts` | crear (destinos vivos, sin duplicados, un solo salto) |
| `astro.config.mjs` | editar (consume el mapa en `redirects`) |
| `src/pages/sitemap.xml.ts` | crear |
| `public/robots.txt` | editar (línea `Sitemap:`) |

### Disjunta?

**Sí.** No comparte archivos con 0046, 0047 ni 0048. Puede ir en paralelo con las tres.

## Verificación

- [ ] `astro check` 0/0/0, `npm test` con el test nuevo, build con 44 rutas + `sitemap.xml`.
- [ ] **Las 38 reglas probadas por HTTP contra el build servido**: cada origen devuelve
      `301` y un `Location` exacto, en **un solo salto**, y cada destino devuelve `200`.
- [ ] Ningún destino con anchor va a una página que no tenga ese `id` en su HTML.
- [ ] `sitemap.xml` con **44 `<loc>`**, todas `200`, ninguna redirigida, y `hreflang`
      recíproco en cada entrada.
- [ ] `robots.txt` con la línea `Sitemap:` apuntando al dominio canónico.
- [ ] Un origen inventado (`/no-existe`) **no** matchea ninguna regla: sin comodines.

### Después del cambio de DNS (lo hace el cliente)

- [ ] Las 38 reglas repetidas **contra `www.aikido-duran.com`**.
- [ ] `aikido-duran.com` → `301` a `www`; `http` → `301` a `https`.
- [ ] Los 44 `canonical` apuntan a URLs que ahora devuelven `200` — hoy dan 404.
- [ ] Sitemap enviado en Search Console y propiedad verificada.

## Abierto

**El export de Search Console.** Es lo único que puede cerrar el inventario, y lo tiene el
cliente. Sin él se lanza con 38 reglas verificadas y el riesgo conocido de que exista una
URL vieja con backlinks que nadie enlaza y que el sitemap de Wix no lista.
