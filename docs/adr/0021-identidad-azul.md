---
fecha: 2026-09-20
resumen: El acento de marca pasa del rojo óxido al azul #0099ff en todo el sitio; supersede la paleta de acento de 0006 y 0010.
---

# ADR-0021 — Identidad azul

## Estado

Aceptada.

## Contexto

Las direcciones visuales 0006 y 0010 fijaron un acento rojo óxido (`#9b3025`) con su
derivado claro (`#efb49b`). El azul es el color con el que la asociación se identifica
hoy —el mismo del Aikikai y del material del dojo— y el rojo no lo representa.

## Decisión

El acento de marca es `#0099ff`. Sobre fondo oscuro se usa `#b3e5ff` y, cuando el azul
es el fondo, el texto de los botones es `#006eb8` para conservar contraste. El borde
inferior de la cabecera y los rótulos de sección adoptan el mismo azul. La base
sumi/washi (`#f6f1e8`, `#27231f`, `#d7cec0`) no cambia: lo que se sustituye es el acento,
no el sistema.

La tipografía de marca (cabecera, navegación, pie) pasa a Oxanium, cargada desde Google
Fonts con `display=swap`.

## Consecuencias

- Los valores rojos desaparecen de los componentes; queda un único acento en el sitio.
- Se añade una petición externa de fuente en el `<head>`, la primera del sitio público.
  Es la contrapartida asumida a la carga hiper rápida: sin bloquear render (`swap`) y
  con `preconnect`.
- Los documentos de diseño 0003 y 0005 quedan desactualizados en su tabla de color; se
  leen con esta ADR delante.
