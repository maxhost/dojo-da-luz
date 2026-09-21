---
spec: 0028
fecha: 2026-09-21
estado: implementada
resumen: Parcerias deja de ser un carrusel animado y pasa a una rejilla estática de cinco logos por fila, sin recuadro y con el blanco de los archivos neutralizado por multiply.
disjunta: si
archivos: src/components/HomeView.astro, src/styles/global.css, docs/**
---

# 0028 — Parcerias en rejilla

## Problema

La sección Parcerias de la Home (spec 0026) es un carrusel CSS: el array `PARTNERS` se
duplica en `PARTNER_CAROUSEL` y se desplaza en bucle de 20 s. Observable hoy:

- Solo se ven tres o cuatro logos a la vez; para ver los ocho hay que esperar al bucle.
- Cada logo va dentro de un recuadro blanco con borde `#d7cec0`, que compite con el logo
  y con el fondo `#f6f1e8` de la sección.
- Los ocho `<li>` están duplicados en el HTML, la mitad con `aria-hidden`.

## Alcance

**Entra:**

- Sustituir el carrusel por una rejilla estática con **los ocho parceiros a la vez**,
  cinco por fila en escritorio y las filas que hagan falta.
- Quitar el recuadro: sin `bg-white`, sin `border`, sin padding interno. Queda la imagen.
- Reducir el tamaño de las imágenes para que cinco entren en el ancho de la sección.
- Neutralizar el fondo blanco que traen incrustado los propios archivos.
- Retirar `PARTNER_CAROUSEL` y las reglas `.partner-carousel*`, el `@keyframes` y su
  bloque `prefers-reduced-motion`, que quedan sin uso.

**No entra:**

- Cambiar qué parceiros se muestran, sus URLs o sus nombres: el array `PARTNERS` queda
  igual, con sus ocho entradas y sus dos `zoom`.
- Contenido localizado: `c.partnerships.label` y `.title` no se tocan.
- JavaScript: la sección no tenía y sigue sin tener.
- El resto de la Home.

## Diseño

`<ul>` con `grid-cols-2` en móvil, `sm:grid-cols-3` y `md:grid-cols-5`, de modo que los
ocho caen en 5+3 en escritorio. Cada `<li>` es una celda de alto fijo `h-20` con la
imagen en `object-contain`: alto uniforme sin deformar logos de proporciones distintas.

Los `zoom` (`scale-[1.45]` y `scale-[2.25]`) se conservan —son la compensación del
margen blanco que esos dos archivos traen incrustado— y el `<li>` mantiene
`overflow-hidden` para que el escalado recorte en vez de invadir la celda vecina. Es el
único resto del recuadro anterior y no tiene fondo ni borde.

El `aria-label` del carrusel desaparece con su `<div>`: la sección ya tiene su `<h2>`.

### El blanco no estaba en el CSS

Quitar `bg-white` del `<li>` no quita el blanco: **lo traen los archivos**. Se descargaron
los ocho y se inspeccionaron:

- Los tres PNG vienen con `hasAlpha: no` — Wix los aplanó sobre blanco al generarlos.
- Los otros cinco son JPEG, que por formato no admiten transparencia.
- Seis tienen fondo `#ffffff` exacto; dos quedaron en `(247,247,247)` y `(245,244,242)`
  por compresión.

La imagen lleva `mix-blend-multiply`. Multiplicar por el `#f6f1e8` de la sección devuelve
exactamente el color de fondo allí donde el píxel es blanco puro, así que el recuadro
desaparece sin tocar el logo y sin JavaScript ni reprocesar los assets.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/HomeView.astro` | editar |
| `src/styles/global.css` | editar |
| `docs/adr/0024-parcerias-en-rejilla.md` | crear |
| `docs/INDEX.md` | editar |
| `docs/TASKS.md` | editar |

### Disjunta?

**Sí.** La única spec abierta es la 0021 (editor del backoffice), sobre `src/lib/publish.ts`,
`src/pages/admin/**` y `src/components/admin/**`. Cero solape.

## Verificacion

- [x] `npm run typecheck` → 48 archivos, 0 errores / 0 warnings / 0 hints
- [x] `npm test` → 5/5
- [x] `npm run build` → 44 `index.html`
- [x] Las 4 homes contienen **8** `<img>` de parceiro (antes 16), con 0 `aria-hidden`,
      0 `bg-white` y 0 bordes en esa sección
- [x] `grep partner-carousel src/` vacío
- [x] El CSS construido contiene `.mix-blend-multiply{mix-blend-mode:multiply}` y las 8
      imágenes llevan la clase
- [x] Visto en `localhost:4321` y aprobado por el cliente: cinco por fila, sin recuadro

## Abierto

- Tres de los ocho "logos" son fotografías (`WhatsApp Image …jpeg`), no marcas. En una
  rejilla de alto uniforme se nota más que en el carrusel. Si el cliente lo objeta, la
  solución es pedir los logos reales, no volver al recuadro.
- **`multiply` no limpia las dos que no son blanco puro.** A `(247,247,247)` y
  `(245,244,242)` les queda un rectángulo apenas más oscuro que el fondo. Son píxeles
  grises en el archivo: no hay arreglo por CSS. Se resuelve el día que el cliente entregue
  los logos originales con transparencia.
