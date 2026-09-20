---
spec: 0024
fecha: 2026-09-19
estado: implementada
resumen: Adultos y Crianças incorporan una galería responsive de seis medios editable desde el contenido.
disjunta: no
archivos: src/lib/content.ts, src/components/AudienceView.astro, content/*/{adults,children}.json, docs/{INDEX,TASKS}.md, docs/adr/0019-galerias-audiencias.md
---

# 0024 — Galerías en Adultos y Crianças

## Problema

Las dos páginas de audiencia terminan su información práctica sin mostrar una selección
visual de la práctica. En móvil tampoco existe un recorrido compacto por varias imágenes.

## Alcance

**Entra:**
- Una sección de galería en Adultos y Crianças, en los cuatro idiomas.
- Seis medios por página, con imágenes o vídeo y texto alternativo validado.
- Dos columnas en móvil y tres desde tablet, con carga diferida de imágenes y vídeo.
- Datos en los JSON para que el futuro editor pueda sustituirlos.

**No entra:**
- Lightbox, carrusel, subida de archivos ni cambios al backoffice.
- Descargar o duplicar archivos remotos en el repositorio.

## Diseño

`AudienceView` renderiza una lista semántica desde `gallery.items`. Cada pieza usa una
proporción cuadrada estable; una pieza destacada ocupa dos columnas y dos filas en
escritorio. El schema admite una unión discriminada entre imagen y vídeo.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/content.ts` | editar schema |
| `src/components/AudienceView.astro` | renderizar sección |
| `content/*/{adults,children}.json` | añadir contenido localizado |
| `docs/adr/0019-galerias-audiencias.md` | documentar decisión |
| `docs/INDEX.md` | indexar ADR y spec |
| `docs/TASKS.md` | registrar resultado verificado |

### Disjunta?

No. Comparte los JSON de audiencias y el cargador de contenido con el futuro editor.

### Archivos compartidos

No aplica: el trabajo se ejecuta en serie.

## Verificacion

- [x] `npm run typecheck` limpio.
- [x] `npm run build` limpio y las ocho rutas contienen seis elementos de galería.
- [x] HTML generado conserva `loading="lazy"`, textos alternativos y vídeo con controles.
- [x] El CSS generado contiene el contrato de dos columnas base y tres desde `md`.

## Abierto

Nada bloqueante. Las repeticiones son temporales y aceptadas por el cliente hasta que el
backoffice permita reemplazar el material.
