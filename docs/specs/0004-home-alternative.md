---
spec: 0004
fecha: 2026-09-17
estado: implementada
resumen: Segunda composición estática de home y selector HTML entre ambos prototipos.
disjunta: si
archivos: src/components/DesignSwitcher.astro, src/pages/mockup.astro, src/pages/mockup-b.astro
---

# 0004 — Alternativa creativa para Inicio

## Problema

La home modular se aproxima al tono buscado, pero el hero resulta extraño y los acentos
no producen suficiente jerarquía visual.

## Alcance

**Entra:** conservar Diseño A, crear Diseño B con composición y hero distintos, y añadir
un selector estático entre ambas rutas.

**No entra:** sustituir la home productiva, crear otras pantallas, formularios funcionales
ni JavaScript.

## Diseño

`DesignSwitcher` emite dos enlaces normales con `aria-current`. Diseño B concentra el
rojo en el umbral del hero y en la acción final, usa imágenes pequeñas y entrelaza
información práctica con relato. Rutas: `/mockup/` y `/mockup-b/`.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/DesignSwitcher.astro` | crear |
| `src/pages/mockup.astro` | añadir selector |
| `src/pages/mockup-b.astro` | crear |

### Disjunta?

Sí respecto de las specs abiertas; extiende el prototipo implementado por 0003.

## Verificación

- [x] typecheck limpio
- [x] ambas rutas se prerenderizan
- [x] enlaces recíprocos y `aria-current` correctos
- [x] cero `<script>` en ambos HTML

## Abierto

La elección A/B queda pendiente de validación visual.
