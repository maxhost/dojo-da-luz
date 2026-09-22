---
adr: 0044
fecha: 2026-09-21
estado: aceptada
resumen: Los archivos grandes —el video de la portada, y ya hoy cualquier foto de movil— suben del navegador a R2 con URL prefirmada, porque Vercel corta el cuerpo de una funcion en 4,5 MB; reabre la decision de CORS que la spec 0030 habia descartado.
---

# 0044 — La subida grande va prefirmada

## Contexto

El cliente pidio poder cambiar el video de la portada desde el backoffice. El subidor
actual manda el archivo **en el cuerpo de un POST a una funcion de Vercel**
(`/admin/medios/subir`), que lo procesa con `sharp` y lo sube a R2.

Eso no se puede hacer con un video, y **tampoco se puede hacer ya hoy con una foto**.
Medido contra produccion con un PNG de 5,8 MB:

```
HTTP 413 · Request Entity Too Large · FUNCTION_PAYLOAD_TOO_LARGE
```

Vercel corta el cuerpo de una funcion en **4,5 MB** y responde antes de que corra una linea
de nuestro codigo. Consecuencias que ya estan en produccion:

- El campo de imagen **anuncia un limite de 10 MB** que no existe: el real es 4,5.
- Una foto de movil moderna pesa entre 3 y 8 MB, asi que **el cliente va a chocar con esto**.
- Peor: la respuesta de Vercel es texto plano, y el codigo del campo hace `res.json()`
  dentro del `try`. El cliente no ve "el archivo es muy grande": ve un error de parseo de
  JavaScript.

## Decision

**El archivo no pasa por la funcion: va del navegador a R2 con una URL prefirmada.**

1. `POST /admin/medios/firmar` — la funcion recibe **solo metadatos** (nombre, tipo, tamaño,
   variante), valida, y devuelve una URL `PUT` prefirmada con vencimiento corto y la URL
   publica final. El cuerpo son bytes contados, no el archivo.
2. El navegador hace el `PUT` directo a R2 con esa URL. Sin limite de 4,5 MB, porque no hay
   funcion en el medio.
3. **Hay que configurar CORS en el bucket**, que es exactamente lo que la spec 0030 habia
   descartado —y con razon entonces: el `PUT` salia servidor contra servidor y ningun
   navegador aplicaba CORS—. Hoy el `PUT` sale del navegador y **esta fila de "Descartado"
   queda revertida**, por un motivo nuevo y no por haber estado mal.

## Lo que se pierde, y como se compensa

`sharp` corria en la funcion: es lo que valida que un PDF renombrado a `.jpg` no entre, lo
que rota por EXIF y lo que genera la WebP servida. Con el archivo yendo derecho a R2, **esa
red de seguridad desaparece** para el camino nuevo.

- **Las fotos siguen pasando por la funcion** mientras pesen menos de 4 MB, que es el caso
  normal: el camino de hoy no se toca y conserva validacion y conversion.
- **Por encima de 4 MB, y el video siempre**, van prefirmadas. Ahi se valida lo que se
  puede validar sin los bytes: extension, `content-type` declarado y tamaño maximo, y el
  `content-type` **se firma**, asi que R2 rechaza un `PUT` que declare otra cosa.
- **El video no se transcodifica.** Se acepta `video/mp4` y se guarda tal cual. Transcodificar
  necesita ffmpeg, que no cabe en una funcion; si algun dia hace falta, es otra spec y otro
  servicio.
- El limite del video se fija en **32 MB**, que es lo que aguanta una portada razonable sin
  castigar la carga de la Home. El campo lo dice antes de subir, no despues.

## Consecuencias

- **Se arregla un defecto vivo**: el campo de imagen deja de mentir sobre el limite y deja
  de mostrar un error de JavaScript cuando el archivo es grande.
- La URL prefirmada la emite un endpoint con sesion: sin cookie no se firma nada. Vence en
  minutos y sirve para **una** clave, asi que no es una puerta abierta al bucket.
- El navegador necesita que R2 acepte `PUT` desde el origen del backoffice. Hay que
  configurarlo **una vez** en el bucket, y hay que acordarse de sumar el dominio real
  cuando el BO deje de estar en `dojo-da-luz.vercel.app` (ADR-0043). Queda anotado en la
  spec 0047 como paso del lanzamiento.
- Un `PUT` que falle a medias deja un objeto incompleto en R2 sin referencia en el
  contenido. Es basura inofensiva: nadie la enlaza, y la clave sale del hash del archivo.
