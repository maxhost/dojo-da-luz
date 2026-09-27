---
spec: 0057
fecha: 2026-09-27
estado: cerrada
resumen: El editor de formularios agrega una tarjeta «Nuevo» y una opción vacía más en el navegador apenas se escribe en la última, sin publicar para ver la siguiente
disjunta: si
archivos: src/components/admin/EditorCamposFormulario.astro
---

# 0057 — Agregar campos y opciones sin publicar

## Problema

En `/admin/formularios/<id>` (y en `/admin/formularios/nuevo`) el editor pinta desde el
servidor **una sola** tarjeta vacía «Nuevo» al final de los campos y **una sola** fila vacía
al final de las opciones de cada campo de selección. Al escribir en ellas no aparece otra:
para agregar un segundo campo o una segunda opción hay que publicar y esperar a que la
página se vuelva a pintar. Reportado por el cliente el 2026-09-27 sobre
`/admin/formularios/contacto-prueba`.

Agravante: el cambio de tipo (mostrar u ocultar el bloque de opciones) se engancha con
`addEventListener` a cada `<select>` al cargar, así que una tarjeta creada después no lo
tendría.

## Alcance

**Entra:**
- Al escribir en la etiqueta de la **última** tarjeta vacía de campos, se agrega debajo otra
  tarjeta vacía «Nuevo» (con su propia fila vacía de opciones).
- Al escribir en la **última** fila vacía de opciones de un campo, se agrega debajo otra
  fila vacía.
- El cambio de tipo pasa a delegación de eventos sobre la lista, para que funcione también
  en las tarjetas agregadas.

**No entra:**
- Cambios de layout, textos o estilos: las filas agregadas son copias exactas de las que el
  servidor ya pinta.
- Flechas o «Quitar» en filas todavía no publicadas: una fila nueva se descarta vaciándola,
  como hoy (`viva()` en `formularios-parse.ts` ya descarta filas sin id ni texto).
- El servidor: `formularios-parse.ts` ya acepta cualquier índice `fields[i]` /
  `options[i][j]`.
- Pestañas de traducción (`editable = false`): no tienen filas vacías.

## Diseño

Al cargar, el script guarda una copia intacta de la tarjeta vacía del final y, por lista,
de la fila vacía de opciones. Cuando un `input` en la etiqueta de la última vacía deja texto,
se inserta un clon de esa copia con los `name` reindexados:

- campo nuevo: `fields[N]` → `fields[M]` y `options[N][` → `options[M][`, con `M` = número
  de tarjetas en la lista (los índices del servidor son `0..n-1` y se agregan en orden);
- opción nueva: `options[i][j]` → `options[i][k]`, con `k` = número de filas de esa lista.

Los `orden` ocultos se reescriben con `renumerar()`, el mismo que usan las flechas.

## Archivos

| Archivo | Accion |
|---|---|
| `src/components/admin/EditorCamposFormulario.astro` | editar: script de filas nuevas y delegación del cambio de tipo |

### Disjunta?

Ninguna spec abierta toca este componente. Disjunta.

## Verificacion

- [x] `npm test` (103/103) y `npm run build` en verde.
- [x] En un navegador real (Playwright) sobre el HTML del editor: escribir en «Nuevo» agrega
      otra tarjeta; en ella, cambiar el tipo a «Elegir varias opciones» muestra las opciones;
      escribir en la opción vacía agrega otra; los `name` enviados llegan al parser como
      campos y opciones distintos.

## Abierto

Nada.
