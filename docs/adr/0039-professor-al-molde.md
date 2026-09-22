---
adr: 0039
fecha: 2026-09-21
estado: aceptada
resumen: /professor entra al molde de los ocho editores: los cinco textos del borde pasan al contenido y sus cinco listas —Percurso incluido— son de largo libre con portugues dueño de la estructura.
---

# 0039 — `/professor` entra al molde

## Contexto

`/professor-pablo-duran` es la **ultima pagina de contenido del sitio sin editor**. Es la
unica que quedo afuera del recorrido de las specs 0035 a 0042, y arrastra las dos cosas que
todas las demas ya resolvieron:

1. **Los cinco textos del borde estan escritos dentro de `TeacherView.astro`** (el objeto
   `ui`, cuatro idiomas a mano), y el pie de la pagina dice `Benfica · Lumiar · Encarnação`
   en una linea literal del componente. Son exactamente los mismos valores que ya viven en
   `chrome` de las otras diez paginas — comprobado clave por clave.
2. **`teacher.json` no tiene `chrome`**: es el unico de los once archivos de contenido de
   cada idioma al que le falta.

Y arrastra una tercera propia: **Percurso son seis hitos escritos en el JSON**. Un hito
nuevo —un grado, un viaje, una apertura— hoy es un commit a mano en cuatro archivos.

## Decision

**La pagina entra al molde de la spec 0037 sin excepciones**, y todas sus listas son de
largo libre con portugues dueño de la estructura (ADR-0030):

- `teacherSchema` gana `chrome` en segunda posicion, como las otras diez. `TeacherView`
  pierde el objeto `ui` y el pie literal.
- **`milestones` (Percurso) es de largo libre**: se añaden y se quitan hitos desde la
  pestaña portuguesa y aparecen en los cuatro idiomas para traducir. Cada hito es
  `{ year, title, text }` — tres campos, ni uno mas: el año es texto libre porque hoy hay
  un `2002` y un `2009–2015`, y un campo de fecha no sabe escribir eso.
- **Los parrafos tambien**: `biography`, `formation` y `teaching` son tablas de una columna,
  como en `/escolas` y `/dojo`.
- **El linaje tambien**, y aca se separa de `/dojo`: alla son tres cajas fijas (ADR-0034)
  porque son tres nombres historicos; aca la rejilla es `md:grid-cols-3` y **acomoda sola**
  las que haya, asi que congelar el largo seria una regla sin motivo. Queda con `.min(1)`,
  que es lo que ya tenia.
- **La foto es una sola** —el retrato de la portada— y la siembra el portugues (ADR-0032).

## Consecuencias

- **Todas las paginas de contenido del sitio tienen editor.** Se cierra el recorrido que
  abrio la spec 0035.
- El HTML construido de las cuatro paginas de `/professor` **no cambia** con la migracion
  de `chrome`: los valores que se mueven al contenido son los que el componente ya escribia.
  Es la señal que verifica que la migracion fue solo de lugar.
- `content/*/teacher.json` se reescribe entero una vez, al orden canonico del schema y con
  dos espacios de sangria (ADR-0025). Es preferible a que lo haga el primer guardado del
  cliente y le aparezca un diff de cien lineas por cambiar una coma.
- El `JSON-LD` de `Person` sigue con `name: 'Pablo Durán'` y `knowsAbout` escritos en el
  componente. **No se editan**: no son texto de la pagina sino datos para los buscadores, y
  el dia que el profesor de la pagina no sea Pablo el cambio es de ruta, no de campo.
