---
adr: 0028
fecha: 2026-09-21
estado: aceptada
resumen: Las imagenes de la Home son compartidas por los cuatro idiomas en `content/media.json`; el texto alternativo y el pie siguen siendo por idioma, y el campo de imagen ofrece subir antes que pegar una direccion.
---

# 0028 — La imagen es una, el texto que la describe son cuatro

## Contexto

Las cinco imagenes de la Home —la portada del hero, las dos fotos de audiencia, la foto del
dojo y el retrato del profesor— viven en `content/<locale>/home.json`. El editor publica
**un idioma por POST**, asi que cambiar una foto son cuatro subidas y cuatro publicaciones.

Hoy las cinco URLs son identicas en los cuatro archivos. Eso no es una garantia: es el
estado inicial. La primera vez que alguien cambie tres de cuatro, la Home en frances va a
mostrar una foto distinta que la portuguesa, **sin que nada falle ni avise** — no hay
validacion que pueda detectarlo, porque cada archivo es valido por separado.

Es el mismo razonamiento del ADR-0017 (dojos) y del ADR-0027 (parceiros), aplicado a lo
ultimo que quedaba replicado por idioma.

## Decision

**La URL de la imagen es compartida; el texto que la describe, no.**

- `content/media.json` guarda las cinco direcciones, una sola vez para los cuatro idiomas.
- `photoAlt` y `photoCaption` **siguen en `home.json`**, por idioma. Describen la imagen para
  quien no la ve o la lee en su lengua: son texto, y el texto se traduce. Hoy tres de los
  cuatro estan efectivamente traducidos, asi que compartirlos seria perder trabajo hecho.

**Se editan en un bloque propio**, "Imágenes de la portada", fuera de las pestañas de idioma
y con su propio `sha`, igual que las parcerias. En la seccion de cada idioma, donde estaba el
campo, queda la miniatura y una linea que dice donde se cambia: el pie y el texto alternativo
se siguen escribiendo al lado de la foto que describen.

**Y el campo de imagen ofrece subir primero.** Hasta ahora mostraba un campo de direccion a
ancho completo y, debajo, un selector de archivo chico. El cliente no tiene de donde sacar
una direccion —ese fue el problema que abrio la spec 0030— asi que el orden estaba al reves:
**subir un archivo, elegir de la galeria, y recien despues pegar una direccion**, esta ultima
plegada en un `<details>`.

## Consecuencias

- `homeSchema` pierde cinco campos y gana un archivo hermano. La migracion es sin perdida
  porque las veinte URLs (cinco x cuatro idiomas) son hoy la misma cinco veces repetida.
- El HTML publicado de las cuatro homes no cambia **ni un byte**: es la forma de comprobar
  que la migracion no perdio nada.
- Una imagen que se cambia vale para los cuatro idiomas desde el mismo commit. No existe el
  estado "cambiada en tres de cuatro".
- El `<details>` con la direccion a mano nace **abierto** en el HTML y lo pliega el
  JavaScript. Sin JavaScript el campo sigue siendo el de siempre: un input de texto visible.
