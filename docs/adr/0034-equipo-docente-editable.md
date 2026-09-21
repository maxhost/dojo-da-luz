---
adr: 0034
fecha: 2026-09-21
estado: aceptada
resumen: El equipo docente de /dojo deja de estar escrito dentro del componente y pasa a ser una lista de largo libre en el contenido; el linaje se queda en tres cajas fijas. Supersede la parte del 0023 que fijaba tres fichas.
---

# 0034 — El equipo docente es una lista; el linaje son tres cajas

## Contexto

El ADR-0023 fijo la jerarquia de `/dojo`: Pablo Duran protagonista y **tres fichas
compactas** debajo. Esa decision se implemento poniendo los tres profesores **dentro de
`DojoView.astro`**: un objeto `additionalTeachers` con los cuatro idiomas escritos a mano y
un array `teacherPhotos` con tres URLs de Wix.

De ahi salen tres problemas que solo se ven cuando se quiere editar la pagina:

1. **No hay nada que editar.** No existe en ningun JSON: agregar un profesor es tocar
   codigo en cuatro idiomas a la vez.
2. **Tres es un numero del componente, no del dojo.** Si entra un cuarto instructor o se va
   uno, la pagina no lo puede decir.
3. **Las dos fotos grandes tampoco estan en el contenido** —`DOJO` y `TEACHER` son
   constantes— y es el mismo caso que ya se corrigio en `/aikido` (spec 0037).

La seccion **"Uma transmissão viva"** —el linaje: Franck Noel, Seigo Yamaguchi, familia
Ueshiba— es distinta: ya vive en `dojo.json`, y su contenido no es una lista que crece. Son
tres nombres historicos que no cambian.

## Decision

**El equipo docente es una lista de largo libre en el contenido. El linaje son tres cajas
fijas cuyo texto se edita.**

- Los profesores distintos de Pablo pasan a `teachers[]` en `content/*/dojo.json`, con
  nombre, titulo, parrafos y foto. Se agregan y se quitan desde la pestaña portuguesa
  (ADR-0030) y la foto la siembra portugues a los cuatro idiomas (ADR-0032). La rejilla de
  tres columnas se queda: con dos o con cuatro se acomoda sola.
- Sus parrafos se editan como un recuadro de texto, un parrafo por renglon: son una lista
  dentro de una fila de otra lista (ADR-0033 — que ya anticipaba este archivo).
- `lineage` queda con **exactamente tres** filas, sin "añadir" ni "quitar" en ninguna
  pestaña, y los tres textos editables en los cuatro idiomas.
- Las dos fotos grandes —el dojo en la portada y Pablo— pasan al contenido con su `alt`.

## Consecuencias

- Supersede la parte del ADR-0023 que decia "tres fichas compactas": la jerarquia
  —protagonista arriba, fichas en rejilla abajo— sigue; el numero deja de estar fijo.
- El schema pasa a exigir `lineage` de largo 3. Es una restriccion que hoy se cumple en los
  cuatro archivos y que hace que el build frene una cuarta caja metida por un POST forjado.
  Si algun dia el linaje tiene que crecer, se cambia el schema y la rejilla en la misma
  spec, que es donde se decide como se ve una cuarta caja.
- `teachers` **puede quedar vacia**: la seccion de fichas no se pinta. Es mejor que una
  franja oscura con una rejilla vacia, y es el mismo criterio que la galeria del ADR-0031.
- La traduccion de los tres profesores que ya existian no se pierde: se copia del componente
  a los cuatro JSON tal cual esta.
