---
fecha: 2026-09-17
resumen: La alternativa C convierte la home en un paisaje continuo: sol, montaña, tierra, dojo y umbral.
---

# ADR-0008 — Home como paisaje

## Estado

Propuesta comparativa; no sustituye A o B hasta validación.

## Decisión

Diseño C usa SVG estático como estructura narrativa. Un disco rojo sin rayos origina una
línea; la línea forma la montaña, llega al suelo, ordena las sedes y se convierte en la
arquitectura del dojo y su umbral. El rojo sólo marca origen, transmisión y acción.

## Consecuencias

El paisaje debe seguir siendo legible sin el SVG: títulos y orden documental conservan
la historia. Las formas son decorativas, llevan `aria-hidden` y no transportan texto.
