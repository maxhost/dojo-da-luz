---
spec: 0005
fecha: 2026-09-17
estado: implementada
resumen: Tercera alternativa de home como paisaje narrativo continuo de sol, montaña, tierra, dojo y umbral.
disjunta: si
archivos: src/components/DesignSwitcher.astro, src/pages/mockup-c.astro
---

# 0005 — Home paisaje narrativo

## Problema

Las alternativas anteriores siguen percibiéndose como composiciones de secciones
independientes. Falta una metáfora formal que ordene toda la home.

## Alcance

**Entra:** Diseño C, selector A/B/C, SVG estático para sol, montaña, suelo, estructura y
umbral, y contenido esencial de home.

**No entra:** animación, otras pantallas, integración productiva o descarte de A/B.

## Diseño

La forma evoluciona verticalmente: sol → línea → montaña → suelo → dojo → umbral. El rojo
aparece como origen, credencial del profesor y acción final. El disco no lleva rayos ni
reproduce las proporciones de una bandera.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/DesignSwitcher.astro` | ampliar a C |
| `src/pages/mockup-c.astro` | crear |

### Disjunta?

Sí respecto del sitio productivo; extiende el comparador de prototipos.

## Verificación

- [x] typecheck limpio
- [x] `/mockup-c/` prerenderizado
- [x] selector recíproco A/B/C
- [x] cero scripts, gradientes y sombras

## Abierto

Pendiente de validación visual.
