---
spec: 0015
fecha: 2026-09-18
estado: implementada
resumen: Crear Otras Artes en cuatro idiomas con Shiatsu, Iaido, Tai Chi y formularios específicos.
disjunta: no
archivos: src/lib/i18n.ts, src/lib/content.ts, src/components/OtherArtsView.astro, src/pages/**, content/*/other-arts.json, docs/INDEX.md, docs/TASKS.md
---

# 0015 — Otras Artes

## Alcance

- Crear rutas localizadas de Otras Artes en pt/es/fr/en.
- Migrar todo el contenido Wix de Shiatsu, Iaido y Tai Chi, con fotos y horarios.
- Reutilizar el modal contextual para los formularios distintos de Iaido y Tai Chi.
- Shiatsu enlaza a Contacto porque el Wix no publica formulario específico.
- Incorporar Otras Artes al menú global.

## Verificación

- [x] Cuatro rutas, canonical/hreflang y menú localizados.
- [x] Tres disciplinas y horarios presentes como HTML.
- [x] Formularios Iaido/Tai Chi diferentes y lazy.
- [x] Typecheck/build y `git diff --check` limpios.
