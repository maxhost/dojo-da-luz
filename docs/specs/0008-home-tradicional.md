---
spec: 0008
fecha: 2026-09-18
estado: implementada
resumen: Rediseñar la home con una arquitectura tradicional de dojo y publicar aulas y horarios como HTML semántico.
disjunta: no
archivos: src/components/HomeView.astro, src/layouts/Base.astro, src/styles/global.css, docs/adr/0010-direccion-tradicional.md, docs/INDEX.md, docs/TASKS.md
---

# 0008 — Home tradicional y contenido rastreable

## Problema

La composición de paisaje abstracto aprobada en ADR-0009 fue rechazada por el cliente.
La nueva referencia es `dojo-la-roseraie.fr`: una web de asociación tradicional, con
cabecera reconocible, fotografía principal, navegación visible y bloques informativos
directos. Horarios y datos prácticos deben ser texto HTML, nunca PDF ni póster, para que
personas, buscadores y asistentes puedan leerlos.

## Alcance

- Reorganizar la home existente sin inventar contenido nuevo ni alterar el contrato JSON.
- Cabecera clásica con marca, descriptor, navegación desktop y menú nativo en mobile.
- Hero fotográfico con mensaje y CTA.
- Presentación de la práctica en texto, seguida por aulas/sedes en tarjetas HTML.
- Presentación del dojo y profesor con fotografía y credenciales legibles.
- Cierre de contacto claro y footer institucional.
- Mantener los cuatro idiomas, HTML estático, cero JavaScript cliente y el contenido
  actual tal como está en los JSON.

## No entra

- Completar horarios, direcciones, email o traducciones que siguen pendientes del cliente.
- Crear nuevas páginas o modificar el schema de contenido.
- Descargar las imágenes remotas del Wix original.

## Verificación

- [x] `npm run typecheck`: 0 errores, warnings o hints.
- [x] `npm run build`: genera `/`, `/es/`, `/fr/` y `/en/`.
- [x] Verificado en el HTML portugués generado: Benfica, Lumiar y sus horarios son texto
  dentro de elementos semánticos `article`/`p`.
- [x] No se agregaron PDFs, imágenes de horarios ni JavaScript ejecutable; el único
  `script` sigue siendo el JSON-LD de datos estructurados.
- [x] `git diff --check` limpio.
