---
spec: 0030
fecha: 2026-09-21
estado: implementada, sin verificar contra R2
resumen: El backoffice sube imágenes a Cloudflare R2: sharp genera AVIF y WebP en tres anchos, la clave sale del hash del contenido y el JSON guarda la URL pública, de modo que el sitio servido nunca depende de R2 en runtime.
disjunta: si
archivos: src/lib/medios.ts, src/lib/r2.ts, src/pages/admin/medios/**, src/components/admin/CampoImagen.astro, package.json
---

# 0030 — Subir imágenes a R2 desde el backoffice

## Problema

La spec 0029 dejó los campos de imagen de la Home editables, pero pidiendo **una URL
escrita a mano**. El cliente no tiene de dónde sacarla: no va a abrir el inspector de Wix
para copiar un `static.wixstatic.com`. Sin un sitio donde poner un archivo, el editor de
imágenes no es editor de nada.

Y el fondo es peor que la comodidad. Hoy **todo el media del sitio vive en el Wix que
estamos reemplazando**: las 32 imágenes, los ocho logos de parceiros, los retratos. El día
que el cliente cierre esa cuenta, el sitio nuevo se queda sin fotos. El ADR-0001 eligió R2
justo para esto y sigue sin usarse.

## Alcance

**Entra:**

- `src/lib/r2.ts`: subida a R2 por su API S3, firmada con SigV4. Solo `PUT` y `HEAD`.
- `src/lib/medios.ts`: recibe un archivo, lo valida, genera las variantes con `sharp` y
  devuelve la URL pública y el `srcset`.
- `POST /admin/medios`: sube un archivo y responde con la URL. Bajo el guard del BO.
- `GET /admin/medios`: galería de lo ya subido, para reusar sin volver a subir.
- `CampoImagen.astro` gana el botón de subir y el selector de la galería, además de la URL
  a mano que ya tiene de la 0029.
- Por cada imagen se guardan **dos objetos**: el original tal cual y una **WebP de hasta
  1600 px** de ancho, que es la que se sirve. Ver "Una variante, no seis", abajo.
- Límites duros, validados en el servidor: `image/jpeg|png|webp|avif`, 10 MB, 8000 px de
  lado. Un archivo que no cumple no se sube y se dice por qué.

**No entra:**

- **Borrar de R2.** Una imagen borrada que todavía está referenciada en un JSON rompe la
  página, y el ahorro es de céntimos. Se acumulan.
- La migración de las 32 imágenes de Wix. Es la tarea 1 del baseline y se hace con un
  script, no a mano por el BO. Esta spec le da el destino.
- Vídeo. El del hero es de Pexels y los de las páginas de vídeo son YouTube con fachada
  (ADR-0002).
- Recorte, rotación o edición. El cliente sube la imagen ya recortada.

## Diseño

**Una variante, no seis.** La spec nació pidiendo AVIF y WebP en tres anchos. No se
sostiene: el contenido guarda `photo` como **una** URL (`z.url()`), el render usa
`<img src>` y no hay `<picture>` ni `srcset` en ninguna parte del sitio. Seis variantes
que nadie lee son andamiaje, y CLAUDE.md dice que el andamiaje va con la tarea que lo
consume o no va.

Lo que sí hace falta es que la foto de 4 MB que sale de un móvil no llegue entera a la
página: el cliente pidió carga hiper rápida. Así que se genera **una** WebP de hasta
1600 px —soporte universal desde hace años, sin necesidad de fallback— y esa es la URL que
se guarda. El original se conserva junto a ella, sin servirse: es el negativo del que se
reprocesa el día que el render sepa leer `srcset`, y esa spec futura no tendrá que pedirle
al cliente que vuelva a subir nada.

**La clave sale del contenido, no del nombre.** `medios/<sha256[0..12]>/<nombre>.<ext>`, con `<nombre>` = `original` o `w1600`.
Subir dos veces el mismo archivo da la misma clave y no duplica nada; dos archivos
distintos nunca chocan aunque se llamen igual; y como la clave cambia con el contenido, el
objeto se puede cachear para siempre (`Cache-Control: public, max-age=31536000, immutable`).
Un `HEAD` antes del `PUT` evita reprocesar lo que ya está.

**El JSON guarda la URL pública, no la clave.** El HTML construido apunta al dominio
público del bucket. El sitio servido no habla con R2 ni con nuestra API: si R2 se cae, las
imágenes no cargan, pero la página sigue sirviéndose igual de rápido — la propiedad que el
ADR-0002 protege.

**`sharp` corre en la función del backoffice, no en el build.** Procesar al subir es una
vez por imagen; procesar en el build es cada vez que se publica. El coste es el tamaño de
la función: `sharp` trae binarios nativos y hay que confirmar que entra en el límite de
Vercel. Si no entra, el plan B es subir el original sin redimensionar — **el valor de esta
spec es tener las imágenes en nuestro bucket**, no el reencodeado.

**SigV4 a mano y no el SDK de AWS.** `@aws-sdk/client-s3` son varios MB para hacer un
`PUT` firmado. R2 habla S3 y la firma son ~80 líneas con `node:crypto`. Coherente con no
atarse a APIs del host (ADR-0001) y con el peso de la función.

**Dominio público del bucket.** Hace falta uno: `r2.dev` para empezar y
`media.aikido-duran.com` cuando exista el dominio. La URL guardada en el JSON depende de
esa elección, así que cambiarla después obliga a reescribir los JSON — se decide antes de
subir la primera imagen, no después.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/r2.ts` | crear — firma SigV4, `subir()` y `existe()` |
| `src/lib/medios.ts` | crear — validación, variantes con `sharp`, `srcset` |
| `src/pages/admin/medios/index.astro` | crear — galería y formulario de subida |
| `src/pages/admin/medios/subir.ts` | crear — `POST` multipart |
| `src/components/admin/CampoImagen.astro` | editar — botón de subir y selector |
| `package.json` | editar — `sharp` |
| `.env.example` | editar — descomentar las cuatro `R2_*` y sumar `R2_PUBLIC_URL` |

### Disjunta?

**Sí**, salvo `CampoImagen.astro`, que crea la 0029. Se serializa: 0029 → 0030.

## Verificacion

Hecho:

- [x] `astro check` 0/0/0, `npm test` **9/9** (5 de auth + 4 nuevos de la firma) y
      `npm run build` con 44 rutas: el sitio público no cambia.
- [x] **La firma SigV4 es correcta**, contra los vectores públicos de AWS: `get-vanilla` y
      `get-vanilla-query-order-key-case` dan la firma esperada al byte.
- [x] Un PDF renombrado a `.jpg` → 422 "No es una imagen que se pueda leer": el formato lo
      decide `sharp` leyendo los bytes, no la extensión.
- [x] Archivo vacío → 422. 11 MB → 422 nombrando el tamaño. 9000 px de lado → 422 nombrando
      las medidas. Ninguno llega a tocar R2: se valida antes de mirar las credenciales.
- [x] `POST /admin/medios/subir` sin cookie → 302 a `/admin/entrar`.
- [x] Sin las variables configuradas, el BO dice exactamente cuáles faltan.
- [x] **El tamaño de la función es 23 MB**, muy por debajo del límite de 250 MB de Vercel:
      `sharp` entra sin problema y no hace falta el plan B.
- [x] El dominio público del bucket está activo: responde 404 de R2 a una clave inexistente.

Bloqueado por los permisos del token de R2 (ver Abierto):

- [ ] Subir un JPEG deja en R2 las dos claves y la URL pública responde 200 con
      `content-type: image/webp`.
- [ ] Subir el mismo archivo dos veces responde la misma URL sin volver a escribir.
- [ ] La galería lista lo subido.
- [ ] Elegir una imagen desde el editor y publicar deja la URL del bucket en el JSON.

## Abierto

- **El token de R2 no tiene permiso sobre el bucket.** Las tres operaciones —`HEAD`, `PUT` y
  `ListObjectsV2`— responden `403 AccessDenied` contra
  `f42a4ec1d9145b1d6f9e043d2c3e262e.r2.cloudflarestorage.com/dojo-da-luz-dev`. El código
  importa: R2 devuelve `SignatureDoesNotMatch` cuando la firma está mal y `InvalidAccessKeyId`
  cuando la clave no existe. `AccessDenied` significa que **la firma se validó y la clave es
  real**, pero ese token no puede tocar ese bucket. Se arregla en Cloudflare → R2 → *Manage
  R2 API Tokens*: el token tiene que ser de tipo R2, con permiso **Object Read & Write**, y
  su ámbito tiene que incluir `dojo-da-luz-dev`. **Hasta entonces la subida no está
  verificada.**
- **Las credenciales están en Vercel, no en local.** `vercel env pull` devuelve los valores
  vacíos: son variables cifradas y la plataforma no las entrega. Consecuencia práctica: el
  camino que habla con R2 **no se puede verificar en `astro dev`**, solo contra producción.
  La firma SigV4 sí se verifica en local, contra los vectores de prueba públicos de AWS.
- **El dominio público del bucket queda fijado**: `https://pub-1583795645db473491961fb0558ff2d3.r2.dev`,
  bucket `dojo-da-luz-dev`. Es un dominio de desarrollo de R2. Pasar a
  `media.aikido-duran.com` más adelante obliga a reescribir las URLs de todos los JSON que
  apunten ahí — cuanto antes se decida, menos hay que reescribir.
- **`sharp` en Vercel.** Si no entra en el límite de la función, se cae a subir el original
  sin variantes. Hay que medirlo antes de dar la spec por implementada.
- Quién limpia lo que se sube por error. Esta spec no borra: si el cliente sube diez
  pruebas, quedan diez objetos. Con este volumen es irrelevante; si deja de serlo, es una
  spec de mantenimiento.
