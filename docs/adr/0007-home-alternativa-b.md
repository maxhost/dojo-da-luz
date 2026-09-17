---
fecha: 2026-09-17
resumen: Se conserva la home modular A y se añade una alternativa B con acento rojo concentrado, hero axial y mayor contraste narrativo.
---

# ADR-0007 — Alternativa B para la home

## Estado

Propuesta comparativa; no sustituye ADR-0006 hasta que el cliente elija una dirección.

## Decisión

Conservar Diseño A sin sobrescribirlo. Diseño B concentra el rojo en una banda vertical
de entrada y en el CTA final, crea un hero axial y entrelaza imágenes pequeñas con texto.
El recorrido es practicar → encontrar → transmitir → entrar. Un selector con enlaces
estáticos permite comparar ambas versiones sin JavaScript.

## Consecuencias

Durante la evaluación existen dos rutas `noindex`: `/mockup/` y `/mockup-b/`. La versión
no elegida se retira antes de integrar la home productiva.
