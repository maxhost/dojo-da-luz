---
adr: 0049
fecha: 2026-09-25
estado: aceptada
resumen: Las fotos de /eventos dejan de recortarse — sin caja de proporcion fija ni object-cover, se muestran enteras a su tamaño natural — porque son flyers con informacion en cualquier parte del cuadro y ningun recorte, con foco o sin el, garantiza no perder nada; supersede la parte de ADR-0048 que aplicaba el punto focal a /eventos.
---

# 0049 — /eventos no recorta, muestra la imagen entera

## Contexto

ADR-0048 decidio un punto focal por imagen para `/eventos` y `/dojo`: un clic elige que
parte de la foto queda visible cuando la tarjeta la recorta con `object-cover`. Se
implemento (spec 0052), se verifico en produccion —el cliente eligio el foco de un evento
roto y funciono de punta a punta— y **igual no alcanza**.

El motivo lo dijo el cliente con el caso exacto: *"son flyers, entonces tenemos un
problema, si se recortan queda informacion fuera del recorte"*. Un punto focal elige
**cual** parte de la imagen se pierde; no evita que se pierda una parte. Para una foto de
persona eso alcanza —hay una cara, el resto es descartable—. Para un flyer con titulo
arriba, foto en el medio y fecha/lugar/logos abajo, **no hay un solo rectangulo que
contenga todo lo importante** si la caja es mas chica que la imagen. La spec 0053 ya habia
medido esto de pasada —cambiar `/eventos` de `aspect-[4/3]` a `aspect-[4/5]` bajo el
recorte de ~45 % a ~12 %— pero seguia siendo un recorte, y "menos" no es lo que se pidio.

## Decision

**`/eventos` deja de recortar. La imagen se muestra entera, a su tamaño natural.**

El `<img>` pierde la caja de proporcion fija (`aspect-[4/5]`) y `object-cover`: queda
`class="w-full"`, sin mas. El navegador escala la imagen al ancho de la columna y la
altura sale sola de la proporcion real del archivo — nunca se corta nada, por construccion,
sin importar que tan alto o ancho sea el flyer.

Consecuencia directa: **el punto focal deja de tener sentido para `/eventos`** —no hay
nada que recortar, nada que posicionar—. Se saca `photoFoco` del schema de eventos, de la
propagacion (`SEMBRADOS_EVENTOS`) y del editor. El campo `focoSchema` sigue existiendo,
exportado, porque **`/dojo` lo sigue usando** (spec 0053, "Otros profesores"): ahi si hay
un sujeto (una cara) y un default razonable (`object-top`), y el foco es la excepcion que
lo ajusta. La diferencia entre las dos paginas no es tecnica, es de contenido: un retrato
tiene un centro de interes recortable: un flyer no.

**Que esto supersede de ADR-0048:** la parte que decia que `/eventos` iba a usar el punto
focal. El resto de ADR-0048 —el mecanismo en si, `CampoFoco.astro`, el formato
`"X% Y%"`, y su uso en `/dojo`— sigue vigente sin cambios.

## Consecuencias

- **Las tarjetas de `/eventos` ya no tienen una altura pareja.** Antes todas median lo
  mismo (la caja fija); ahora cada una mide lo que le corresponde a su imagen. El layout
  ya estaba preparado para esto —cada evento es su propia fila (`grid md:grid-cols-2`), no
  una grilla de tarjetas que necesite alinearse entre si, y el texto se centra solo
  (`self-center`) contra la altura que termine teniendo la imagen.
- Un flyer muy vertical (el mas extremo medido: 1080×1920, relacion 0,56) va a ocupar mas
  alto de pantalla que antes. Es el costo directo de la garantia pedida: nunca se pierde
  informacion, a cambio de que la pagina se hace mas larga con fotos muy verticales.
- **El campo de imagen ya no anuncia ni permite ajustar encuadre en `/eventos`.** La ayuda
  del editor pasa a decir "subila ya con el encuadre que querés mostrar": la
  responsabilidad de como se ve el flyer es de que archivo se sube, no de un control
  posterior.
