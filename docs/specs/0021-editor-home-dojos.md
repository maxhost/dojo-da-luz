---
spec: 0021
fecha: 2026-09-18
estado: implementada
resumen: El backoffice edita la Home en los cuatro idiomas y hace CRUD de dojos; al guardar valida con zod y publica commiteando a main via API de GitHub.
disjunta: no
archivos: src/lib/{publish,forms,dojos-edicion}.ts, src/pages/admin/{paginas,dojos}/**, src/components/admin/**, content/**
---

# 0021 — Backoffice: editor de Home y CRUD de dojos

## Problema

Con 0019 hay puerta y con 0020 hay entidad, pero el cliente sigue sin poder cambiar una
coma. Falta lo que pidio: editar la Home — incluido su SEO — y crear, modificar y archivar
dojos, que son los que alimentan la seccion `02 · A terra`.

## Alcance

**Entra:**

- `src/lib/publish.ts`: lee y escribe archivos de `content/` commiteando a `main` con la
  API de GitHub (ADR-0002). Un commit por guardado, mensaje que dice que se toco.
- Editor de Home: un formulario por idioma con **todos** los campos de `homeSchema`,
  incluido `seo.title` y `seo.description` con contador de caracteres y el aviso de largo
  recomendado (≤60 / ≤155). Cambiar de idioma no pierde lo escrito sin guardar.
- **Campos GEO** (spec 0023, ADR-0018): el `resumen` citable y la FAQ, con su propio editor
  de filas `{pregunta, respuesta}`. El formulario avisa cuando una respuesta es demasiado
  corta para ser citable, antes de que lo haga el build.
- CRUD de dojos: listado, alta, edicion, archivado y reactivacion. Campos duros (NAP,
  coordenadas, transporte, horarios) una sola vez, y `i18n.nota` por idioma.
- Editor de horarios: filas `{audiencia, dias, desde, hasta}` con `<select>` y `<input
  type="time">`, no texto libre.
- Validacion con **los mismos schemas de zod del build**, en el servidor, antes de
  commitear. Si no valida, no se publica y se muestra el campo culpable.
- Aviso de publicacion: al guardar se informa que el sitio tarda ~1-2 min en regenerarse.

**No entra:**

- El resto de las paginas (Aulas, Aikido, Dojo, Profesor, Contacto, Otras Artes). Home
  primero; el patron que salga de aca se replica despues.
- Subir imagenes a R2 (ADR-0002 lo preve; es otra spec).
- Previsualizacion, borradores y flujo de aprobacion. El historial es git.
- Traduccion automatica entre idiomas.

## Diseño

**Publicacion.** `publish.ts` expone `leerContenido(ruta)` y `publicar({ruta, contenido,
mensaje})`. `publicar` hace: `GET` del blob para tomar el `sha`, `PUT` con el contenido
nuevo sobre `main`. Si el `sha` cambio entre medio, GitHub responde 409: se muestra
"alguien edito esto mientras tanto" y no se pisa nada. Requiere `GITHUB_TOKEN` (PAT de
alcance fino, solo este repo, permiso de contenido: escritura).

**Validacion.** El handler arma el objeto, lo pasa por `homeSchema` o `dojosSchema` y solo
entonces serializa con `JSON.stringify(obj, null, 2) + "\n"`. Esto garantiza que el archivo
publicado es exactamente el que el build sabe leer: el editor no puede romper el sitio.

**Formularios sin framework.** HTML nativo y `POST` normal. La unica isla con JS es el
editor de horarios (agregar y quitar filas). Coherente con el ADR-0001: el JS del BO no
toca el bundle publico, pero tampoco hace falta traer React para seis formularios.

**Rutas** (todas bajo el guard de 0019):

| Ruta | Que hace |
|---|---|
| `/admin/paginas/home` | Editor de Home, con selector de idioma |
| `/admin/dojos` | Listado con estado y orden |
| `/admin/dojos/nuevo` | Alta |
| `/admin/dojos/[slug]` | Edicion |
| `POST /admin/dojos/[slug]/archivar` | Archiva o reactiva |

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/publish.ts` | crear |
| `src/lib/forms.ts` | crear (FormData → objeto tipado) |
| `src/components/admin/CampoTexto.astro` | crear |
| `src/components/admin/EditorHorarios.astro` | crear |
| `src/pages/admin/paginas/home.astro` | crear |
| `src/pages/admin/dojos/index.astro` | crear |
| `src/pages/admin/dojos/nuevo.astro` | crear |
| `src/pages/admin/dojos/[slug].astro` | crear |
| `src/pages/admin/index.astro` | editar (accesos) |

### Disjunta?

**No.** Depende de 0019 (auth y layout del BO), de 0020 (`dojosSchema`, `getDojos`) y de
0023 (campos `resumen` y `faq`). Se serializa: 0019 → 0020 → 0023 → 0021.

## Verificacion

Todo contra `astro dev` con backend de disco, sesión de backoffice real y el formulario
extraído del HTML renderizado —lo que se postea es lo que mandaría el navegador—.

- [x] `npm run typecheck` → 61 archivos, 0 errores / 0 warnings / 0 hints
- [x] `npm test` → 5/5; `npm run build` → 44 `index.html`, igual que antes
- [x] `/admin/paginas/home` pinta **4 formularios de 51 campos**, uno por idioma, sin un
      solo `id` repetido en la página
- [x] Guardar sin tocar nada → 200, "no había cambios" y el archivo intacto: el formulario
      pinta exactamente lo que hay en el repo
- [x] Editar `hero.tagline` en pt → 303 y un diff de **2 líneas** (la vieja y la nueva),
      tocando solo `content/pt/home.json`; los otros tres idiomas intactos
- [x] `seo.title` vacío → 422, nombra el campo, no publica nada
- [x] Un `resumen` de 6 caracteres → 422 nombrando `resumen.N`: el mínimo de la capa GEO
      frena antes que el build
- [x] Guardar con el `sha` de antes de una edición ajena → 409, aviso de conflicto y el
      cambio ajeno sigue en pie
- [x] Alta con `hasta` anterior a `desde` → 422 diciendo "posterior"; no publica
- [x] Alta con un slug que ya existe → 422; siguen siendo 3 dojos
- [x] Alta válida de `alvalade` → aparece en `content/dojos.json` y, tras `npm run build`,
      en las **4 homes**
- [x] Archivarlo desde el listado → sale de las 4 homes construidas y sigue en el listado
      del BO
- [x] Archivar con un `sha` viejo → conflicto, sin pisar el cambio ajeno
- [x] Editar el teléfono de Benfica → se escribe solo ese campo; sus 3 horarios y los otros
      dos dojos quedan byte a byte iguales
- [x] Sin cookie de sesión, `/admin`, `/admin/paginas/home`, `/admin/dojos`,
      `/admin/dojos/nuevo` y `/admin/dojos/benfica` → 302 a `/admin/entrar`; todas con
      `X-Robots-Tag: noindex`
- [x] `/admin/dojos/inexistente` → 404
- [x] Tailwind compila las reglas de pestaña (`.peer\/pt:checked ~ *`) y ganan a `.hidden`
      por orden en la hoja
- [x] Con `BO_PUBLICAR=github` y un token inválido, las 4 rutas del editor responden **503
      con el motivo a la vista** ("GitHub 401 al leer…"), no un 500 opaco

## Cierre — lo que se apartó de esta spec

**El backend de publicación lo decide el modo de ejecución, no el token** (ADR-0025).
Escribir a disco en `astro dev` es lo que permitió verificar todo lo de arriba sin el PAT
del dueño del repo. Queda pendiente el paso por GitHub de verdad.

**El editor de FAQ no entra: la Home no tiene FAQ.** La spec lo pedía, pero `homeSchema`
solo tiene `resumen`; los pares `{pregunta, respuesta}` de la spec 0023 viven en Aulas,
Adultos y Crianças, que esta spec deja explícitamente fuera. El editor de filas de Q&A se
construye cuando entren esas páginas.

**No hay `i18n.nota` por dojo ni campo `transporte`.** La spec los daba por existentes;
`dojosSchema` (spec 0020) no los tiene. Agregarlos es cambiar la entidad y su render, no
el backoffice: va con la fila 6f de `docs/TASKS.md`.

**Un repositorio inalcanzable es un aviso, no un 500.** No estaba en la spec y se agregó
al preparar el despliegue: sin `GITHUB_TOKEN` en producción, las cuatro páginas del editor
habrían dado una pantalla de error vacía. Ahora dicen qué falta.

**El slug no se renombra.** En una edición se muestra como texto y viaja en un campo
oculto. Renombrarlo sería indistinguible de crear otra ficha y dejaría la vieja huérfana.

**`src/lib/dojos-edicion.ts` no estaba en la lista de archivos.** Alta, edición y archivado
comparten validación, control de `sha` y commit; dejarlo en las tres páginas era triplicar
lo único delicado.

**Los cuatro idiomas se pintan a la vez, con pestañas de CSS.** Es lo que hace cierto el
requisito de que cambiar de idioma no pierda lo escrito: no hay navegación que lo pierda.
El precio es una página grande —cuatro formularios de 51 campos— que solo ve el admin.

**Se normalizaron los cinco archivos de contenido** al orden canónico del schema, con los
mismos datos, verificado clave por clave. Sin eso, el primer guardado del cliente habría
producido un diff de archivo entero.

## Abierto

- **`GITHUB_TOKEN`: el camino de producción sigue sin ejercitarse.** Hace falta un PAT de
  alcance fino sobre `maxhost/dojo-da-luz` con permiso de contenido en escritura. El código
  del backend de GitHub está escrito y compila, pero ningún commit salió por ahí todavía:
  no se puede marcar verificado.
- El ADR-0002 asumía repo privado y hoy es público. Cuando el BO empiece a commitear, el
  historial de ediciones del cliente queda a la vista. Sigue sin decidirse.
- Falta la mirada del cliente sobre el formulario: está verificado por HTTP, no aprobado a
  ojo en pantalla.
