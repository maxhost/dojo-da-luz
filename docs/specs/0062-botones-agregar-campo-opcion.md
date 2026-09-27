---
spec: 0062
fecha: 2026-09-27
estado: cerrada
resumen: El editor de formularios cambia la tarjeta «Nuevo» y la opción vacía siempre visibles por botones «+ Agregar campo» (arriba y abajo) y «+ Agregar opción», con ✕ para descartar lo no publicado; supersede el mecanismo de la 0057
disjunta: si
archivos: src/components/admin/EditorCamposFormulario.astro, src/components/admin/TarjetaCampo.astro, src/components/admin/FilaOpcion.astro, src/lib/editor-campos-navegador.ts, src/lib/editor-campos-estilos.ts
---

# 0062 — Botones «Agregar campo» y «Agregar opción»

## Problema

La 0057 hizo que escribir en la tarjeta vacía «Nuevo» (y en la opción vacía) agregara otra
sin publicar. Funciona —verificado de nuevo el 2026-09-27 sobre una copia de la pantalla real:
9→10 tarjetas, 3→4 opciones, sin errores de JS— pero **no se descubre**: el cliente reporto
«no hay boton para añadir nueva tarjeta ni para añadir nueva opcion». Con 9 campos la pagina
mide ~6000 px, la tarjeta «Nuevo» esta al fondo y parece un campo mas, y la opcion vacia de un
campo largo queda debajo de la barra fija de «Publicar».

Layout aprobado por el cliente en el chat antes de implementar (regla de CLAUDE.md para UI).

## Alcance

**Entra (solo pestaña portugués, `editable`):**
- Sin tarjeta «Nuevo» ni fila vacía de opción pintadas de antemano.
- **«+ Agregar campo»** arriba de la lista (junto al comienzo) y abajo. Agrega al final una
  tarjeta «Nuevo», pone el cursor en «Pregunta o etiqueta» y la centra en pantalla.
- **«+ Agregar opción»** al pie de las opciones de cada campo (también en campos agregados).
  Agrega una fila vacía al final, con el cursor en ella, centrada en pantalla.
- Lo agregado y todavía no publicado lleva **✕** para descartarlo en el acto; lo publicado
  sigue con «Quitar». Todas las filas editables llevan flechas.
- Texto de ayuda: «Usá + Agregar campo y + Agregar opción. Para sacar algo ya publicado,
  tildá «Quitar». Nada se publica hasta que aprietes Publicar.»
- Centrar la fila agregada (`scrollIntoView({ block: 'center' })`) evita que la tape la
  barra fija de «Publicar».

**No entra:** el servidor (`formularios-parse.ts` ya acepta cualquier índice y descarta filas
sin id ni texto), las pestañas de traducción, el alta sin JavaScript (el BO ya lo requiere).

## Diseño

- `TarjetaCampo.astro` y `FilaOpcion.astro` pintan una tarjeta y una fila. Se usan para lo
  publicado y, con índices `__I__`/`__J__`, dentro de dos `<template>` que el navegador
  instancia. Un `<template>` no se envía con el formulario.
- Índices nuevos: un contador por lista (`data-siguiente`, arranca en la cantidad publicada)
  que solo sube. Contar filas repetiría un índice después de descartar una con ✕.
- El script vive en `src/lib/editor-campos-navegador.ts` (el componente ya pasaba 300 líneas),
  todo por delegación sobre el contenedor `[data-editor-campos]`.

## Archivos

| Archivo | Accion |
|---|---|
| `src/components/admin/EditorCamposFormulario.astro` | reescribir: contenedor, botones, plantillas |
| `src/components/admin/TarjetaCampo.astro` | crear: una tarjeta de campo |
| `src/components/admin/FilaOpcion.astro` | crear: una fila de opción |
| `src/lib/editor-campos-navegador.ts` | crear: agregar, descartar, mover, cambio de tipo |
| `src/lib/editor-campos-estilos.ts` | crear: clases compartidas por las tres piezas |

### Disjunta?

Supersede el mecanismo de la 0057 en el mismo componente; no hay otra spec abierta sobre él.

## Verificacion

- [x] En Chromium, sobre una copia temporal de la pantalla real del editor (sin login):
      «+ Agregar campo» de arriba y de abajo agregan una tarjeta con foco; «+ Agregar opción»
      agrega una fila con foco en un campo existente y en uno agregado; ✕ descarta; después de
      descartar, agregar no repite índice; cambiar el tipo muestra las opciones en una tarjeta
      agregada; sin errores de JS; la pestaña de traducción no muestra botones.
- [x] El FormData de esa pantalla pasado por `formularioDesdeForm` + `formularioSchema` da
      exactamente los campos y opciones escritos, sin los descartados.
- [x] `npm test` (110/110) y `npm run build` en verde.

## Abierto

Nada.
