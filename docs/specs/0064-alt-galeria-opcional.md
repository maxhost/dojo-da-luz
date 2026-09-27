---
spec: 0064
fecha: 2026-09-27
estado: cerrada
resumen: La descripcion (alt) de fotos y videos de galeria pasa a ser opcional; vacia, la foto es decorativa y el video se anuncia como «Vídeo» en su idioma
disjunta: si
archivos: src/lib/schemas.ts, src/lib/schemas.test.ts, src/components/GaleriaMedios.astro, src/components/{AudienceView,SchoolsView,OtherArtsView}.astro, src/components/admin/TablaMedios.astro
---

# 0064 — Descripcion opcional en las galerias

## Problema

El cliente agrego un video de YouTube a la galeria de `/escolas` sin escribir «Descripción» y
publicar fallo: `gallery.4.alt: Too small: expected string to have >=1 characters`. El
`galleryItemSchema` exigia `alt` con `min(1)` para fotos y videos, en las cuatro galerias
(Escolas, Adultos, Crianças, Outras artes). El enlace (`https://youtu.be/605V86CSZac?is=…`)
era valido: `idDeYoutube` da `605V86CSZac`.

## Alcance

**Entra:**
- `alt: z.string()` (sin minimo) en los dos tipos de `galleryItemSchema`.
- `GaleriaMedios`: una foto sin descripcion sale con `alt=""` (decorativa, correcto para
  lectores de pantalla); un video sin descripcion lleva `aria-label` «Vídeo» / «Vídeo» /
  «Vidéo» / «Video» segun el idioma (nuevo prop `locale`, pasado por las tres vistas), porque un
  enlace sin nombre no se puede anunciar. Con descripcion, se usa la descripcion.
- Rotulo del editor: «Descripción (opcional · la leen los lectores de pantalla y Google)».

**No entra:** el medio en si sigue siendo obligatorio (enlace de YouTube valido o foto subida).

## Verificacion

- [x] `schemas.test.ts`: video y foto sin descripcion validan (fallan sin el arreglo); sin
      enlace, con enlace que no es de YouTube o sin foto, siguen rechazandose.
- [x] Copia temporal del editor de Escolas (modo disco, ya borrada): agregar el video del
      cliente sin descripcion publica (`303 ?publicado=pt`) y queda en los 4 idiomas.
- [x] Build con ese contenido: el enlace del video tiene `aria-label` «Vídeo» (pt, es),
      «Vidéo» (fr), «Video» (en) y la miniatura `alt` vacio.
- [x] `npm test` y `npm run build` en verde.
