---
adr: 0031
fecha: 2026-09-21
estado: aceptada
resumen: La galeria de las paginas de audiencia deja de tener seis medios fijos: largo libre, cada medio es una foto subida o un video de YouTube, el grid se adapta a la cantidad y el video no le pide nada a YouTube hasta que alguien lo toca. Supersede el ADR-0019.
---

# 0031 — Galeria de largo libre, con YouTube

## Contexto

La galeria de `/aulas/adultos` y `/aulas/criancas` se definio con **seis medios exactos**
(ADR-0019, spec 0024): `gallerySchema` dice `items: z.array(...).length(6)` y el grid es un
mosaico calculado para esa cantidad —el primer medio ocupa 2×2 sobre tres columnas—.

Eso volvio imposible lo que pidio el cliente al abrir el editor de esta pagina: *"que el
usuario admin quite o añada imagenes sin un limite, el grid publico deberia adaptarse"*.

El unico video que hay hoy en las ocho galerias (adultos y criancas × 4 idiomas) es un
**mp4 de stock de Pexels** servido con `<video controls>`. No es del dojo, y el camino para
poner uno propio no existe: habria que alojar un mp4 y ademas una imagen de portada.
El cliente tiene los videos en YouTube, que es donde los sube.

## Decision

**Tres cambios a la galeria de las paginas de audiencia.**

1. **Largo libre.** `items` pierde el `.length(6)`. Se puede tener uno, cinco o veinte.
   Con cero medios la seccion entera no se pinta: un titulo sobre una rejilla vacia es
   peor que nada.

2. **Un medio es una foto o un video de YouTube.** El tipo `video` con `src` mp4 y
   `poster` desaparece del schema; entra `youtube` con la URL del video. La foto se sube
   desde la computadora y va a R2 (spec 0030); el video se pega como enlace. El id se
   extrae de la URL al renderizar, y de ahi salen la miniatura
   (`i.ytimg.com/vi/<id>/hqdefault.jpg`) y el reproductor. **No se alojan videos propios**:
   un mp4 nuestro es ancho de banda y transcodificado que YouTube ya resuelve.

3. **El grid se adapta a la cantidad**, con el mosaico como caso particular:

   | Medios | Movil | Escritorio |
   |---|---|---|
   | 1 | ancho completo | ancho completo, centrado a media caja |
   | 2 | dos columnas | dos columnas |
   | 3 o 4 | dos columnas | tres columnas iguales |
   | 5 o mas | dos columnas | tres columnas, el primero 2×2 (como hoy) |

   Mas `grid-auto-flow: dense`, que es lo que tapa el hueco cuando la cantidad no cierra
   con el mosaico.

**El video no se carga hasta que se toca.** Se pinta la miniatura de YouTube con un boton
de play encima; al tocarla se reemplaza por el `iframe` de `youtube-nocookie.com` con
`autoplay=1`. Sin tocar nada, la pagina no le pide a YouTube mas que una imagen.

## Consecuencias

- **Se rompe la promesa "sin JavaScript" del ADR-0019 para el video**, y solo para el
  video: el resto de la galeria sigue siendo HTML y CSS. El intercambio esta medido al
  reves de lo que suena — un `iframe` de YouTube incrustado de entrada trae del orden de
  1 MB de codigo ajeno **en cada visita, la toque alguien o no**, y la prioridad declarada
  del sitio es carga hiper rapida. Nueve lineas de script propio cuestan menos que eso.
- Sin JavaScript en el navegador, la miniatura queda como **enlace al video en YouTube**:
  la galeria no se rompe, cambia de destino.
- **YouTube ve a los visitantes que tocan play**, no a los que pasan. `youtube-nocookie`
  acota lo que se deja antes del click, no lo elimina despues.
- La miniatura sale de `i.ytimg.com`, no de R2: **no se sube nada al agregar un video**.
  El costo es una dependencia de un dominio de Google para que la galeria se vea completa.
- El mp4 de Pexels se borra de los ocho archivos. Las galerias quedan en cinco fotos hasta
  que alguien agregue un video propio desde el backoffice.
- `hqdefault.jpg` existe siempre; `maxresdefault.jpg` **no** existe para todos los videos y
  devuelve un 404 con imagen gris. Se usa `hqdefault`.
