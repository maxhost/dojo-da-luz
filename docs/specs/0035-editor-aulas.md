---
spec: 0035
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /aulas en el backoffice con listas de largo libre (cuotas, datos de crianças, preguntas frecuentes) donde portugues manda la estructura y los otros tres idiomas solo traducen.
disjunta: no
archivos: src/pages/admin/paginas/aulas.astro, src/components/admin/{FormularioAulas,TablaFilas}.astro, src/lib/{aulas-edicion,traduccion,publish,content,media,forms}.ts, src/components/ClassesView.astro, content/*/classes.json, content/media.json
---

# 0035 — Editor de /aulas

## Problema

`/aulas` no se puede editar. Es la segunda pagina del sitio por importancia —horarios,
precios y la aula experimental— y cualquier cambio de un precio o de una pregunta
frecuente es hoy un commit a mano en cuatro archivos.

Tres cosas de esa pagina ni siquiera estan en el contenido: la foto de portada y los dos
botones "Aulas para adultos" / "Aulas para crianças" estan escritos dentro de
`ClassesView.astro`, asi que no hay JSON que editar aunque hubiera editor.

Y el boton "Marcar aula experimental" apunta a `mailto:EMAIL-PENDENTE`: esta roto en
produccion, en los cuatro idiomas.

## Alcance

**Entra:**

- Pagina `/admin/paginas/aulas` con cuatro pestañas de idioma, calcada de
  `/admin/paginas/home`: los cuatro formularios en la pagina desde el principio, cambiar de
  idioma no navega.
- **Cinco listas editables** con el control de tabla: una fila por cosa, un "quitar" por
  fila, un "añadir fila" abajo.
- **Portugues manda la estructura** (ADR-0030): solo la pestaña PT tiene "añadir" y
  "quitar"; publicar PT escribe los cuatro archivos en **un solo commit**.
- Marca **"sin traducir"** en toda fila cuyo texto sea todavia identico al portugues.
- La foto de portada pasa a `content/media.json` como `classesHero` y se edita con el mismo
  `CampoImagen` que ya usa la Home.
- Los dos botones de audiencia pasan al contenido (`schedule.adultsLabel`,
  `schedule.childrenLabel`) y se editan.
- El boton "Marcar aula experimental" deja el `mailto:` roto y **abre el mismo modal que
  usan Adultos y Crianças** (`FormModal`), con el destino de Adultos.

**No entra:**

- **El diseño de los formularios de contacto.** Se reusa `FormModal` con el destino que ya
  tiene Adultos (`https://www.aikido-duran.com/aula-experimental`, heredado de Wix). El
  cliente dijo explicitamente: "luego diseñaremos los formularios de cada formulario".
- **`trial.formUrl` no se edita desde el BO.** Viaja en el JSON y se cambia a mano hasta que
  exista la spec de formularios. Un destino mal escrito deja el modal en blanco sin avisar.
- **El menu, entero.** La primera version de esta spec decia que las cinco etiquetas de
  `chrome.nav` si se editaban. Era falso y el editor llego a produccion con un bloque
  "Etiquetas del menu" que no pintaba nada: **`chrome.nav` no lo lee ninguna vista**. Las
  diez vistas publicas arman su menu con `siteNav(locale)`, que sale de `NAV_LABELS` en
  `src/lib/i18n.ts` — ocho enlaces a las paginas del sitio, iguales en todas. Tres de los
  cinco `href` del JSON (`#quotas`, `#criancas`, `#aula-experimental`) ni siquiera existian
  en el HTML. El campo se borro del schema y de los ocho archivos que lo tenian
  (`home.json` tambien): las 44 paginas construidas quedaron identicas byte a byte.
- **La seccion Horários no lleva tabla.** Sus sedes salen de `/admin/dojos` (spec 0034):
  aca solo se editan rotulo, titulo, introduccion y los dos botones. Dos lugares que
  editan la misma sede es el problema que la 0034 acaba de sacar.
- Las otras paginas publicas (`/aulas/adultos`, `/contactos`, …). Una pagina por spec.

## Diseño

### La pantalla, campo por campo

Aprobada por el cliente antes de escribir codigo — es la correccion de las tres vueltas
rechazadas (0031, 0032, 0033), donde se implemento sin que nadie viera la pantalla.

| Bloque | Campos de texto | Tabla (columnas) |
|---|---|---|
| SEO | Título, Descripción | — |
| Cabecera y pie | Bajada del logo, Botón de menú, Saltar al contenido, Pie · zonas, Pie · tipo de organización | — |
| Portada | Antetítulo, Titular, Bajada, Temporada, Texto del botón, **foto** | — |
| 01 · Horários | Rótulo, Título, Introducción, Botón de adultos, Botón de crianças | — (sedes desde `/admin/dojos`) |
| 02 · Quotas | Rótulo, Título, Introducción | **Cuotas**: Nombre · Precio · Detalle<br>**Notas**: Nota |
| 03 · Crianças | Rótulo, Título | **Párrafos**: Párrafo<br>**Datos**: Etiqueta · Valor |
| 04 · Perguntas frequentes | Rótulo, Título | **Preguntas**: Pregunta · Respuesta |
| 05 · Aula experimental | Rótulo, Título, Texto, Nota, Texto del botón, Abrir en ventana nueva, Cerrar | — |

**Toda lista es una tabla.** Tambien `pricing.notes` y `children.paragraphs`, que en el
editor de Home serian un textarea de "una linea por renglon". Con el ADR-0030 esa forma
deja de servir: un textarea no puede tener "añadir fila" en portugues y no tenerlo en
frances, y contar renglones para validar da un error que nadie entiende. Una tabla de una
sola columna lo dice solo. La inconsistencia con el editor de Home es deliberada y queda
anotada: si funciona, la Home se alinea despues.

### Propagacion PT → es/fr/en

`src/lib/traduccion.ts`, sin dependencia de Astro para poder testearlo:

```ts
propagarEstructura(pt: unknown, otro: unknown, listas: Ruta[]): unknown
```

Para cada lista declarada, alinea `otro` con `pt` **por posicion**: si PT tiene mas filas,
las que faltan se copian de PT tal cual; si tiene menos, las sobrantes se descartan. Los
campos que no son listas no se tocan.

Alinear por posicion y no por identidad es una decision con costo: **reordenar filas en PT
desalinea las traducciones**. Se acepta porque la alternativa —un id por fila— mete en la
pantalla del cliente un campo que no significa nada para el, que es el error del ADR-0029.
Reordenar es raro; traducir es lo de todos los dias.

`sinTraducir(pt, otro, ruta)` devuelve `true` cuando el texto de esa celda es identico al
portugues. Es lo que pinta la marca en el BO.

### Publicar

- **Publicar Português**: valida los cuatro archivos resultantes contra `classesSchema` y
  escribe los que cambiaron **en un commit** (`publicarVarios`). Si uno no valida, no se
  publica ninguno.
- **Publicar es/fr/en**: escribe solo ese archivo, como hoy.
- Concurrencia: se relee cada archivo y se compara su `sha` contra el del formulario, igual
  que en Home. En el commit multiple se suma `PATCH /git/refs/heads/main` sin `force`: si
  `main` se movio, falla y no se pisa nada.

`publicarVarios` usa la Git Data API —blobs, tree, commit, ref— porque
`PUT /contents/{path}` es un archivo por commit. Publicar PT en cuatro llamadas sueltas
dejaria, si la segunda falla, justo el estado que el ADR-0030 existe para impedir: el
portugues con una cuota nueva y el frances sin ella.

## Archivos

| Archivo | Accion |
|---|---|
| `src/pages/admin/paginas/aulas.astro` | crear |
| `src/components/admin/FormularioAulas.astro` | crear |
| `src/components/admin/TablaFilas.astro` | crear — la tablita, generica |
| `src/lib/aulas-edicion.ts` | crear — leer, armar, publicar |
| `src/lib/traduccion.ts` | crear — `propagarEstructura`, `sinTraducir` |
| `src/lib/traduccion.test.ts` | crear |
| `src/lib/publish.ts` | editar — `publicarVarios` |
| `src/lib/content.ts` | editar — `schedule.{adultsLabel,childrenLabel}`, `trial.{formUrl,directLabel,closeLabel}` |
| `src/lib/media.ts` | editar — `classesHero` |
| `src/lib/forms.ts` | editar — lector de tablas por ruta |
| `src/components/ClassesView.astro` | editar — `FormModal`, foto desde `media`, botones desde el contenido |
| `content/media.json` | editar — `classesHero` |
| `content/{pt,es,fr,en}/classes.json` | editar — campos nuevos |
| `src/pages/admin/index.astro` | editar — enlace a la pagina nueva |

Limite de 300 lineas por archivo (hook `file-size`): `FormularioAulas.astro` se divide por
bloque si hace falta.

### Disjunta?

**No.** Comparte `src/lib/content.ts` y los cuatro `content/*/classes.json` con la spec
0034. **Se serializa detras de la 0034.**

## Verificacion

- [ ] `npm test` verde, con los tests nuevos de `propagarEstructura` y `sinTraducir`
- [ ] `astro check` en 0 errores
- [ ] `npm run build` construye las 44 rutas
- [ ] Test: agregar una fila en PT la crea en los cuatro idiomas con el texto portugues
- [ ] Test: quitar una fila en PT la borra en los cuatro
- [ ] Test: editar el frances no cambia el numero de filas de ningun archivo
- [ ] En el HTML del BO construido, la pestaña PT tiene "Añadir fila" y las de es/fr/en no
- [ ] `/aulas` construido sigue mostrando las mismas 8 cuotas, los mismos 4 datos de
      crianças y las mismas 6 preguntas que antes de esta spec
- [ ] El boton de aula experimental abre un `<dialog>`, no un `mailto:`
- [ ] **Con una sesion real en produccion**: agregar una cuota en PT, publicar, ver el
      commit con los cuatro archivos, y verla aparecer en `/aulas` y en `/fr/aulas` con el
      texto portugues y la marca "sin traducir" en el BO

## Abierto

- La direccion de email del dojo sigue sin estar. No bloquea: el modal usa el formulario
  de Wix heredado, igual que Adultos hoy.
- Reordenar filas no existe. Si el cliente lo pide, es otra spec y obliga a resolver la
  alineacion por identidad.
