---
adr: 0029
fecha: 2026-09-21
estado: aceptada
resumen: Cada cosa se edita donde se ve: la imagen vuelve a su seccion con la miniatura como boton, y que el archivo sea compartido pasa a ser un detalle de almacenamiento invisible; supersede la parte de UI del ADR-0028.
---

# 0029 — Se edita donde se ve

## Contexto

El ADR-0028 resolvio un problema real —una foto no se traduce, y tenerla en los cuatro
`home.json` obligaba a cargarla cuatro veces— pero lo resolvio **en la pantalla**: puso las
cinco imagenes en un bloque aparte al final del editor, "Imágenes de la portada".

El cliente lo miro y pregunto "¿que es eso? ¿para que?". Con razon: para cambiar la foto de
la seccion "04 · O dojo" hay que salir de esa seccion, bajar al final de la pagina, adivinar
cual de cinco imagenes es, y volver. Y el bloque necesita un parrafo explicando por que
existe — una caja que necesita explicarse ya perdio.

El mismo error en parcerias: cada logo pide un nombre y una ampliacion. El nombre es el
texto alternativo y la ampliacion existe por un logo con mucho margen en el archivo; las dos
razones son ciertas y ninguna justifica dos campos de texto por logo en la pantalla del
cliente.

## Decision

**Donde algo se ve, ahi se edita.** Un campo por cosa, y la cosa es lo que el cliente
reconoce: un texto es un input de texto, una imagen es una imagen que se toca.

- Las cinco imagenes **vuelven a su seccion**, con la miniatura funcionando como boton:
  tocarla abre el selector de archivos. El bloque "Imágenes de la portada" desaparece.
- **Que el archivo sea compartido es almacenamiento, no interfaz.** Se sigue guardando una
  sola vez en `content/media.json` —el ADR-0028 sigue vigente en el modelo de datos— y el
  editor publica ese archivo junto con el del idioma cuando la imagen cambio. El cliente no
  se entera, que es exactamente lo que tiene que pasar.
- **Un parceiro es un logo.** Ni nombre ni ampliacion en pantalla: la imagen y un "quitar".
  Los dos datos siguen en el JSON —el texto alternativo importa para quien no ve, y la
  ampliacion mantiene un logo legible— y viajan ocultos con su fila.

## Consecuencias

- Publicar un idioma puede escribir dos archivos: `content/<locale>/home.json` y, si alguna
  imagen cambio, `content/media.json`. Son dos commits. El control de concurrencia necesita
  los dos `sha`.
- La miniatura como boton exige JavaScript. Para el sitio publico eso seria inaceptable
  (ADR-0001); para el backoffice ya no lo es: sin JavaScript tampoco se puede subir a R2.
  El campo degrada a lo que ya era —una direccion escrita a mano— y no a nada.
- Un parceiro nuevo nace sin texto alternativo. Se le pone uno generico; si alguien quiere
  el nombre real, se edita el JSON. Es la concesion consciente de esta decision.
- Supersede **la parte de interfaz** del ADR-0028: "se editan en un bloque propio" deja de
  valer. El resto de ese ADR —una imagen, cuatro idiomas; el `alt` y el pie por idioma—
  sigue en pie.
