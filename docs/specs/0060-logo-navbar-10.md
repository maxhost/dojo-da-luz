---
spec: 0060
fecha: 2026-09-27
estado: cerrada
resumen: El logo de la cabecera pasa de 56 a 62 px (+10%, pedido del cliente), sin cambiar el alto de la cabecera
disjunta: si
archivos: src/layouts/Base.astro
---

# 0060 — Logo de la cabecera un 10% mas grande

## Problema

El cliente pidio el 2026-09-27 el logo del navbar un 10% mas grande. Hoy es `size-14` (56 px)
en `src/layouts/Base.astro`.

## Alcance

**Entra:** el `<img>` del logo (y el marcador «合気» que lo reemplaza si no hay logo) pasa a
`size-15.5` = 62 px (56 × 1,1 = 61,6), con `width`/`height` 62.

**No entra:** el nombre «Dojo da Luz», la bajada, el menu, el pie.

## Verificacion

- [x] `npm test` y `npm run build` en verde.
- [x] Medido en Chromium a 1440/1280/1024/390 px: el logo mide 62 px y el alto de la
      cabecera es el mismo que en produccion antes del cambio.
