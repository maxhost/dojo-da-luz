---
spec: 0009
fecha: 2026-09-18
estado: implementada
resumen: Sustituir la imagen del hero por un video de Aikido de Pexels y centrar su contenido.
disjunta: no
archivos: src/components/HomeView.astro, docs/INDEX.md, docs/TASKS.md
---

# 0009 — Video en el hero

## Alcance

- Usar como fondo el video de Aikido 6253397 de Pexels, por Artem Podrez.
- Mantener la fotografía actual como `poster` y fallback visual.
- Reproducir sin sonido, en loop, inline y sin controles.
- Centrar rótulo, título, texto y botones, conservando contraste mediante overlay.
- No agregar JavaScript cliente ni modificar el contenido traducible.

## Verificación

- [x] `npm run typecheck`: 0 errores, warnings o hints.
- [x] `npm run build`: cuatro idiomas generados correctamente.
- [x] El HTML generado contiene `video`, `autoplay`, `muted`, `loop`, `playsinline`,
  `preload="metadata"` y `poster`.
- [x] `git diff --check` limpio.
