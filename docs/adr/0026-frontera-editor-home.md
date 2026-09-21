---
fecha: 2026-09-21
resumen: El backoffice edita contenido, no estructura: el menú de la Home deja de ser editable, y a cambio las tarjetas de audiencia y los medios de la Home pasan a ser contenido propio de la portada, editables y con su campo en el schema.
---

# ADR-0026 — Qué edita el backoffice de la Home y qué no

## Estado

Aceptada.

## Contexto

La spec 0021 puso en el editor de Home *todos* los campos de `homeSchema`, sin preguntarse
si cada uno tiene sentido en manos del cliente. Al verlo funcionando aparecen tres cosas
mal repartidas.

**El menú está editable y no debería.** `chrome.nav` son los cuatro enlaces de la barra, y
sus destinos son anclas de la propia página (`#montanha`, `#terra`, `#dojo`, `#umbral`).
El schema solo exige que `href` sea un string no vacío: escribir `#terra ` con un espacio,
o `#tera`, produce un menú que no lleva a ninguna parte y ni el build ni el editor lo
frenan. No es contenido: es el cableado de la página.

**Las tarjetas de audiencia no tienen contenido propio.** La sección `02 · Audiencias` de
la Home pinta dos tarjetas con foto, título y bajada, pero los toma de
`content/*/adults.json` y `content/*/children.json` — los mismos campos que usan los heroes
de `/aulas/adultos` y `/aulas/criancas`. Cambiar la foto de la tarjeta de la portada cambia
también la cabecera de la landing, y al revés. Hoy eso no se puede ni intentar: esos
archivos están fuera del editor.

**Dos imágenes de la Home son constantes de código.** `DOJO_PHOTO` y `TEACHER_PHOTO` viven
como `const` en `src/components/HomeView.astro`, con una URL de `static.wixstatic.com`
cada una. No hay forma de cambiarlas sin tocar el repo, que es justo lo que el backoffice
existe para evitar. `DOJO_PHOTO` además hace doble trabajo: es también el `poster` del
vídeo del hero.

## Decisión

**El editor edita contenido; la estructura se queda en el repo.** La línea es si el campo
responde a "qué dice la página" (contenido, editable) o a "cómo está armada la página"
(estructura, código).

Por esa línea:

- **`chrome.nav` sale del editor.** Sigue en el schema y en el JSON, pero el formulario no
  lo pinta y al guardar se conserva el valor publicado. Cambiar el menú vuelve a ser un
  cambio de repo, que es lo que era antes de la 0021.
- **Las tarjetas de audiencia pasan a ser contenido propio de la Home.** `audiences` gana
  `adults` y `children`, cada uno con `photo`, `photoAlt`, `title` y `lead`. Se siembran
  con los valores que hoy heredan, así la portada no cambia al migrar.
- **Los medios de la Home pasan al schema**: `hero.poster`, `dojo.photo` y
  `dojo.teacher.photo`. `HomeView.astro` deja de tener URLs propias.

Para que lo no editable sobreviva sin depender de que alguien se acuerde de copiarlo, el
constructor del formulario parte del **contenido ya publicado** y sobrescribe encima solo
lo que el formulario manda. Un campo que no está en el formulario se conserva por
construcción, no por atención.

## Consecuencias

- La portada y las landings dejan de compartir foto y texto. Es duplicación: la misma frase
  puede estar en `home.json` y en `adults.json`, y actualizarla en un sitio no la actualiza
  en el otro. Se acepta a cambio de que editar la portada no tenga efectos a distancia —
  que es el modo de falla peor, porque es invisible desde donde se edita.
- El cliente puede cambiar las fotos de la Home, que era imposible. Hasta la spec 0030 el
  campo es una URL escrita a mano: sirve para apuntar a otra imagen que ya exista, no para
  subir una nueva.
- Separar `hero.poster` de `dojo.photo` permite que dejen de ser la misma imagen. Hoy lo
  son; a partir de ahora es una decisión, no un efecto de haber reusado una constante.
- El menú vuelve a necesitar un despliegue para cambiar. Con cuatro anclas fijas, es el
  compromiso correcto: se cambia una vez por rediseño, no una vez por semana.
- Añadir un campo al schema sin añadirlo al formulario ya no lo pone en riesgo. Eso abre la
  puerta a campos que el build necesita y el cliente no debería ver.
