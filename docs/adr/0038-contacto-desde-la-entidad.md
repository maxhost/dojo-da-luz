---
adr: 0038
fecha: 2026-09-21
estado: aceptada
resumen: Las sedes de /contactos salen de la entidad de dojos, no de contact.venues; lo unico que queda en el contenido traducible es como se llega a cada una, indexado por el slug del dojo. Completa la migracion que la spec 0034 dejo a medias.
---

# 0038 — Las sedes de /contactos salen de la entidad

## Contexto

`/contactos` pinta **tres tarjetas de sede** desde `contact.venues`, un array repetido en los
cuatro idiomas. La entidad de dojos (ADR-0017) es la fuente de verdad de las sedes desde
hace tres specs, y `/aulas` ya la lee (spec 0034): archivar un dojo lo saca de esa pagina.

`/contactos` se quedo atras, y se nota:

- **Encarnação cerro** y su dojo esta `archivado` en la entidad. No aparece en `/aulas` ni
  en la Home. **Sigue apareciendo en `/contactos`**, con su metro y sus diez minutos a pie.
- Cada alta o baja de sede hay que hacerla **cinco veces**: la ficha del dojo y los cuatro
  `contact.json`.

Pero `venues` no es solo estructura: trae **como se llega** —*"Autocarros 716, 729, 746 e
758"*, *"Metro Ameixoeira · linha amarela"*— y eso **esta traducido** a los cuatro idiomas
(`Autobuses` en español, `Autocarros` en portugues). La entidad de dojos es deliberadamente
**sin traducir** (ADR-0017: los dias y las horas se guardan una vez y se traduce como se
leen). Meter la prosa del transporte ahi seria publicar portugues en las cuatro paginas.

## Decision

**La entidad manda que sedes hay; el contenido traducible dice como se llega.**

- `contact.venues` **desaparece**. Las tarjetas salen de `getDojos()`: el antetitulo es
  `nombre` y el titulo es `dojo`, los mismos campos que ya usa `/aulas`.
- En su lugar, `contact.json` gana **`transport`, un mapa indexado por el `slug` del dojo**
  con las lineas de como llegar, una por renglon y traducidas:
  `{"benfica": ["Igreja de Benfica", "Autocarros 716, 729, 746 e 758"], …}`.
- **El editor de `/contactos` no edita dojos.** Muestra un recuadro por dojo **activo**, con
  su nombre como rotulo que no se puede tocar, y dentro solo las lineas de transporte. Dar
  de alta, archivar, renombrar o reordenar una sede se hace donde siempre: en **Dojos**.
- Un dojo sin lineas de transporte **se pinta igual**, solo que sin la lista. Un dojo nuevo
  aparece en la pagina el dia que se crea y sus lineas se escriben despues, no antes.

## Consecuencias

- **Encarnação desaparece de `/contactos`** en los cuatro idiomas, sin tocar contenido: es
  la consecuencia de estar archivado, que es lo que se buscaba. La pagina pasa de tres
  tarjetas a dos.
- Completa la fila 6f de TASKS: `/aulas` y `/contactos` leen los dos la entidad.
- El mapa se indexa por `slug` y no por posicion a proposito: reordenar los dojos no
  desalinea las lineas de transporte, que es el costo que si paga la propagacion de listas
  del ADR-0030.
- Una clave huerfana —de un dojo borrado— no rompe nada: la vista solo lee las de los dojos
  activos. Queda como basura en el JSON, y es preferible a que borrar un dojo pueda hacer
  fallar el build de las cuatro paginas.
- **Lo que el `seo.description` de `/contactos` dice sobre Encarnação no lo arregla esta
  decision**: sigue nombrando las tres zonas, igual que el pie de las ocho paginas. Es texto
  y ahora tiene editor; lo corrige el cliente.
