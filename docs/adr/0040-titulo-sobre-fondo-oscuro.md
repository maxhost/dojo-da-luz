---
adr: 0040
fecha: 2026-09-21
estado: aceptada
resumen: Un .section-title dentro de una seccion con text-white hereda el color de la seccion; el color oscuro deja de estar clavado en la clase y el titulo invisible deja de poder repetirse.
---

# 0040 — Un titulo sobre fondo oscuro hereda el color

## Contexto

`.section-title` fija `color: #211f1c` — casi negro. Sirve para las quince secciones claras
del sitio y **es invisible en las cuatro oscuras** (`bg-[#27231f]`), donde el titulo queda
a un 2% de contraste contra su propio fondo.

Tres de las cuatro lo compensan a mano escribiendo `text-white` en el `<h2>`. La cuarta no:
**"Percurso", en `/professor-pablo-duran`, estaba escrito y no se leia**. Lo encontro el
cliente mirando la pagina publica, no el CSS.

Esto es el caso de la regla de `CLAUDE.md`: *que el CSS este limpio no prueba que la pagina
se vea limpia*. Aca ademas el CSS estaba limpio **y era la causa**: el defecto es que una
clase de tipografia decida tambien el color, y que la unica defensa sea acordarse de
anularla en cada uso.

## Decision

**El color del titulo lo decide la seccion, no la clase.** Una linea en `global.css`:

```css
.text-white .section-title { color: inherit; }
```

Dentro de cualquier seccion pintada con `text-white`, el titulo hereda el blanco del
contenedor. El color oscuro se conserva para el resto, que es el caso normal.

Se elige esto y **no** añadir `text-white` al `<h2>` de Percurso porque arreglar el caso no
arregla la clase de casos: la proxima seccion oscura vuelve a nacer con el titulo invisible
y nadie lo va a ver hasta que este en produccion. Esto es un `mistake→rule` estructural: no
hay nada que recordar.

## Consecuencias

- **"Percurso" se lee**, en los cuatro idiomas, sin tocar el componente.
- Los tres `text-white` que ya estan escritos en `HomeView` y `ClassesView` quedan
  redundantes y **se dejan**: siguen dando el mismo color y borrarlos es diff sin beneficio.
- El HTML construido de las 44 paginas **no cambia**: el unico archivo distinto es el CSS.
  Es lo que hace la verificacion barata.
- Depende del nombre de una utilidad de Tailwind (`text-white`) escrito a mano en el CSS del
  proyecto. Es el acoplamiento aceptado: es la clase con la que el sitio ya declara "esta
  seccion es oscura" en los cuatro lugares donde lo hace.
- Si algun dia hace falta un titulo oscuro dentro de una seccion clara anidada en una
  oscura, se escribe su color en el `<h2>`: una utilidad en el elemento gana igual, porque
  la capa `utilities` va despues de `components`.
