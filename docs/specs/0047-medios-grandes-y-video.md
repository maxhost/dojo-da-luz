---
spec: 0047
fecha: 2026-09-21
estado: cerrada
resumen: La subida pasa a ser prefirmada del navegador a R2 —hoy Vercel corta en 4,5 MB y el cliente ve un error de JavaScript— y con eso el video de la portada de la Home entra al editor.
disjunta: no
archivos: src/lib/{r2,medios,ajustes}.ts, src/pages/admin/medios/{firmar.ts,subir.ts}, src/components/admin/{CampoImagen,CampoVideo}.astro, src/components/admin/FormularioHome.astro, src/lib/{forms,schemas}.ts, src/components/HomeView.astro, content/*/home.json
---

# 0047 — Medios grandes y el video de la portada

> El cliente pidio poder cambiar el video de la portada. Al medirlo aparecio que **tampoco
> puede cambiar una foto de movil**.

## Problema

1. **El video de la portada esta escrito en el codigo.** `HERO_VIDEO` en
   `HomeView.astro:18` es una URL de Pexels. El **poster** si se edita desde el BO; el
   video no. Es lo primero que se ve del sitio.
2. **Vercel corta el cuerpo de una funcion en 4,5 MB.** Medido contra produccion con un PNG
   de 5,8 MB: `413 · FUNCTION_PAYLOAD_TOO_LARGE`, antes de que corra una linea nuestra.
   Un video no pasa nunca.
3. **Y ya hoy falla para fotos.** El campo de imagen **anuncia 10 MB** y el real es 4,5.
   Una foto de movil pesa 3–8 MB.
4. **El error es ilegible.** La respuesta de Vercel es texto plano y el script del campo
   hace `res.json()` dentro del `try`: el cliente no lee "el archivo es muy grande", lee un
   error de parseo de JavaScript.

## Alcance

**Entra:**

- **`POST /admin/medios/firmar`**: recibe metadatos, valida, devuelve una URL `PUT`
  prefirmada de vencimiento corto y la URL publica final (ADR-0044).
- **`CampoImagen` sube prefirmado cuando el archivo pasa de 4 MB** y por la funcion cuando
  no. El limite anunciado pasa a ser el verdadero.
- **Mensaje de error legible** en los dos caminos: si la respuesta no es JSON, se dice lo
  que pasa y no se muestra la excepcion.
- **`CampoVideo`**: campo nuevo para `video/mp4`, hasta **32 MB**, con su cartel de tamaño
  antes de elegir el archivo.
- **`hero.video` en el contenido de la Home**, editable en el bloque 01 del editor, con el
  poster que ya existe. `HERO_VIDEO` se borra.
- **CORS en el bucket de R2**, que es lo que habilita el `PUT` desde el navegador.

**No entra:**

- **Transcodificar.** El `.mp4` se guarda tal cual. Convertir necesita ffmpeg, que no cabe
  en una funcion de 250 MB junto a `sharp`.
- **Un poster generado del video.** El poster ya es un campo y el cliente elige el
  fotograma mejor que un algoritmo.
- **Videos en otras paginas.** Solo la portada de la Home. La galeria de audiencias ya
  acepta YouTube (ADR-0031) y ese camino no se toca.
- **Subir prefirmado siempre.** Por debajo de 4 MB la funcion sigue siendo el camino: ahi
  `sharp` valida los bytes, rota por EXIF y genera la WebP. Eso no se regala.

## El layout

En el bloque **01 · Portada** del editor de Home, debajo del poster:

```
  Vídeo de la portada
  El vídeo de fondo del titular. MP4, hasta 32 MB. Sin vídeo, se ve sólo el póster.
  ┌────────────────────────────────┐
  │  ▶  hero-dojo.mp4 · 12,4 MB    │
  │       Cambiar vídeo            │
  └────────────────────────────────┘
```

Mismo contrato que `CampoImagen`: se toca el recuadro, se elige el archivo, **se sube al
elegir** y no se publica hasta guardar la pagina. Mientras sube, muestra el progreso real
—con un archivo de 30 MB hace falta— y no un cartel fijo.

## Diseño

```
navegador                     funcion                    R2
   │ 1. POST /medios/firmar ────►│ valida, firma
   │ ◄──── { url, urlPublica } ──│
   │ 2. PUT <url> (los bytes) ─────────────────────────────►│
   │ 3. el formulario guarda urlPublica
```

- La clave sigue saliendo del **hash del contenido**, calculado en el navegador con
  `crypto.subtle`: sube dos veces el mismo archivo y no se duplica nada.
- El `content-type` **va firmado**: R2 rechaza un `PUT` que declare otro.
- La firma es la de `r2.ts` (SigV4, ya probada contra los vectores de AWS en la spec 0030);
  lo nuevo es emitirla como **query prefirmada** en vez de como cabecera.
- `hero.video` es `z.url().nullable()`: vacio significa que la portada muestra solo el
  poster, que es un estado valido y no un error.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/r2.ts` | editar (URL prefirmada `PUT`) |
| `src/lib/medios.ts` | editar (validación por metadatos, límites por variante) |
| `src/pages/admin/medios/firmar.ts` | crear |
| `src/pages/admin/medios/subir.ts` | editar (mensaje legible al 413) |
| `src/components/admin/CampoImagen.astro` | editar (camino prefirmado y errores) |
| `src/components/admin/CampoVideo.astro` | crear |
| `src/components/admin/FormularioHome.astro` | editar (el campo de vídeo) |
| `src/lib/{forms,schemas}.ts` | editar (`hero.video`) |
| `src/components/HomeView.astro` | editar (fuera `HERO_VIDEO`) |
| `content/*/home.json` | editar (migración: el vídeo de hoy como valor inicial) |

### Disjunta?

**No** con la 0046: comparten `medios.ts`. **Sí** con la 0045 y la 0048. **Va antes que la
0046**, porque cambia cómo se sube y la otra sólo agrega una variante.

## Verificación

- [ ] `astro check` 0/0/0, tests sin regresiones, build 44 rutas.
- [ ] **Contra producción, que es donde están las claves de R2**: un archivo de **más de
      4,5 MB sube y queda servido** — el caso que hoy da `413`.
- [ ] Una imagen chica sigue yendo por la función y sale como WebP: el camino viejo intacto.
- [ ] Un `.mp4` de ~20 MB sube, se sirve con `content-type: video/mp4` y **se reproduce en
      la Home**, comprobado con captura de pantalla del hero.
- [ ] Un archivo de 40 MB → rechazado **antes** de subir, con el tamaño en el mensaje.
- [ ] Un PDF renombrado a `.mp4` → rechazado: el `content-type` firmado no coincide.
- [ ] Pedir una firma **sin cookie** → 302/401. Una URL prefirmada vencida → R2 rechaza.
- [ ] Vaciar el vídeo: la portada queda con el póster y **no hay `<video>` en el HTML**.
- [ ] Las 44 páginas comparadas con el vídeo de hoy puesto en el contenido: **sin
      diferencias** salvo el hero, que no es determinista (medido en la spec 0044).

## Abierto

**El CORS del bucket hay que actualizarlo el día del cambio de dominio** (ADR-0043): el
origen autorizado hoy es `dojo-da-luz.vercel.app` y pasará a ser `www.aikido-duran.com`. Si
se olvida, el backoffice deja de poder subir y el error se ve en la consola del navegador,
no en el servidor. Queda como paso del gate de lanzamiento.
