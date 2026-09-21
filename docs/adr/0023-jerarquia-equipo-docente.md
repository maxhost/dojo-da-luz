---
fecha: 2026-09-21
resumen: En /dojo el equipo docente deja de ser cuatro secciones iguales alternadas: Pablo Durán es un bloque protagonista y los otros tres una fila de fichas compactas.
---

# ADR-0023 — Jerarquía del equipo docente

## Estado

Aceptada.

## Contexto

La spec 0026 sumó tres instructores (Inês Martins, Miguel Costa, Sofia Almeida) a `/dojo`
reutilizando la misma forma que ya tenía Pablo Durán: una sección a pantalla completa por
persona, con retrato grande, alternando el lado de la imagen. Cuatro secciones idénticas
y consecutivas producen tres problemas observables:

- Pablo Durán, que es quien dirige el dojo y el único con página propia, se lee como uno
  más de una lista.
- Las cuatro fotos son el mismo asset (`TEACHER`), así que la repetición se hace evidente:
  el mismo retrato cuatro veces en distinto encuadre.
- La sección ocupa cuatro scrolls completos para cuatro biografías cortas.

No existen retratos individuales de los tres instructores adicionales; el cliente no los
entregó.

## Decisión

El equipo docente es **una** sección con dos niveles jerárquicos:

- **Protagonista**: Pablo Durán, retrato vertical `4/5` con marco azul desplazado, nombre
  hasta `text-7xl`, credenciales, biografía completa en un bloque con filete lateral, y el
  botón a su página propia.
- **Equipo**: Inês, Miguel y Sofia en tres columnas separadas por filetes verticales, con
  imagen horizontal `4/3`, nombre en `text-3xl`, credenciales y sus dos párrafos.

Sobre un fondo más oscuro (`#211e1b`) y separado por un filete, el segundo nivel se lee
como subordinado sin necesitar un rótulo que lo diga.

Las tres imágenes secundarias son fotografías de práctica ya alojadas en Wix, recortadas
con `fp_` distintos. Es una solución provisional y declarada: el día que haya retratos
reales se sustituye el array `teacherPhotos` sin tocar la composición.

Se descartó la fila introductoria «Equipo docente» y la numeración de las fichas: el
cliente las pidió fuera porque el contraste de escala ya comunica la jerarquía.

## Consecuencias

- `/dojo` baja de cuatro secciones de profesor a una; la página se acorta sensiblemente.
- Los `id` de ancla (`#pablo-duran`, `#ines-martins`, …) se conservan: los enlaces
  existentes siguen resolviendo.
- El contenido localizado no cambia: los cuatro idiomas heredan la jerarquía sin tocar
  JSON ni schemas.
- Queda una deuda explícita: tres imágenes que no retratan a quien nombran. Mientras no
  haya fotos reales, la ficha muestra una escena de práctica del dojo, no a la persona.
