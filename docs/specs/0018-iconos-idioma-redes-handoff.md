---
spec: 0018
fecha: 2026-09-18
estado: implementada
resumen: Reemplazar nombres de idioma por iconos accesibles, añadir redes verificadas y dejar un handoff completo para el push.
disjunta: no
archivos: src/layouts/Base.astro, src/components/SocialLinks.astro, src/lib/i18n.ts, docs/HANDOFF-CLAUDE-CODE.md, docs/INDEX.md, docs/TASKS.md
---

# 0018 — Idiomas, redes y handoff

## Alcance

- Usar iconos de bandera en los selectores desktop y móvil.
- Mantener nombre accesible, idioma de destino, estado activo y área táctil suficiente.
- Añadir enlaces sociales verificados en cabecera y pie mediante un componente común.
- Documentar el estado integral del trabajo y el procedimiento de revisión para Claude Code.

## Verificación

- [x] Las 36 páginas muestran cuatro iconos de idioma con etiquetas accesibles.
- [x] Facebook aparece en cabecera desktop, menú móvil y pie con enlace externo seguro.
- [x] No se publican perfiles sociales sin verificar.
- [x] Handoff, INDEX y TASKS reflejan el estado del árbol antes del push.
- [x] Typecheck/build y `git diff --check` limpios.
