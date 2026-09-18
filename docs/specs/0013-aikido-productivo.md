---
spec: 0013
fecha: 2026-09-18
estado: implementada
resumen: Crear Aikido en cuatro idiomas preservando introducción, historia, principios, O-Sensei y acceso por audiencia.
disjunta: no
archivos: src/lib/i18n.ts, src/lib/content.ts, src/components/AikidoView.astro, src/pages/aikido/index.astro, src/pages/[lang]/[...page].astro, content/*/aikido.json, docs/INDEX.md, docs/TASKS.md
---

# 0013 — Aikido productivo

## Alcance

- Crear `/aikido`, `/es/aikido`, `/fr/aikido` y `/en/aikido`.
- Migrar del Wix: introducción, origen/tradición, originalidad, principios/métodos,
  sentido del dojo, modernidad, quién puede practicar y Morihei Ueshiba.
- Traducir con paridad a los cuatro idiomas y publicar como HTML semántico.
- Enlazar Adultos y Niños desde el cierre y convertir Aikido en destino global del menú.
- Mantener el lenguaje visual de ADR-0010.

## No entra

- Agenda, eventos o noticias; retirados por ADR-0012.
- Redirects 301, Dojo, Contacto u Otras Artes.

## Verificación

- [x] Cuatro rutas, canonical y hreflang correctos.
- [x] Secciones históricas y conceptuales presentes en HTML.
- [x] Menú global enlaza directamente a Aikido localizado.
- [x] Typecheck/build y `git diff --check` limpios.
