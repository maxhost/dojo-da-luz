---
adr: 0042
fecha: 2026-09-21
estado: aceptada
resumen: Lo que es igual en las 44 paginas —logo, favicon, acento, contacto, redes y las lineas del pie— sale de content/site.json y se edita en una sola pantalla; el pie deja de estar en los once archivos de cada idioma.
---

# 0042 — Los ajustes del sitio, en una pantalla

## Contexto

Diez editores de pagina cubren todo el contenido del sitio (specs 0021, 0035–0043). Lo que
queda sin editor **no es una pagina: es lo que se repite en todas**.

1. **El pie esta escrito 44 veces.** `chrome.footerNote` —*"Benfica · Lumiar · Encarnação"* y
   *"Associação sem fins lucrativos"*— vive en los once archivos de contenido de cada idioma.
   Para cambiar una palabra hay que abrir diez editores y cuatro pestañas en cada uno. La
   consecuencia esta publicada: **Encarnação cerro, salio de `/aulas`, salio de `/contactos`
   (ADR-0038) y sigue en el pie de las 44 paginas.**
2. **El telefono y el email del pie son inventados**: `+351 000 000 000` y
   `ola@dojodaluz.example`, escritos dentro de `Base.astro` y servidos en produccion.
3. **Las dos URLs de redes** estan dentro de `SocialLinks.astro`, que las pinta en el navbar
   y en el pie de las 44 paginas.
4. **El logo no es una imagen**: es un `<span>` con 合気 dibujado en un circulo del color de
   acento, mas el texto "Dojo da Luz".
5. **No hay favicon.** Cero `<link rel="icon">` en las 44 paginas.

## Decision

**`content/site.json`: un archivo, una pantalla, `/admin/ajustes`.** Mismo contrato de
publicacion que `dojos.json` y `partners.json` — un sha, un commit, validado por el schema
del build.

- **`marca`**: `logo`, `favicon` y `acento`. El logo y el favicon **pueden quedar vacios**, y
  vacio significa lo de hoy: el circulo con 合気 y ninguna etiqueta de icono.
- **El logo subido reemplaza solo el circulo.** El texto "Dojo da Luz" y su bajada siguen al
  lado, porque son el enlace a la home y lo que lee un buscador.
- **`contacto`**: telefono visible, telefono para el `tel:`, email y direccion. Los cuatro
  **opcionales**: un dato de contacto inventado es peor que ninguno, y ninguno es
  exactamente lo que hay hoy. Lo que este vacio no se pinta.
- **`redes`**: Facebook e Instagram, opcionales. Sin URL, el icono desaparece del navbar y
  del pie — no queda un enlace a ninguna parte (ADR-0014).
- **`pie`**: las lineas del pie **por idioma**, como texto libre, un renglon por linea
  (ADR-0033). `chrome.footerNote` **se borra** de los once schemas y de los 44 archivos, y
  el `<slot name="footer-note">` desaparece de las diez vistas: el pie lo pinta `Base.astro`.
- **Los tres textos del borde que quedan** —bajada del logo, boton de menu y "saltar al
  contenido"— **siguen en cada pagina**. Son del encabezado, no del pie, y el pedido fue
  sacar el pie.
- El telefono, el email y las dos redes **entran al JSON-LD** (`telephone`, `email`,
  `sameAs`), que hoy no los tiene. Cierra el "PENDIENTE DEL CLIENTE" escrito en `site.ts`.

## El favicon y el logo suben en chico

El subidor de imagenes produce una WebP de 1600 px (spec 0030), pensada para fotos. Un
favicon de 1600 px son ~80 KB descargados en cada pagina para pintar 32 px, y un logo de
navbar mide 56.

`POST /admin/medios/subir` acepta `variante=icono` y en ese caso genera **`w256.webp`**. Los
campos de logo y favicon la piden; los de foto siguen igual. El original se conserva como
siempre.

## Consecuencias

- **El pie se edita una vez y cambia en las 44 paginas.** Encarnação se puede sacar del pie
  del sitio entero escribiendo una linea.
- Las diez pantallas de edicion **pierden dos campos** cada una: el bloque "Cabecera y pie"
  pasa a ser "Cabecera", con tres campos.
- El HTML de las 44 paginas cambia en el pie y en el `<head>`: el pie pasa a leerse de un
  archivo y el `<head>` gana el icono. El texto renderizado del pie, en cambio, **tiene que
  quedar igual** mientras `site.json` repita lo que decian los 44 archivos — eso es lo que
  verifica que la migracion fue solo de lugar.
- Queda una asimetria a la vista: el pie se edita en Ajustes y el encabezado en cada pagina.
  Es lo pedido. El dia que moleste, mover `caption`, `menuLabel` y `skipLink` a Ajustes es
  la misma operacion y borra 132 campos del backoffice.
- `site.json` es el primer archivo de contenido que mezcla datos sin idioma (un telefono no
  se traduce) con datos por idioma (las lineas del pie). Por eso el `pie` esta indexado por
  locale adentro del archivo, y no hay cuatro `site.json`.
