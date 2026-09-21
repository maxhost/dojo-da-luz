---
spec: 0030
fecha: 2026-09-21
estado: cerrada
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
- Las variantes: **AVIF y WebP en 3 anchos** (480, 960, 1600) más el original como
  respaldo. `<img srcset>` plano, sin optimización en runtime (ADR-0002).
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

**La clave sale del contenido, no del nombre.** `medios/<sha256[0..12]>/<ancho>.<ext>`.
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
Vercel. Si no entra, el plan B es subir el original sin variantes y dejar el `srcset` para
una spec aparte — **el valor de esta spec es tener las imágenes en nuestro bucket**, no
las variantes.

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

- [ ] `npm run typecheck`, `npm test` y `npm run build` limpios; el sitio sigue en 44 rutas.
- [ ] Subir un JPEG de 3000 px deja en R2 las 7 claves esperadas (3 AVIF, 3 WebP, 1
      original) y devuelve una URL que responde 200 con `content-type: image/avif`.
- [ ] Subir **el mismo archivo** dos veces no crea claves nuevas y responde la misma URL.
- [ ] Subir un PDF renombrado a `.jpg` → rechazado nombrando el motivo, sin escribir en R2.
- [ ] Un archivo de 11 MB → rechazado, sin escribir en R2.
- [ ] Elegir una imagen desde el BO y guardar la Home publica un `home.json` cuya URL de
      imagen es la del bucket, y la home construida la sirve.
- [ ] `POST /admin/medios` sin cookie de sesión → 302 a `/admin/entrar`, sin escribir nada.
- [ ] Con R2 caído o mal configurado, el BO lo dice y no publica un JSON con una URL rota.
- [ ] El tamaño de la función con `sharp` está por debajo del límite de Vercel.

## Abierto

- **Credenciales.** Hacen falta `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET` y `R2_PUBLIC_URL`. Las genera el dueño de la cuenta de Cloudflare. **Bloquea
  la verificación entera**: sin bucket no hay nada que probar.
- **El dominio público del bucket se decide antes de subir la primera imagen.** Si se
  empieza con `r2.dev` y después se pasa a `media.aikido-duran.com`, hay que reescribir
  todas las URLs de los JSON.
- **`sharp` en Vercel.** Si no entra en el límite de la función, se cae a subir el original
  sin variantes. Hay que medirlo antes de dar la spec por implementada.
- Quién limpia lo que se sube por error. Esta spec no borra: si el cliente sube diez
  pruebas, quedan diez objetos. Con este volumen es irrelevante; si deja de serlo, es una
  spec de mantenimiento.
