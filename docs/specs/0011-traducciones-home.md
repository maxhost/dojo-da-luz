---
spec: 0011
fecha: 2026-09-18
estado: implementada
resumen: Sustituir los placeholders de la Home en español, francés e inglés por traducciones completas del contenido portugués vigente.
disjunta: si
archivos: content/es/home.json, content/fr/home.json, content/en/home.json, docs/INDEX.md, docs/TASKS.md
---

# 0011 — Traducciones completas de la Home

## Problema

La Home portuguesa tiene contenido real, pero es/fr/en conservan placeholders del
scaffold. Por eso títulos, textos, botones, ficha del profesor, footer y SEO no tienen
paridad entre idiomas.

## Alcance

- Traducir fielmente a es/fr/en todo `content/pt/home.json`.
- Mantener la misma estructura, hechos, nombres propios, sedes y credenciales.
- No modificar diseño, rutas ni contenido portugués.
- Verificar que no quede ninguna ocurrencia de `Placeholder` en `content/*/home.json`.

## Archivos

| Archivo | Acción |
|---|---|
| `content/es/home.json` | reemplazo completo |
| `content/fr/home.json` | reemplazo completo |
| `content/en/home.json` | reemplazo completo |
| `docs/INDEX.md` | registrar spec |
| `docs/TASKS.md` | registrar resultado |

### Disjunta?

Sí respecto del siguiente trabajo de Aikido: sólo toca los JSON de Home. Se ejecuta
ahora como corrección de contenido.

## Verificación

- [x] `rg Placeholder content/*/home.json` vacío.
- [x] `npm run typecheck`: 0 errores, warnings o hints.
- [x] `npm run build`: ocho rutas generadas correctamente.
- [x] H1 y ambos botones localizados verificados en los HTML es/fr/en.
- [x] `git diff --check` limpio.
