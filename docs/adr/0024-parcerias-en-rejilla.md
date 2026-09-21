---
fecha: 2026-09-21
resumen: Parcerias se muestra como rejilla estática de cinco logos por fila, sin recuadro; supersede el carrusel CSS que decidió la spec 0026.
---

# ADR-0024 — Parcerias en rejilla

## Estado

Aceptada.

## Contexto

La spec 0026 resolvió Parcerias con un carrusel CSS: `PARTNERS` duplicado en
`PARTNER_CAROUSEL` y una animación de 20 s, con cada logo dentro de un recuadro blanco
con borde `#d7cec0`. Dos problemas observables sobre ocho parceiros:

- El carrusel muestra tres o cuatro a la vez. Para ver los ocho hay que esperar el bucle,
  y nada indica cuántos hay.
- El recuadro blanco sobre el fondo `#f6f1e8` de la sección crea ocho cajas que compiten
  con los logos que contienen.

El movimiento perpetuo también obligaba a un bloque `prefers-reduced-motion` propio.

## Decisión

Parcerias es una rejilla estática: los ocho a la vez, **cinco por fila** en escritorio
(5+3), tres en tablet y dos en móvil. Sin recuadro, sin borde, sin fondo: solo la imagen,
en celdas de alto uniforme `h-20` con `object-contain`.

El blanco que queda no es del CSS sino de los archivos —los tres PNG vienen sin canal
alfa y los otros cinco son JPEG—, así que la imagen lleva `mix-blend-multiply`: sobre el
`#f6f1e8` de la sección, el blanco puro se vuelve el propio fondo.

Se conservan los dos `zoom` del array —compensan el margen blanco incrustado en esos dos
archivos— y con ellos el `overflow-hidden` de la celda, para que el escalado recorte en
lugar de invadir la celda vecina.

Con el carrusel se van `PARTNER_CAROUSEL`, las reglas `.partner-carousel*`, el
`@keyframes` y su bloque de `prefers-reduced-motion`.

## Consecuencias

- El HTML de cada home baja de 16 `<img>` de parceiro a 8, y desaparecen los ocho
  `aria-hidden` que existían solo para no duplicar el anuncio a lectores de pantalla.
- La sección deja de tener animación: nada que pausar, nada que respetar en
  `prefers-reduced-motion`.
- Se nota más que tres de los ocho "logos" son fotografías, no marcas. La respuesta a eso
  es pedirle al cliente los logos reales, no reponer el recuadro que los disimulaba.
- `multiply` tiñe levemente los colores del logo con el beige del fondo, y no limpia las
  dos imágenes cuyo fondo no es blanco puro. Es el precio de no reprocesar los assets.
- Añadir un noveno parceiro ya no es gratis: rompe la fila de cinco. A partir de diez
  vuelve a cerrar.
