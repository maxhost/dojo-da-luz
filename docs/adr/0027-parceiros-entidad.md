---
adr: 0027
fecha: 2026-09-21
estado: aceptada
resumen: Los parceiros son una entidad compartida en `content/partners.json`, de largo libre, editable desde la seccion 06 del editor de Home con su propio formulario y su propio sha.
---

# 0027 — Los parceiros son una entidad, no una constante

## Contexto

Los ocho logos de parceiros de la Home viven en una constante `PARTNERS` dentro de
`src/components/HomeView.astro`. Sumar un parceiro es editar un componente: el cliente no
puede, y el backoffice —que ya edita el resto de la Home (specs 0021 y 0029)— no los ve.

Hay dos formas de darles un hogar editable y no son equivalentes:

1. **Dentro de `content/<locale>/home.json`**, como el resto de la Home.
2. **En un archivo propio compartido**, como los dojos (ADR-0017).

## Decision

**`content/partners.json`, compartido por los cuatro idiomas y de largo libre.**

Un logo no se traduce. Si los parceiros vivieran en `home.json`, el mismo logo estaria
cuatro veces y el editor —que publica **un idioma por POST**— obligaria al cliente a
cargarlo cuatro veces y a acertar las cuatro. La primera vez que se olvide de una, la Home
en frances muestra siete logos y la portuguesa ocho, sin que nada falle ni avise. Es el
mismo razonamiento del ADR-0017 para los dojos: **lo que no se traduce no se replica por
idioma**.

El `label` y el `title` de la seccion **si** son texto traducible y se quedan donde estan,
en `home.json`, editables por idioma como hasta ahora.

**Se edita desde la seccion 06 del editor de Home, en un formulario aparte.** Es donde el
cliente espera encontrarlo —es la seccion que esta mirando— pero es un `<form>` propio, con
su propio `sha` y su propio commit, fuera de las pestañas de idioma. Mezclarlo con el
formulario por idioma significaria un POST que escribe dos archivos con dos controles de
concurrencia distintos; separarlos cuesta una caja mas en la pantalla y nada mas.

**El largo es libre.** Sin minimo ni maximo: cero parceiros es una seccion que no se
pinta, y la rejilla del ADR-0024 —cinco por fila— acomoda cualquier cantidad porque el
salto de fila lo da el grid, no el numero.

## Consecuencias

- `HomeView.astro` deja de tener datos: lee `content/partners.json` y lo valida en el build,
  igual que `dojos.json`. Un JSON invalido rompe el build, no la produccion.
- El orden de la rejilla es el orden del archivo. No hay campo `orden`: mover un parceiro es
  moverlo de lugar en la lista, y la lista se ve entera en una pantalla.
- Cada logo guarda una `escala` opcional. Nace de un hecho: el logo "55+" se pinta hoy con
  `scale-[1.45]` porque el archivo trae mucho aire alrededor. Sin ese campo, mover los datos
  al JSON encogeria ese logo en la Home sin que nadie lo pidiera. Es un numero, no una clase
  de CSS: el editor no expone Tailwind (ADR-0026).
- Borrar un parceiro **no** borra su imagen de R2 (spec 0030: no se borra nada).
