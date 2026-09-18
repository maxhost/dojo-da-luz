---
spec: 0014
fecha: 2026-09-18
estado: implementada
resumen: Crear Dojo y Contacto en cuatro idiomas con profesor, linaje, sedes, transporte y formulario visible.
disjunta: no
archivos: src/lib/i18n.ts, src/lib/content.ts, src/components/DojoView.astro, src/components/ContactView.astro, src/pages/**, content/*/{dojo,contact}.json, docs/INDEX.md, docs/TASKS.md
---

# 0014 — Dojo y Contacto

## Alcance

- Crear Dojo y Contacto en pt/es/fr/en con slugs localizados.
- Dojo: significado y ambiente, espacio, Pablo Durán, formación, Franck Noël y linaje.
- Contacto: sedes, transporte publicado en Wix, clases particulares y campos del
  formulario actual (nombre, email, asunto, mensaje).
- No inventar direcciones postales, teléfono ni email.
- Mostrar el formulario pero bloquear su envío hasta configurar receptor/endpoint;
  esto queda como gate explícito de lanzamiento.
- Actualizar el menú global para que Dojo y Contacto apunten a rutas reales.

## Verificación

- [x] Ocho rutas nuevas, canonical y hreflang correctos.
- [x] Contenido y transporte presentes como HTML.
- [x] Formulario accesible y visible, con envío deshabilitado y aviso explícito.
- [x] Menú global enlaza directamente a Dojo y Contacto localizados.
- [x] Typecheck/build y `git diff --check` limpios.
