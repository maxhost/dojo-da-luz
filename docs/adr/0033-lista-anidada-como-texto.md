---
adr: 0033
fecha: 2026-09-21
estado: aceptada
resumen: Una lista que vive dentro de una fila de otra lista se edita como un recuadro de texto con un renglon por elemento, no como una tabla dentro de otra tabla. Las listas de primer nivel siguen siendo tablas.
---

# 0033 — Una lista anidada se edita como texto

## Contexto

El cliente pidio una sola cosa de la interfaz del backoffice, y la pidio tres veces:
*"es una tablita con un quitar, añadir fila. Es simple."* Sobre eso se construyeron los
editores de `/aulas` (spec 0035) y de Adultos y Criancas (spec 0036): una fila por cosa, un
"quitar" por fila, un "añadir" abajo.

`/aikido` trae una forma que esos dos no tenian: **cada seccion numerada contiene su propia
lista de parrafos**. La regla "una tablita por lista" aplicada al pie da una tabla de
secciones donde cada fila contiene otra tabla con sus propios "añadir" y "quitar". Con seis
secciones de dos parrafos son siete tablas, catorce filas y veintiun botones en una sola
pantalla.

El mismo problema va a volver: `dojo.json` tiene el linaje, y `other-arts.json` tiene
disciplinas con parrafos adentro.

## Decision

**Una lista de primer nivel es una tabla. Una lista anidada es un recuadro de texto con un
renglon por elemento.**

- Los parrafos de una seccion de `/aikido` se editan en un solo `textarea`, un parrafo por
  linea, con la etiqueta diciendolo.
- Los parrafos del bloque O-Sensei —que no estan anidados— siguen en su tablita.
- El parseo ya existe: `lineas()` en `forms.ts` corta por `\n`, recorta y descarta vacias.

El limite es **un solo nivel de anidamiento**. Si aparece una lista dentro de una lista
dentro de una lista, el problema no es la interfaz: es el modelo de contenido.

## Consecuencias

- Se pierde el "quitar" por parrafo: quitar un parrafo es borrar su renglon. Es lo que hace
  cualquiera en un campo de texto, y es menos que el costo de catorce botones mas.
- **Un parrafo no puede tener un salto de linea adentro.** No los tiene hoy —son parrafos de
  prosa— y el HTML los pinta como `<p>` separados igual.
- Una linea en blanco de mas no rompe nada: se descarta al guardar.
- Es una excepcion declarada, no una deriva: cada vez que se use hay que poder decir "esta
  lista esta adentro de otra". Las de primer nivel que se editen como texto —el caso que ya
  existe en el editor de Home, con sus textarea de "una linea por renglon"— siguen siendo
  deuda a convertir en tablas, no precedente.
