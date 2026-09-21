---
spec: 0033
fecha: 2026-09-21
estado: cerrada
resumen: El editor queda con un campo por cosa: la imagen se cambia tocando su miniatura en la seccion donde se ve, el bloque "Imágenes de la portada" desaparece y un parceiro vuelve a ser solo un logo.
disjunta: si
archivos: src/components/admin/{CampoImagen,FormularioHome,EditorParcerias}.astro, src/components/admin/{EditorMedios,ImagenCompartida}.astro (borrar), src/lib/{forms,media-edicion,partners}.ts, src/pages/admin/paginas/home.astro
---

# 0033 — Un campo por cosa

## Problema

El cliente abrio el editor y encontro tres cosas que no se explican solas:

1. Una seccion al final, "Imágenes de la portada", con un parrafo explicando por que existe.
   Para cambiar la foto de "04 · O dojo" hay que salir de esa seccion, bajar, adivinar cual
   de cinco es y volver.
2. Cada logo de parcerias pide **nombre** y **ampliacion**. Un logo es una imagen.
3. La miniatura de cada foto se ve pero no se toca. No hay ningun boton que diga "cambiar
   esta imagen": hay un selector de archivo suelto y, plegada, una direccion para pegar.

Lo que el editor tiene que ser: inputs de texto que cambian textos, e imagenes que se
cambian tocandolas.

## Alcance

**Entra:**

- `CampoImagen` se rehace: **la miniatura es el boton**. Tocarla abre el selector de
  archivos; mientras sube se ve la imagen elegida; cuando termina, la definitiva. Debajo,
  una linea que dice que no se publica hasta guardar.
- Las cinco imagenes vuelven a su seccion en `FormularioHome`, al lado del texto alternativo
  y del pie que las describen.
- **Se borran `EditorMedios.astro` e `ImagenCompartida.astro`.**
- El POST de un idioma publica tambien `content/media.json` si alguna imagen cambio. Dos
  `sha`, dos commits, un solo boton.
- En parcerias: cada fila es **un logo y un "quitar"**. El nombre y la ampliacion viajan
  ocultos con la fila y se conservan.
- Sin JavaScript el campo degrada a la direccion escrita a mano, que es lo que ya era.

**No entra:**

- Reordenar imagenes o parceiros arrastrando.
- Recortar o editar la imagen en el navegador.
- Subir al publicar en vez de al elegir. El archivo se sube a R2 al elegirlo —es lo que
  permite ver la miniatura definitiva antes de guardar— y **el sitio no cambia hasta que se
  publica**. Si el cliente se arrepiente, queda un objeto sin usar en el bucket: centimos.

## Diseño

**La miniatura es un `<button>` que contiene la `<img>`.** El `<input type="file">` queda
fuera de la vista y lo dispara el boton. Sin JavaScript el boton no se pinta y queda el
`<details>` con la direccion, abierto.

**Previa inmediata con `URL.createObjectURL`.** Entre elegir el archivo y que R2 responda
pasan unos segundos; durante esos segundos se ve la imagen elegida, no un cartel. Al
terminar se reemplaza por la URL publica y se libera el objeto.

**Dos archivos, un boton.** El formulario del idioma lleva los dos `sha` —el de `home.json`
y el de `media.json`—. Al publicar: si las imagenes cambiaron se escribe `media.json`
primero, y despues `home.json` si cambio. Si el primero falla no se escribe el segundo y se
dice que no se publico nada.

**Un parceiro es un logo.** `nombre` y `escala` pasan a `<input type="hidden">`. Un parceiro
nuevo nace con el texto alternativo generico "Parceiro do Dojo da Luz". Quitar es un
checkbox: sin JavaScript tambien funciona, y no es un boton que se aprieta sin querer.

## Archivos

| Archivo | Accion |
|---|---|
| `src/components/admin/CampoImagen.astro` | editar — la miniatura es el boton |
| `src/components/admin/FormularioHome.astro` | editar — las imagenes vuelven a su seccion |
| `src/components/admin/EditorParcerias.astro` | editar — un logo y un quitar |
| `src/components/admin/EditorMedios.astro` | **borrar** |
| `src/components/admin/ImagenCompartida.astro` | **borrar** |
| `src/lib/forms.ts` | editar — leer las imagenes del formulario del idioma |
| `src/lib/media-edicion.ts` | editar — publicar solo si cambio |
| `src/pages/admin/paginas/home.astro` | editar — un POST, dos archivos |
| `src/lib/partners.ts` | editar — `nombre` con valor por defecto |

### Disjunta?

**Si.** Nadie mas esta tocando el backoffice; las specs 0030, 0031 y 0032 estan
implementadas y esta las corrige.

## Verificacion

Hecho:

- [x] `astro check` 0/0/0, `npm test` **24/24** y `npm run build` con las 44 rutas.
- [x] **El sitio publico no se toco**: las cuatro homes construidas difieren de las de antes
      en una sola cadena, el hash del CSS. Esta spec es del editor.
- [x] En el arbol no queda ni una mencion a `ImagenCompartida`, `EditorMedios` ni "Imágenes
      de la portada" fuera de los ADR y las specs que cuentan la historia.
- [x] En el editor compilado: existe el boton `data-abrir` con "Cambiar imagen" / "Subir
      imagen", el `input type="file"` esta en `sr-only`, y el checkbox
      `parceiros[i].quitar` acompaña a cada logo existente.
- [x] Tildar "quitar" saca esa fila y no corre a las demas; una fila sin logo no se publica
      aunque traiga nombre; el nombre oculto sobrevive a cambiar el logo; y uno nuevo nace
      con "Parceiro do Dojo da Luz".
- [x] **Publicar sin tocar las imagenes no escribe `media.json`**: el ciclo formulario →
      schema → JSON devuelve el archivo byte a byte igual al que esta en disco, que es lo
      que hace que el editor no genere un commit.

Pendiente, necesita una sesion del backoffice:

- [ ] Tocar la miniatura abre el selector, se ve la foto elegida mientras sube y la
      definitiva al terminar.
- [ ] Guardar un idioma con una foto nueva deja dos commits —`media.json` y el `home.json`
      del idioma— y la foto cambia en los cuatro.

## Abierto

- Sigue sin poder probarse en el BO sin una sesion. Todo lo que se pueda cubrir con tests o
  mirando el HTML generado, se cubre.
