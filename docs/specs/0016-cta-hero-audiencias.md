---
spec: 0016
fecha: 2026-09-18
estado: implementada
resumen: Añadir el CTA de clase experimental al hero de las páginas de Adultos y Niños sin duplicar sus formularios.
disjunta: no
archivos: src/components/AudienceView.astro, docs/INDEX.md, docs/TASKS.md
---

# 0016 — CTA en hero de audiencias

## Alcance

- Mostrar el CTA localizado de clase experimental en el hero de Adultos y Niños.
- Conservar el CTA final existente.
- Hacer que ambos botones abran el mismo modal y formulario contextual de cada audiencia.
- Aplicar el cambio a pt/es/fr/en mediante el componente compartido.

## Verificación

- [x] Los ocho HTML de audiencia contienen dos controles para el mismo modal.
- [x] Niños y Adultos conservan destinos de formulario diferentes.
- [x] Typecheck/build y `git diff --check` limpios.
