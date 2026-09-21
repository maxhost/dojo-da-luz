---
adr: 0036
fecha: 2026-09-21
estado: aceptada
resumen: /outras-artes pasa a tener portada con foto de fondo como el resto de las paginas interiores, gana una galeria de la pagina —no una por arte— que no se pinta si esta vacia, y pierde el id escrito de cada arte, que era un ancla muerta.
---

# 0036 — La portada, la galeria y el id de /outras-artes

## Contexto

`/outras-artes` es la ultima pagina interior con **portada plana**: una franja
`bg-[#27231f]` con texto centrado y ninguna imagen. `/aikido`, `/eventos` y las paginas de
audiencia ya tienen una portada con foto de fondo y velo negro; esta quedo sin migrar y se
nota al navegar entre ellas.

Ademas, es la unica de las cinco paginas con contenido rico que **no tiene galeria**. Las de
audiencia ganaron una de largo libre con fotos o videos de YouTube en el ADR-0031 y el
cliente la usa; aca no hay donde poner una foto que no sea la unica de cada arte.

Y arrastra el mismo defecto que se corrigio en `/aikido` (spec 0037): **cada arte lleva un
`id` escrito en el contenido** —`shiatsu`, `iaido`, `tai-chi`— que sale como ancla HTML.
`grep` sobre `src/`, `content/`, `public/`, `docs/` y la matriz de redirects no encuentra
**ni un solo enlace** a `#shiatsu`, `#iaido` o `#tai-chi`.

## Decision

**Tres cosas, y las tres alinean esta pagina con el resto.**

1. **La portada lleva foto de fondo.** Mismo bloque que `/eventos` y `/aikido`: imagen a
   sangre, velo negro encima, texto abajo. La foto es `heroPhoto` en el contenido, se
   cambia desde el backoffice y se publica como **decorativa** (`alt=""`): detras del velo
   y del titular no aporta nada a un lector de pantalla.
2. **La galeria es de la pagina, no de cada arte.** Una sola, al final, con la misma forma
   que la de Adultos y Criancas (ADR-0031): largo libre, cada medio es una foto subida o un
   video de YouTube, y el video no le pide nada a YouTube hasta que alguien lo toca. **Con
   cero medios la seccion entera no se pinta** —ni su titulo— porque un rotulo sobre una
   rejilla vacia es peor que no tener la seccion. Nace vacia: las fotos las pone el cliente.
3. **El `id` de cada arte se borra del contenido.** El ancla pasa a ser por posicion
   (`#arte-1`, `#arte-2`…), igual que en `/aikido`. Un identificador tecnico no es contenido
   que el cliente deba escribir (ADR-0026), y ademas el id era el mismo en los cuatro
   idiomas por copia, no por garantia.

**Las tres artes siguen siendo tres.** No se pueden añadir ni quitar desde el backoffice:
cada una trae un formulario externo propio (`formUrl`) que no se edita desde el BO por la
razon de la spec 0035 —un destino mal escrito deja el modal en blanco sin avisar— y un arte
nueva sin formulario no seria un alta, seria media alta. Si el dojo suma una cuarta, es una
spec con su decision sobre el formulario.

## Consecuencias

- Las cuatro paginas de `/outras-artes` cambian de aspecto. Es el unico cambio visual de la
  spec 0040: todo lo demas es de donde sale el texto, no que dice.
- `formUrl` y el resto de lo que no se edita **viaja oculto en el formulario** y ademas se
  siembra desde portugues (ADR-0032): por la puerta de una traduccion no entra un destino
  distinto.
- Una galeria que nace vacia significa que la pagina publica **no cambia** por tenerla hasta
  que el cliente suba la primera foto. Es deliberado: la seccion existe el dia que hay algo
  que mostrar.
- El ancla vieja `#shiatsu` deja de funcionar. No la usaba nadie, y si algun dia hace falta
  un enlace directo a un arte, se decide con un ancla estable de verdad —no con un campo de
  texto que el cliente puede reescribir sin saber que rompe.
