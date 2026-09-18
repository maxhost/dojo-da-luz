---
spec: 0017
fecha: 2026-09-18
estado: implementada
resumen: Crear la página localizada de Pablo Durán, enlazarla desde Dojo y actualizar el sitemap y la matriz 301.
disjunta: no
archivos: src/**, content/*/{dojo,teacher}.json, docs/design/09-arquitectura-urls-y-redirects.md, docs/INDEX.md, docs/TASKS.md
---

# 0017 — Pablo Durán

## Alcance

- Crear una biografía localizada en pt/es/fr/en con URL, canonical y hreflang propios.
- Conservar del Wix la trayectoria, formación, experiencia docente y linaje relevantes.
- Presentar los hitos como HTML semántico y añadir datos estructurados `Person`.
- Enlazar la página desde el bloque del profesor en Dojo.
- Cambiar el sitemap objetivo y los redirects de profesor para apuntar a la nueva página.

## Rutas

- `/professor-pablo-duran/`
- `/es/profesor-pablo-duran/`
- `/fr/professeur-pablo-duran/`
- `/en/teacher-pablo-duran/`

## Verificación

- [x] Cuatro rutas con canonical y hreflang recíprocos.
- [x] Dojo enlaza internamente al profesor en los cuatro idiomas.
- [x] Biografía, hitos, formación y linaje presentes en HTML; JSON-LD `Person` válido.
- [x] `/prefessorpt` y equivalentes documentados con destino nuevo.
- [x] Typecheck/build y `git diff --check` limpios.
