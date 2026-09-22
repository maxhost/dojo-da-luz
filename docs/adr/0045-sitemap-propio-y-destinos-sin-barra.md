---
adr: 0045
fecha: 2026-09-21
estado: aceptada
resumen: El sitemap se genera a mano de PAGES x LOCALES con hreflang reciproco y sin lastmod, y sus 44 loc son identicos a los canonical; los destinos de los 301 van sin barra final porque con barra hay un segundo salto.
---

# 0045 — El sitemap propio y los destinos sin barra final

## Contexto

La spec 0045 pedia dos cosas que el diseño daba por triviales y no lo eran: un
`sitemap.xml` y una matriz de 36 redirects copiada de `docs/design/10-inventario-wix.md`.
Implementarlas produjo tres decisiones y una correccion al inventario.

## Decision 1 — el sitemap se genera aca, no con `@astrojs/sitemap`

El integrador oficial recorre las rutas construidas y emite una entrada por cada una.
Eso da 44 `<loc>` correctos y **44 paginas sueltas**: no sabe que `/aulas`, `/es/clases`,
`/fr/cours` y `/en/classes` son la misma pagina en cuatro idiomas.

El `hreflang` reciproco por `xhtml:link` es justamente lo que este sitio tiene para dar y
el resto de los sitios no —el Wix declara `<html lang="es">` en sus 34 paginas, incluidas
las portuguesas—, asi que se genera de `PAGES × LOCALES`, la misma fuente de la que salen
las rutas, los `canonical` y `/llms.txt`. Son cuarenta lineas y no agrega una dependencia.

## Decision 2 — sin `lastmod`

El contenido lo edita el backoffice commiteando a `main` (ADR-0025). No hay una fecha por
pagina que no sea una invencion: la del build es la de todas, y la del commit exigiria
mapear cada ruta a los archivos de contenido que la componen, que son varios y compartidos.

Una fecha inventada en `lastmod` es peor que ninguna: enseña al crawler a no creerle.
Google la trata como señal debil y la ignora cuando no la corrobora.

## Decision 3 — el `<loc>` es identico al `canonical`, caracter por caracter

`Seo.astro` emite la home como `https://www.aikido-duran.com` **sin barra final**
(`new URL(p, site).href.replace(/(.)\/$/, '$1')`). La primera version del sitemap la emitia
como `…com/`, que es la misma pagina y **otra cadena**.

El sitemap usa esa misma funcion. Un `<loc>` que no coincide con el canonical de su pagina
es la clase de discrepancia que Search Console reporta como "pagina alternativa con
etiqueta canonica adecuada" y que obliga a mirar un informe por un problema inexistente.

Hay un test que lo sostiene desde afuera: los 44 `<loc>` del sitemap construido y los 44
`canonical` de las 44 paginas construidas son el mismo conjunto.

## Decision 4 — los destinos de los 301 van sin barra final

`astro.config.mjs` declara `trailingSlash: 'never'`, y el adapter de Vercel emite como
primera regla `^/(.*)/$ → /$1` con `308`. Un destino escrito `/es/` —como estaba en la
matriz del documento 10— habria dado **dos saltos**: `/enlaces-es` → `/es/#parcerias` →
`/es#parcerias`.

Dos saltos no rompen nada visible, y por eso hay que decidirlo por escrito: diluyen la
señal de PageRank, duplican la latencia de la primera visita de cada backlink y son
exactamente lo que la propia matriz declaraba prohibido. Los 36 destinos van sin barra, y
lo comprueba un test.

**Lo encontro el test, no la lectura.** La matriz estaba copiada bien; lo que estaba mal era
la matriz.

## Correccion al inventario — `#quotas` esta traducido

El documento 10 listaba `#horarios`, `#quotas`, `#criancas` y `#faq` como anchors de
`/aulas` en los cuatro idiomas. Medido en el HTML construido, el de las cuotas **cambia por
idioma**: `#quotas`, `#cuotas`, `#tarifs`, `#fees`. Los otros tres si son iguales.

Ningun redirect apunta ahi, asi que no cambia ninguna regla — pero la tabla
`ANCHORS_VERIFICADOS` de `src/lib/redirects.ts` es la que usa el test para rechazar
destinos rotos, y una tabla que miente vuelve inutil al test. Queda con los valores
medidos, y el documento 10 corregido.

## Consecuencias

- El sitemap depende de `PAGES`, `LOCALES` y `pathFor`. Renombrar un slug lo actualiza
  solo, igual que a las rutas y a los `hreflang`.
- La matriz de 36 reglas no se puede escribir a ojo: los destinos se cruzan contra las 44
  rutas reales y contra los anchors medidos (`src/lib/redirects.test.ts`, 14 pruebas).
- Si algun dia se agrega una pagina, entra sola al sitemap y sale sola en el test de
  redirects. Si se quita, el test se pone rojo antes que un crawler.
