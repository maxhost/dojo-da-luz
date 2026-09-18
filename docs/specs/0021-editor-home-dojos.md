---
spec: 0021
fecha: 2026-09-18
estado: cerrada
resumen: El backoffice edita la Home en los cuatro idiomas y hace CRUD de dojos; al guardar valida con zod y publica commiteando a main via API de GitHub.
disjunta: no
archivos: src/lib/publish.ts, src/lib/forms.ts, src/pages/admin/paginas/home.astro, src/pages/admin/dojos/**, src/components/admin/**
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

**No.** Depende de 0019 (auth y layout del BO) y de 0020 (`dojosSchema`, `getDojos`).
Se serializa: 0019 → 0020 → 0021.

## Verificacion

- [ ] `npm run typecheck` limpio; el build publico sigue en 36 rutas.
- [ ] Editar `hero.tagline` en pt desde `/admin/paginas/home` produce **un commit** en
      GitHub que toca solo `content/pt/home.json`, y el diff es esa linea.
- [ ] Guardar con `seo.title` vacio no publica: responde con el error del campo y no hay
      commit nuevo.
- [ ] Crear un dojo con horario `desde` posterior a `hasta` no publica.
- [ ] Alta de un dojo → aparece en `content/dojos.json` y, tras el build, en las 4 homes.
- [ ] Archivar un dojo → desaparece de las 4 homes y sigue en el listado del BO.
- [ ] Editar el archivo por fuera y guardar desde el BO con el `sha` viejo → 409 y aviso,
      sin pisar el cambio ajeno.
- [ ] Sin cookie de sesion, todas las rutas de `/admin/**` redirigen a `/admin/entrar`.

## Abierto

- `GITHUB_TOKEN`: PAT de alcance fino limitado a `maxhost/dojo-da-luz` con permiso de
  contenido en escritura. Lo genera el dueño del repo. **Bloquea la verificacion de
  publicacion**, no el desarrollo: contra un repo de prueba se verifica igual.
- El ADR-0002 asumia repo privado y hoy el repo es publico. No cambia el diseño — en el
  repo no hay secretos — pero conviene decidirlo explicitamente antes de que el BO empiece
  a commitear historial de ediciones del cliente.
