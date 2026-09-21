---
adr: 0030
fecha: 2026-09-21
estado: aceptada
resumen: Portugues es el dueño de la estructura de las listas editables: el alta y la baja de filas solo ocurren en PT y se propagan a los cuatro idiomas; es/fr/en solo traducen lo que ya existe.
---

# 0030 — Portugues es el dueño de la estructura

## Contexto

El editor de Home publica **un idioma por POST** (spec 0021). Eso funciona mientras los
campos son fijos: `hero.title` existe en los cuatro archivos y editar el frances no puede
hacer que el portugues deje de tener titular.

Con listas de largo libre —cuotas, preguntas frecuentes, datos de una ficha— deja de
funcionar. Si cada pestaña puede agregar y quitar filas, los cuatro `classes.json` derivan:
ocho cuotas en portugues, siete en frances, nueve en ingles. Ninguna validacion puede ver
eso, porque **cada archivo es valido por separado** — es exactamente el modo de falla que
ya obligo a mover las imagenes a un archivo compartido (ADR-0028), pero ahora sobre datos
que si estan traducidos y por lo tanto no se pueden compartir.

Las dos salidas conocidas no sirven:

- **Compartir la lista** (como `partners.json`): imposible, el contenido es texto traducido.
- **Dejar que cada idioma haga lo suyo**: es la deriva silenciosa de arriba.

## Decision

**La estructura de una lista vive en portugues. La traduccion vive en cada idioma.**

- Agregar o quitar filas **solo se puede en la pestaña de portugues**. Las pestañas
  es/fr/en muestran los campos de texto de las filas que existen, sin "añadir" ni "quitar".
- **Publicar portugues escribe los cuatro archivos en un solo commit.** El portugues
  completo; en los otros tres, solo el alta y la baja de filas. Una fila nueva nace con el
  **texto portugues copiado** como marcador. Los textos ya traducidos no se tocan.
- Publicar es/fr/en escribe **solo ese archivo**, como hasta hoy.
- Una fila cuyo texto es todavia identico al portugues se marca en el BO como **"sin
  traducir"**. Es la unica señal de que hay trabajo pendiente: nada mas lo delata, porque
  un archivo con el texto portugues adentro es perfectamente valido.

La consecuencia buscada, en una linea: **algo que no existe en portugues no puede existir
en ingles.**

## Consecuencias

- El numero de filas de cada lista es identico en los cuatro idiomas por construccion, no
  por disciplina. La deriva deja de ser posible.
- Un cambio de estructura cuesta cuatro archivos y un commit. Es mas caro que hoy, y es el
  precio de que no haya forma de que los idiomas se separen.
- **El portugues gana un poder destructivo**: quitar una fila en PT borra sus tres
  traducciones, y no hay deshacer en la interfaz. El deshacer es `git revert`: cada
  publicacion es un commit, que es justamente por lo que el contenido vive en el repo
  (ADR-0002).
- Una fila recien creada se publica con texto portugues en las cuatro paginas publicas.
  Es visible y es deliberado: la alternativa —no publicar hasta tener las cuatro
  traducciones— convierte cada alta en un tramite de cuatro pasos y deja la pagina
  publica esperando.
- En las preguntas frecuentes esto llega al `FAQPage` del JSON-LD (ADR-0018): una
  respuesta sin traducir se publica como dato estructurado en portugues dentro de la
  pagina francesa. Se acepta por lo mismo de arriba, y el "sin traducir" es lo que acota
  la ventana.
- No aplica a las listas que ya son compartidas (`partners.json`, `media.json`) ni a las
  que salen de una entidad (`dojos.json`): esas no tienen idioma.
