---
spec: 0051
fecha: 2026-09-22
estado: implementada
resumen: Outras artes deja los Google Forms externos y pasa a formId, el archivado se bloquea mientras haya una pagina que use el formulario, la asignacion se elige solo en portugues y el modal publico se ajusta a movil.
disjunta: no
archivos: content/*/other-arts.json, src/lib/{schemas,traduccion,outras-artes-edicion,formularios-edicion}.ts, src/pages/admin/paginas/{home,outras-artes}.astro, src/pages/admin/formularios/index.astro, src/pages/admin/formularios/[id]/archivar.ts, src/components/{FormModal,FormularioPublico,OtherArtsView}.astro, src/components/admin/{CampoFormulario,FormularioHome,FormularioAulas,FormularioOutrasArtes}.astro
---

# 0051 — Outras artes al `formId`, archivado protegido y modal a medida movil

> **Escrita despues del codigo.** Es la excepcion, no el molde: el trabajo salio de la
> 0050 y se escribio sin su spec. Queda aca para que el cambio sea auditable, y la
> verificacion de abajo dice exactamente que se comprobo y que no.

## Problema

La spec 0050 dejo cuatro cosas abiertas y una de ellas, fuera de su alcance explicito
(*"migrar en esta spec los Google Forms de Iaido y Tai Chi: no entra"*):

1. `/outras-artes` seguia con `formUrl`: Iaido y Tai Chi abrian un `<iframe>` a Google
   Forms y Shiatsu, con `formUrl: null`, ni siquiera abria un modal — su boton era un
   enlace a `/contactos`. Tres botones publicos con tres comportamientos distintos, y un
   formulario que el dojo no controla ni puede traducir.
2. El `formId` de la Home se podia elegir en las cuatro pestañas por separado: dos idiomas
   podian terminar abriendo formularios distintos desde el mismo boton.
3. Archivar un formulario en uso estaba permitido (ADR-0046) y dejaba el modal publico
   apuntando a un formulario que el backoffice ya no ofrece.
4. El modal publico y el formulario se habian diseñado mobile-first pero desbordaban en
   pantallas angostas: etiquetas largas sin corte, `dialog` de ancho fijo, opciones de una
   sola linea y scroll que arrastraba la pagina de atras.

## Alcance

**Entra:**

- `activities[].formUrl` → `activities[].formId` en el schema, los cuatro contenidos y el
  editor; el campo se siembra desde portugues como el resto de las asignaciones;
- los tres botones de `/outras-artes` abren el modal propio: se borra la rama del enlace a
  `/contactos`;
- `formId` editable solo en la pestaña Português en Home y Outras artes; las otras
  pestañas lo muestran en texto y lo mandan en un `hidden`;
- la Home publica el `formId` a los cuatro idiomas en **un commit** (`publicarVarios`), no
  uno por idioma;
- archivar bloqueado mientras el formulario este asignado — boton deshabilitado y **409**
  en el POST (ADR-0047);
- el selector de formularios ofrece solo activos, y la pestaña traducida dice «Sin
  formulario activo» si el asignado ya no existe;
- `referenciasPorFormulario` lee los cuatro archivos una vez y acepta modo estricto;
- ajuste movil del modal y del formulario publico: `dialog` de ancho fluido,
  `overflow-wrap`, `overscroll-contain`, areas tactiles de 48 px, foco visible en el
  cierre, `aria-labelledby` en el dialogo y `tabindex="-1"` en el mensaje de exito.

**No entra:**

- crear un formulario propio para Shiatsu, Iaido y Tai Chi. Hoy **los tres apuntan al
  unico formulario que existe**, «Aula experimental de Aikido». La migracion es tecnica:
  que cada arte tenga el suyo es una decision de contenido del cliente y va en su fila de
  `docs/TASKS.md`;
- borrar `directLabel` y la rama `<iframe>` de `FormModal`, que quedaron sin uso en todo
  el sitio — tambien con su fila en `TASKS.md`;
- las credenciales de Resend y el envio real, que siguen siendo el pendiente de la 0050;
- tocar el editor de Contactos, Aulas, Adultos o Crianças mas alla del aviso de que la
  asignacion se elige en portugues.

## Diseño

**Referencias.** `PAGINAS_CON_FORMULARIO` gana las tres artes con ruta indexada
(`activities.0.formId`…). Como las tres viven en el mismo archivo, la lectura se memoiza
por archivo: preguntar por fila serian cuatro lecturas del repositorio por cada formulario
del listado.

**Archivado.** `cambiarEstado` consulta `referenciasPorFormulario(true)` antes de archivar
y devuelve `409` con los nombres de las paginas. El modo estricto propaga el error de
lectura en vez de devolver «sin usos»: un archivo ilegible no puede convertirse en permiso.

**Propagacion del `formId` de la Home.** El editor de la Home no pasa por
`editor-pagina.ts` porque publica ademas media y parcerias. Al guardar en portugues lee los
otros tres archivos, les escribe `threshold.formId`, los valida con `homeSchema` y manda
solo los que cambiaron en un `publicarVarios`. Si ninguno cambio y no hubo imagenes, no
publica nada.

## Archivos

| Archivo | Accion |
|---|---|
| `content/{pt,es,fr,en}/other-arts.json` | editar — `formUrl` → `formId` |
| `src/lib/schemas.ts` | editar — `formId` en `otherArtsSchema` |
| `src/lib/traduccion.ts` | editar — sembrar `activities[].formId` |
| `src/lib/outras-artes-edicion.ts` | editar — leer `formId` del form |
| `src/lib/formularios-edicion.ts` | editar — tres artes, memoizacion, modo estricto, 409 |
| `src/pages/admin/formularios/index.astro` | editar — boton deshabilitado con motivo |
| `src/pages/admin/formularios/[id]/archivar.ts` | editar — comentario del contrato nuevo |
| `src/pages/admin/paginas/home.astro` | editar — propagacion en un commit |
| `src/pages/admin/paginas/outras-artes.astro` | editar — pasa `formularios` |
| `src/components/admin/CampoFormulario.astro` | editar — solo activos |
| `src/components/admin/{FormularioHome,FormularioOutrasArtes}.astro` | editar — `editable` solo en pt |
| `src/components/admin/FormularioAulas.astro` | editar — aviso correcto |
| `src/components/{FormModal,FormularioPublico,OtherArtsView}.astro` | editar — modal movil y `formId` |

### Disjunta?

**No.** Toca `formularios-edicion.ts`, `schemas.ts` y los editores de la 0050. Se serializa
detras de ella — y de hecho corrio despues.

## Verificacion

Hecho:

- [x] `npx astro check` — **0 errores / 0 warnings / 0 hints** (142 archivos)
- [x] `npm test` — **85/85**
- [x] `npm run build` — completo, 44 rutas
- [x] `grep -rn formUrl src content` — **sin resultados**: no quedo ninguna referencia

**Falta, y por eso esto no se marca verificado en `TASKS.md`:** correr el backoffice y
comprobar contra la pantalla que (a) el boton «Archivar» de «Aula experimental de Aikido»
esta deshabilitado y el POST forjado sin el boton devuelve **409** y no cambia el archivo;
(b) cambiar el formulario de la Home en portugues deja los cuatro `home.json` con el mismo
`formId` en **un** commit; (c) un POST forjado desde español no puede cambiar el `formId`
de ninguna de las dos paginas; (d) los tres botones de `/outras-artes` abren el modal con
el formulario en el idioma de la pagina. Un `303` no alcanza como prueba: hay que leer la
query del `Location` o el archivo en disco.

## Abierto

- Que formulario debe abrir cada arte. Hoy los tres abren el de Aikido porque es el unico
  que existe; el texto del boton sigue diciendo «Aula experimental de Tai Chi».
- Shiatsu ya no tiene el camino a `/contactos`. Si el cliente lo queria asi, hace falta un
  `formId` opcional y la regla de archivado del ADR-0047 no cambia.
