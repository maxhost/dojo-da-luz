---
spec: 0043
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /professor-pablo-duran con Percurso como listado de largo libre, y el titulo invisible de esa seccion arreglado en el CSS para toda seccion oscura.
disjunta: no
archivos: src/pages/admin/paginas/professor.astro, src/components/admin/FormularioProfessor.astro, src/lib/{professor-edicion,schemas,traduccion}.ts, src/components/TeacherView.astro, src/styles/global.css, content/*/teacher.json
---

# 0043 — Editor de `/professor-pablo-duran`

> Noveno y **ultimo** editor con el molde de la spec 0037. Con este no queda ninguna pagina
> de contenido del sitio sin editor.

## Problema

1. **`/professor-pablo-duran` no se puede editar.** Ni sus textos, ni el retrato, ni el
   texto del boton del final. Es la unica pagina que quedo afuera de las specs 0035–0042.
2. **Percurso son seis hitos clavados en el JSON.** Añadir uno es un commit a mano en
   cuatro archivos.
3. **Los cinco textos del borde estan escritos dentro de `TeacherView.astro`** y el pie es
   una linea literal del componente. `teacher.json` es el unico archivo de contenido sin
   `chrome`.
4. **"Percurso" no se lee en la pagina publica.** La seccion es `bg-[#27231f]` y
   `.section-title` fija `color: #211f1c`: texto casi negro sobre fondo casi negro.

## Alcance

**Entra:**

- Pagina `/admin/paginas/professor` con el contrato de siempre: cuatro pestañas de idioma,
  portugues manda la estructura (ADR-0030) y siembra la foto (ADR-0032), marca "sin
  traducir", aviso de conflicto por `sha`, publicar PT escribe los cuatro archivos en un
  commit.
- **Percurso como listado**: alta y baja de hitos sin limite, con año, titulo y texto.
- Los parrafos de biografia, formacion y enseñanza, y las cajas del linaje, tambien como
  listas de largo libre (ADR-0039).
- El retrato de la portada, con su descripcion.
- **El texto del boton** del cierre hacia `/dojo`.
- Los cinco textos del borde pasan al contenido.
- **El arreglo del color**: `.text-white .section-title { color: inherit }` (ADR-0040).

**No entra:**

- **El destino del boton del final.** Va a `/dojo` por `pathFor`, que es una pagina del
  sitio y no una URL que se escriba (misma frontera que el resto, ADR-0026).
- **El `JSON-LD` de `Person`.** `name`, `knowsAbout` y `worksFor` siguen en el componente:
  son datos para buscadores, no texto de la pagina (ADR-0039).
- **El menu**: sale de `siteNav(locale)`.
- **Rediseñar la pagina.** El unico cambio visible es que "Percurso" se lee.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| — | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| — | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 01 | Portada | Antetítulo · Titular · Títulos (la línea azul) · Bajada · **Foto** · Descripción de la foto |
| 02 | Biografía | Título · tabla **Párrafos** (alta y baja libres) |
| 03 | **Percurso** | Título · tabla **Hitos**: Año · Título · Texto (alta y baja libres) |
| 04 | Formación contínua | Título · tabla **Párrafos** |
| 05 | Ensinar diferentes públicos | Título · tabla **Párrafos** |
| 06 | Linaje | Título · Introducción · tabla **Cajas**: Nombre · Rol · Texto |
| 07 | Cierre hacia el dojo | Título · Texto · **Texto del botón** |

Percurso se ve asi — es la misma tablita de las otras ocho pantallas:

```
  Hitos
  ┌────────────────────────────────────────────────────────┐
  │ Año   [ 2002                ]                          │
  │ Título[ Início em Jaén      ]                          │
  │ Texto [ Começa a praticar Aikido com Jacinto Camacho…] │
  │ Quitar                                                 │
  └────────────────────────────────────────────────────────┘
  … una por hito …
  [ Añadir fila ]
```

En es/fr/en la tabla se pinta **sin** "Añadir" ni "Quitar" y con la marca amarilla *"Sin
traducir"* en los hitos que todavia dicen lo mismo que en portugues.

## Diseño

Noveno uso del modulo generico de la spec 0037: `editor-pagina.ts` publica y
`editor-pantalla.ts` pinta. Lo propio de esta pagina es `professor-edicion.ts`, que es un
descriptor de veinte lineas y la funcion `FormData` → datos.

Schema (`teacherSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,                       // ← chrome es lo nuevo
  eyebrow, title, lead, credentials,
  photo, photoAlt,
  biographyTitle, biography,
  milestonesTitle, milestones,       // ← Percurso, de largo libre
  formationTitle, formation,
  teachingTitle, teaching,
  lineageTitle, lineageIntro, lineage,
  dojoCta: { title, text, label },
})
```

```ts
LISTAS_PROFESSOR   = ['biography', 'milestones', 'formation', 'teaching', 'lineage']
SEMBRADOS_PROFESSOR = ['photo']     // una foto no se traduce (ADR-0032)
```

`TeacherView.astro` pierde el objeto `ui` y el pie literal, y lee `c.chrome` como las otras
diez vistas. El titulo de Percurso **no se toca**: lo arregla el CSS (ADR-0040).

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/professor-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioProfessor.astro` | crear |
| `src/pages/admin/paginas/professor.astro` | crear |
| `src/lib/schemas.ts` | editar (`teacherSchema` gana `chrome`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_PROFESSOR`, `SEMBRADOS_PROFESSOR`) |
| `src/components/TeacherView.astro` | editar (chrome desde el contenido) |
| `src/styles/global.css` | editar (una línea: el color heredado) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/teacher.json` | editar (migración: `chrome` + orden canónico) |

### Disjunta?

**No.** Toca `schemas.ts` y `traduccion.ts`, compartidos con las specs 0035 a 0042, y
`global.css`, compartido con todo el sitio publico.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0** (114 archivos), `npm test` **39/39**, `npm run build`
      **44 rutas**.
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado
      (`sed 's|Base\.[A-Za-z0-9_-]*\.css|Base.CSS|g'`): **44 páginas, 0 distintas**. La
      migración de `chrome` sólo movió de lugar valores que el componente ya escribía.
- [x] El CSS construido tiene `.text-white .section-title{color:inherit}`, en la misma capa
      `components` que `.section-title` y con más especificidad. Antes no estaba.
- [x] **Capturada la página pública con Chrome headless**: en la franja oscura, "Percurso"
      se lee en blanco. Es la señal que faltaba — el defecto se veía en pantalla, no en el
      CSS.
- [x] La pantalla abre en 200 con los **nueve bloques × cuatro idiomas**, **un** campo de
      imagen editable (PT) y cuatro `name="photo"`; Percurso trae los seis hitos en los
      cuatro idiomas, con cinco botones "Añadir fila" que existen sólo en portugués.
- [x] Un séptimo hito creado en portugués apareció **en los cuatro archivos** y quedó
      marcado *"Sin traducir"* en los otros tres (3 marcas).
- [x] Traducirlo en español cambió **sólo `content/es/teacher.json`**, dos líneas.
- [x] Un POST forjado desde español con un **octavo hito y otra foto** quedó en 7 hitos y
      con la foto portuguesa: la propagación lo alineó antes de validar.
- [x] Publicar sin tocar nada → *"No había cambios"*; un formulario vacío → **422**
      nombrando los campos (`seo.title`, `chrome.caption`, …) sin escribir nada.
- [x] Sin cookie, `/admin/paginas/professor` → **302** a `/admin/entrar` con
      `X-Robots-Tag: noindex, nofollow, noarchive`.

El hito de prueba se borró de los cuatro archivos al terminar, y la comparación de las 44
páginas se repitió después: sigue en **0 distintas**.

## Abierto

**El linaje esta escrito dos veces.** Los mismos tres nombres —Franck Noel, Seigo
Yamaguchi, el Aikikai— viven en `dojo.json` y en `teacher.json`, en los cuatro idiomas cada
uno, con textos parecidos pero no iguales. Ahora los dos tienen editor, asi que el cliente
puede editarlos **y desincronizarlos**. Unificarlos es una decision de modelo de contenido
—cual de los dos manda, o si pasa a ser una entidad como los dojos— y **no entra en esta
spec**: se estaba pidiendo un editor, no una migracion de contenido. Queda anotado.

Y sigue en pie que `dojoCta.label` es el unico boton de la pagina y su destino no se edita,
que es la frontera del ADR-0026.
