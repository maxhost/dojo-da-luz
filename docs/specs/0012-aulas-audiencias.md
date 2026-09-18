---
spec: 0012
fecha: 2026-09-18
estado: implementada
resumen: Crear landing pages localizadas de Aikido para adultos y niños con contenido preservado y formularios contextuales en modal.
disjunta: no
archivos: src/lib/i18n.ts, src/lib/content.ts, src/components/AudienceView.astro, src/components/FormModal.astro, src/pages/aulas/**, src/pages/[lang]/[page].astro, content/*/{adults,children}.json, docs/INDEX.md, docs/TASKS.md
---

# 0012 — Aulas por audiencia

## Alcance

- Crear Adultos y Niños en pt/es/fr/en bajo Aulas.
- Preservar el contenido editorial de Wix, horarios, cuotas, objetivos y fotografía.
- Modal reutilizable que carga el formulario específico al abrirse y ofrece enlace directo.
- Actualizar Aulas para enlazar las dos landing pages.
- No activar redirects todavía ni construir las otras pantallas del sitemap en esta spec.

## Verificación

- [x] Ocho rutas nuevas generadas.
- [x] Formularios de adultos y niños diferenciados y cargados sólo al abrir el modal.
- [x] Canonicals localizados verificados.
- [x] Typecheck/build y `git diff --check` limpios.

## Pendiente de lanzamiento

El modal adulto conserva temporalmente `/aula-experimental` como fuente Wix. Antes de
activar su redirect hay que sustituirlo por el formulario nativo o su endpoint definitivo.
