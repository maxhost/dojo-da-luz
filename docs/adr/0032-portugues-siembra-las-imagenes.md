---
adr: 0032
fecha: 2026-09-21
estado: aceptada
resumen: En las paginas de audiencia la imagen viaja dentro del contenido de cada idioma y portugues la siembra a los otros tres al publicar; solo se puede cambiar desde la pestaña portuguesa. Supersede, para las listas de largo libre, la regla del ADR-0028 de sacar toda imagen a un archivo compartido.
---

# 0032 — Portugues siembra las imagenes

## Contexto

El ADR-0028 saco las imagenes de la Home a `content/media.json`, compartido por los cuatro
idiomas, para que no exista el estado **"cambiada en tres idiomas de cuatro"**, que ninguna
validacion puede ver. Funciona porque las imagenes de la Home son **cinco, fijas y con
nombre**: `heroPoster`, `dojoPhoto`, `teacherPhoto`…

La galeria de las paginas de audiencia no es eso. Es una lista de largo libre (ADR-0031) y
cada medio lleva ademas un texto que **si** se traduce: la descripcion que leen los
lectores de pantalla y Google. Sacar solo la imagen al archivo compartido deja la lista
partida en dos —los `src` en un archivo sin idioma, las descripciones en los cuatro— y con
una invariante nueva que nadie valida: **que las dos listas tengan el mismo largo**. Es
cambiar un modo de falla invisible por otro.

El cliente pidio otra cosa, y es la que ya entendio del editor de `/aulas`: *"portugues
siembra todos los lenguajes, las imagenes son las mismas, luego el admin traduce en cada
pestaña el contenido"*.

## Decision

**La imagen viaja dentro del contenido de cada idioma, y portugues la siembra.**

- `photo` y los medios de la galeria siguen en `content/<idioma>/adults.json` y
  `children.json`, al lado de la descripcion que les corresponde.
- **Son campos sembrados**: al publicar portugues se copian a los otros tres archivos
  *siempre*, no solo cuando la fila es nueva. Es la diferencia con el ADR-0030, donde una
  fila existente no se toca: ahi el texto es del traductor, aca la imagen no es de nadie.
- **Solo se pueden cambiar desde la pestaña portuguesa.** En es/fr/en la miniatura se ve
  —hace falta para escribir la descripcion— pero no se puede cambiar, igual que no se
  puede agregar ni quitar una fila.
- Lo que si se edita en cada pestaña es el texto: `photoAlt` y la descripcion de cada medio.

En una linea: **la misma foto en los cuatro idiomas, garantizada por la publicacion y no
por la disciplina del que edita.**

## Consecuencias

- La URL de cada imagen queda **repetida cuatro veces** en el repo. Es redundancia real y
  es el precio de no partir la lista en dos archivos con un largo que nadie compara.
- El estado "cambiada en tres de cuatro" sigue siendo imposible **mientras la imagen solo
  se pueda cambiar en portugues**. Esa restriccion de la interfaz no es cosmetica: es lo
  que sostiene la garantia. Un campo de imagen habilitado por error en la pestaña francesa
  la rompe en silencio.
- `content/media.json` no crece: la portada de Adultos y la de Criancas **no** entran ahi.
  Las cinco claves que ya tiene siguen siendo las de la Home y `/aulas`, donde la imagen es
  fija y con nombre; el ADR-0028 sigue vigente para ese caso.
- Publicar portugues escribe los cuatro archivos en un commit, que es lo que ya hace el
  editor de `/aulas` (ADR-0030). No hace falta un segundo commit para las imagenes ni el
  `sha` de un archivo compartido.
- Cambiar una foto desde el backoffice exige pasar por la pestaña portuguesa. Es un paso
  mas para quien esta traduciendo, y es visible: el campo aparece deshabilitado con el
  motivo escrito, no ausente.
