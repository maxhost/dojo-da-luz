---
spec: 0006
fecha: 2026-09-17
estado: implementada
resumen: Consolidar Diseño C como único mockup, retirar comparador A/B y adoptar su narrativa en la documentación.
disjunta: no
archivos: src/pages/mockup*.astro, src/components/DesignSwitcher.astro, docs/design/**, docs/adr/0009-direccion-paisaje.md, docs/INDEX.md, docs/TASKS.md
---

# 0006 — Consolidar Diseño C

## Problema

La dirección elegida convive con dos alternativas rechazadas y la documentación todavía
describe conceptos visuales contradictorios. Encarnação tampoco debe aparecer en la home.

## Alcance

**Entra:** convertir C en `/mockup/`, eliminar A/B y selector, retirar Encarnação de la
home, actualizar todos los documentos de diseño y registrar la decisión definitiva.

**No entra:** migración productiva a JSON, implementación de las otras cuatro pantallas,
datos de dirección todavía no entregados ni cambio del scaffold de `/`.

## Diseño

Sol → montaña → tierra → dojo → umbral se convierte en gramática del sitio. Cada pantalla
usa una transformación propia del paisaje, manteniendo paper/ink/red, SVG estático,
tipografía legible y narrativa vertical.

## Archivos

| Archivo | Acción |
|---|---|
| `src/pages/mockup.astro` | reemplazar por C y retirar Encarnação |
| `src/pages/mockup-b.astro`, `src/pages/mockup-c.astro` | eliminar |
| `src/components/DesignSwitcher.astro` | eliminar |
| `docs/design/**` | alinear con dirección elegida |
| `docs/adr/0009-direccion-paisaje.md` | crear |
| `docs/INDEX.md`, `docs/TASKS.md` | actualizar estado |

### Disjunta?

No: toca el prototipo de specs 0003–0005. Se ejecuta serialmente con ellas terminadas.

## Verificación

- [x] sólo `/mockup/` se genera
- [x] Encarnação no aparece en el HTML de `/mockup/`
- [x] cero scripts, gradientes y sombras
- [x] typecheck y build limpios
- [x] documentación sin enlaces rotos ni dirección vigente contradictoria

## Abierto

Ninguno para consolidar y publicar el prototipo.
