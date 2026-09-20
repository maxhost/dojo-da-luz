---
spec: 0025
fecha: 2026-09-19
estado: implementada
resumen: Añadir a la Home una sección localizada con accesos directos y destacados a las páginas de Adultos y Crianças.
disjunta: no
archivos: src/components/HomeView.astro, src/lib/content.ts, content/*/home.json, docs/{INDEX,TASKS}.md, docs/{adr,specs}/**
---

# 0025 — Accesos de Adultos y Crianças en la Home

## Problema

Las dos páginas principales de práctica por audiencia están ocultas detrás de Aulas. La
Home no permite llegar directamente a Adultos o Crianças ni comunica que existen como
recorridos propios.

## Alcance

**Entra:**

- Sección nueva en la Home antes de las sedes, con una tarjeta de Adultos y otra de
  Crianças.
- Enlaces a las rutas localizadas canónicas mediante `pathFor`.
- Títulos, introducciones, fotografías y textos alternativos reutilizados desde el
  contenido de las landing pages.
- Encuadre, rótulos y CTA traducidos en los cuatro `home.json`.
- HTML semántico, responsive y sin JavaScript nuevo.

**No entra:**

- Cambios en el contenido o formularios de las landing pages.
- Cambios en la navegación global o en la página resumen de Aulas.
- Nuevos medios ni descarga de los originales alojados en Wix.

## Diseño

`HomeView` carga los contenidos validados de Adultos y Crianças para el idioma activo y
renderiza dos enlaces-tarjeta. `homeSchema` valida el texto específico de la nueva sección.
Las rutas salen de `pathFor`, por lo que respetan los slugs de cada idioma.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/HomeView.astro` | editar |
| `src/lib/content.ts` | editar |
| `content/{pt,es,fr,en}/home.json` | editar |
| `docs/adr/0020-accesos-audiencias-home.md` | crear |
| `docs/specs/0025-accesos-audiencias-home.md` | crear y cerrar antes del código |
| `docs/INDEX.md` | editar |
| `docs/TASKS.md` | editar al terminar |

### Disjunta?

No. Comparte `HomeView.astro`, `content.ts` y los contenidos de Home con las specs 0020,
0021 y 0023. Se implementa de forma serial.

### Archivos compartidos

No requiere contratos previos de otro agente.

## Verificación

- [x] `npm run typecheck` limpio.
- [x] `npm test` limpio.
- [x] `npm run build` genera las 36 páginas.
- [x] Los cuatro HTML de Home contienen enlaces directos localizados a Adultos y Niños.
- [x] Cada Home contiene las dos imágenes con texto alternativo y no añade scripts.
- [x] `git diff --check` limpio.

## Abierto

Nada bloqueante.
