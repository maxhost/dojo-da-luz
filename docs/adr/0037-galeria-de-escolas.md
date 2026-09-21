---
adr: 0037
fecha: 2026-09-21
estado: aceptada
resumen: La galeria de /escolas deja de ser entre 4 y 8 fotos sueltas y pasa a ser la misma lista de medios que el resto del sitio —foto subida o video de YouTube, largo libre, vacia no se pinta— sin ganar titulo. Supersede el minimo de la spec 0026.
---

# 0037 — La galeria de /escolas es la del resto del sitio, y sigue sin titulo

## Contexto

`/escolas` tiene una galeria que **no se parece a ninguna de las otras dos**. Las de
Adultos, Criancas y `/outras-artes` son la lista de medios del ADR-0031: largo libre, foto
subida o video de YouTube, el video sin cargar hasta que alguien lo toca. La de `/escolas`
es un array de `{ src, alt }` con `.min(4).max(8)` y se pinta con su propia rejilla escrita
dentro de `SchoolsView.astro`.

De ahi salen dos problemas:

1. **No admite video**, que es justamente lo que se pidio para esta pagina.
2. **Entre 4 y 8 es un numero del schema, no del dojo.** Para sacar una foto hay que tener
   cuatro; para sumar la novena, tocar codigo. Es el mismo defecto que tenia `/eventos`
   antes del ADR-0035.

Y una diferencia que **no** es un problema: la galeria de `/escolas` **no tiene titulo**.
Las otras tres llevan rotulo, titulo e introduccion encima de la rejilla.

## Decision

**La galeria de `/escolas` pasa a ser la lista de medios del ADR-0031, y se queda sin
titulo.**

- `gallery` deja de ser `{ src, alt }[]` y pasa a ser la misma lista que el resto:
  cada medio es una foto subida o un video de YouTube, **sin minimo ni maximo**, y se arma
  en portugues (ADR-0030) con la foto y el enlace sembrados (ADR-0032).
- **Con cero medios la seccion no se pinta.** Mismo criterio que la galeria de
  `/outras-artes` y que el estado vacio de `/eventos`.
- **No gana rotulo ni titulo.** La rejilla viene inmediatamente despues del bloque de
  introduccion, que ya trae antetitulo, titulo y subtitulo: un segundo encabezado a tres
  centimetros del primero es ruido, no jerarquia. Lo que se pidio es que la galeria acepte
  video, no que se anuncie.
- Para poder reusar el componente sin inventarle un titulo vacio, **`GaleriaMedios` pasa a
  recibir la lista de medios** en vez del objeto galeria entero. Es lo unico que usaba: el
  rotulo y el titulo siempre los pintaron las vistas, no el componente.

## Consecuencias

- Supersede el `.min(4).max(8)` de la spec 0026.
- Las cuatro paginas de `/escolas` cambian de HTML: la rejilla pasa a ser la compartida, que
  destaca el primer medio al doble cuando hay cinco o mas y usa un espaciado ligeramente
  distinto. Con las cuatro fotos de hoy la diferencia es el `gap` y nada mas.
- `AudienceView` y `OtherArtsView` pasan a `items={c.gallery.items}`. Ninguna de las dos
  cambia de HTML: el componente hacia `gallery.items` adentro.
- Las cuatro fotos que hay se conservan y ganan `type: "image"` en la migracion.
