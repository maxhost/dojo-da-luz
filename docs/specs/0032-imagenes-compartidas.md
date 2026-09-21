---
spec: 0032
fecha: 2026-09-21
estado: cerrada
resumen: Las cinco imagenes de la Home salen de los cuatro `home.json` y pasan a `content/media.json`, editables una sola vez; el campo de imagen pone subir primero y la direccion a mano al final.
disjunta: si
archivos: content/media.json, content/*/home.json, src/lib/{media,media-edicion,content,forms}.ts, src/components/HomeView.astro, src/components/admin/{CampoImagen,ImagenCompartida,EditorMedios,FormularioHome}.astro, src/pages/admin/paginas/home.astro
---

# 0032 — Una imagen, cuatro idiomas

## Problema

Dos cosas que el cliente noto mirando el editor.

**La primera: pide una direccion.** El campo de imagen muestra un input de URL a ancho
completo y, debajo y mas chico, un selector de archivo. El cliente no tiene de donde sacar
una direccion —ese es justamente el problema que abrio la spec 0030— asi que el campo se lee
como "pegá una URL" cuando lo que tiene que decir es "subí una foto". Peor: hasta el arreglo
de la jurisdiccion de R2 de hoy, el boton de subir estaba pero fallaba, lo cual enseña a
ignorarlo.

**La segunda: la misma foto, cuatro veces.** Las cinco imagenes de la Home estan en
`content/<locale>/home.json` y el editor publica un idioma por POST. Cambiar la foto del
dojo son cuatro subidas y cuatro publicaciones, y basta olvidarse de una para que la Home en
frances muestre otra cosa que la portuguesa **sin que nada falle ni avise**.

## Alcance

**Entra:**

- `content/media.json`: las cinco direcciones, compartidas por los cuatro idiomas
  (ADR-0028). Se migran tal cual: hoy las cinco son identicas en los cuatro archivos.
- `src/lib/media.ts` y `src/lib/media-edicion.ts`: schema validado en el build, y la
  publicacion con `sha` propio.
- Los cinco campos salen de `homeSchema` y de los cuatro `content/*/home.json`.
- `EditorMedios.astro`: el bloque "Imágenes de la portada", una sola vez, fuera de las
  pestañas de idioma.
- `ImagenCompartida.astro`: en la seccion de cada idioma queda la miniatura y la linea que
  dice donde se cambia. El texto alternativo y el pie **siguen ahi**, al lado de la foto que
  describen.
- `CampoImagen.astro` da vuelta el orden: subir un archivo primero, la galeria al lado, y la
  direccion a mano plegada en un `<details>`.

**No entra:**

- **Compartir `photoAlt` y `photoCaption`.** Son texto y estan traducidos: compartirlos
  seria perder trabajo hecho (ADR-0028).
- Las imagenes de las otras paginas (Adultos, Crianças, Dojo, Professor). Esta spec es la
  Home; el patron queda listo para replicarse cuando esas paginas entren al editor.
- Borrar de R2 lo que deje de usarse (spec 0030: no se borra nada).
- Recorte o edicion de la imagen.

## Diseño

**Un archivo plano, con una clave por uso.** `media.json` es un objeto de cinco claves
—`heroPoster`, `adultsPhoto`, `childrenPhoto`, `dojoPhoto`, `teacherPhoto`— y no un espejo
del arbol de `home.json`. El nombre dice para que se usa la imagen, que es lo que necesita
leer quien la cambia; la estructura de la Home ya no la decide el contenido.

**El `alt` no se mueve.** La consecuencia practica: en la seccion "04 · O dojo" de cada
idioma se sigue escribiendo el pie y el texto alternativo, con la miniatura al lado para
saber que se esta describiendo; la foto se cambia una sola vez, abajo.

**El `<details>` de la direccion nace abierto.** Sin JavaScript el campo tiene que seguir
sirviendo: se pliega desde el script, que es el mismo que revela el selector de archivo. Lo
que hoy esta `hidden` y se revela, y lo que nace abierto y se pliega, son la misma decision
—**el HTML sin JavaScript es el que funciona**— aplicada en las dos direcciones.

**Publicacion igual que parcerias.** `formulario=medios`, su propio `sha`, su propio commit,
el mismo control de concurrencia. Tres formularios conviven en la pagina: el del idioma
activo, el de parcerias y el de medios.

## Archivos

| Archivo | Accion |
|---|---|
| `content/media.json` | crear — las cinco direcciones migradas |
| `content/{pt,es,fr,en}/home.json` | editar — sacar los cinco campos de imagen |
| `src/lib/media.ts` | crear — schema y lectura validada |
| `src/lib/media-edicion.ts` | crear — publicar con `sha` |
| `src/lib/content.ts` | editar — `homeSchema` pierde los cinco campos |
| `src/lib/forms.ts` | editar — `homeDesdeForm` deja de leerlos; se agrega el de medios |
| `src/components/HomeView.astro` | editar — las imagenes salen de `media.json` |
| `src/components/admin/CampoImagen.astro` | editar — subir primero, URL al final |
| `src/components/admin/ImagenCompartida.astro` | crear — miniatura y adonde se cambia |
| `src/components/admin/EditorMedios.astro` | crear — el bloque compartido |
| `src/components/admin/FormularioHome.astro` | editar — cambia los cinco campos por la miniatura |
| `src/pages/admin/paginas/home.astro` | editar — atiende el POST de medios |

### Disjunta?

**Si.** La 0031 quedo implementada en el commit anterior y la 0030 no comparte archivos con
esta salvo `CampoImagen.astro`, que ya esta implementado: el cambio de orden es compatible y
no hay nadie editandolo en paralelo.

## Verificacion

Hecho:

- [x] `astro check` 0/0/0, `npm test` **21/21** (4 nuevos) y `npm run build` con las 44 rutas.
- [x] **Las cuatro homes construidas son identicas a las de antes de la migracion salvo una
      cosa: el hash del CSS** (`Base.Bsm3mvvD.css` → `Base.Bllic2XS.css`). El diff completo
      de cada archivo es esa unica cadena de siete caracteres: el marcado, las cinco
      direcciones de imagen y todo el texto quedaron igual. El hash cambia porque Tailwind
      suma al CSS global las clases de los componentes nuevos del backoffice.
- [x] La migracion es sin perdida y esta comprobado, no supuesto: el script que movio los
      campos **exige que las cuatro URLs de cada imagen sean identicas** y aborta si no lo
      son. Las cinco lo eran.
- [x] Los cuatro `home.json` perdieron exactamente cinco campos cada uno y conservan
      `photoAlt` y `photoCaption`, que estan traducidos.
- [x] `mediaDesdeForm` lee las cinco claves y ninguna mas —un `dojo.photo` viejo en el
      formulario se ignora—; una imagen vacia o una direccion invalida fallan con la ruta de
      su propio campo en vez de publicar una portada sin foto.
- [x] El `media.json` que el build lee hoy pasa su propio schema (test).
- [x] En `astro dev`: la portada responde 200 con sus trece imagenes, y
      `/admin/paginas/home` sigue redirigiendo a `/admin/entrar` sin sesion.

Pendiente, necesita una sesion del backoffice:

- [ ] Subir una foto en el bloque compartido cambia la Home en los cuatro idiomas con un
      solo commit.
- [ ] El campo de imagen muestra primero el selector de archivo y la direccion plegada, y sin
      JavaScript muestra la direccion abierta.

## Abierto

- **La prueba en el BO sigue necesitando una sesion** (igual que la 0031). El camino de
  datos se cubre con tests; apretar el boton queda para quien tenga la contraseña.
- Cuando las otras paginas entren al editor, van a necesitar lo mismo. `media.json` esta
  pensado para crecer con claves nuevas, no para que aparezca un archivo por pagina.
