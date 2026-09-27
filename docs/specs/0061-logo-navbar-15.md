---
spec: 0061
fecha: 2026-09-27
estado: cerrada
resumen: El logo de la cabecera pasa de 62 a 71 px (+15%); la cabecera sube de 100 a 107 px y el menu se aprieta entre 1024 y 1279 px para no sumar scroll horizontal
disjunta: si
archivos: src/layouts/Base.astro
---

# 0061 — Logo de la cabecera otro 15% mas grande

## Problema

Despues de la 0060 (56 → 62 px) el cliente pidio el 2026-09-27 otro 15%: 62 × 1,15 = 71,3 → 71 px.

## Alcance

**Entra:**
- Logo (y su marcador sin logo) `size-15.5` → `size-17.75` (71 px), `width`/`height` 71.
- Efecto aceptado: ya no entra en los 64 px de contenido de la cabecera (`min-h-24` − `py-4`),
  asi que la cabecera sube de 100 a 107 px en todos los anchos.
- El logo mas ancho sumaba scroll horizontal a 1024 px en portugues y a 1032 en español. Se
  compensa separando los items del menu 12 px en vez de 16 solo entre 1024 y 1279 px
  (`lg:max-xl:gap-3` en el `<ul>` del menu).

**No entra:** el problema preexistente de la cabecera entre 1024 y ~1080 px (nombre y menu en
varias lineas, 161 px de alto, scroll horizontal en `/fr`). Es otra tarea.

## Verificacion

- [x] `npm test` y `npm run build` en verde.
- [x] Logo 71×71 medido en Chromium a 1440/1280/1024/390 px.
- [x] Barrido de 360 a 1600 px cada 8 px en `/`, `/es`, `/fr`, `/en` contra produccion: ningun
      ancho empeora. Antes: scroll en `/es` 1024 y `/fr` 1024–1072. Despues: solo `/fr`
      1024–1048.
