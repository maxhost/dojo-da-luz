---
spec: 0029
fecha: 2026-09-21
estado: implementada
resumen: El editor de Home deja de tocar el menú y gana las dos tarjetas de audiencia con contenido propio (foto, título y bajada) y los tres medios de la portada, que dejan de ser constantes en el componente.
disjunta: si
archivos: src/lib/{content,forms}.ts, src/components/HomeView.astro, src/components/admin/FormularioHome.astro, src/pages/admin/paginas/home.astro, content/*/home.json
---

# 0029 — Editor de Home: menú fijo, tarjetas de audiencia y medios

## Problema

El editor de la 0021 reparte mal lo que el cliente puede tocar (ADR-0026):

1. **Deja editar el menú.** `chrome.nav` son anclas de la propia página. Un `href` con un
   espacio de más rompe la navegación y nada lo frena: el schema solo pide string no vacío.
2. **No deja editar las tarjetas de audiencia.** La sección `02` pinta dos tarjetas con
   foto, título y bajada que vienen de `adults.json` y `children.json` — los mismos campos
   que usan los heroes de `/aulas/adultos` y `/aulas/criancas`.
3. **No deja editar las fotos de la portada.** `DOJO_PHOTO` y `TEACHER_PHOTO` son `const`
   en `HomeView.astro`. `DOJO_PHOTO` es además el `poster` del vídeo del hero.

## Alcance

**Entra:**

- `chrome.nav` sale del formulario. Sigue en el schema y en el JSON; al guardar se conserva
  el valor publicado.
- `homeSchema.audiences` gana `adults` y `children`, cada uno `{photo, photoAlt, title,
  lead}`. Se siembran con lo que hoy heredan de `adults.json`/`children.json`, de modo que
  **la portada construida no cambia** al migrar.
- `homeSchema` gana `hero.poster`, `dojo.photo` y `dojo.teacher.photo`, sembrados con las
  constantes actuales. `HomeView.astro` deja de tener URLs propias.
- El formulario edita los tres medios y los ocho campos nuevos de las tarjetas. Los campos
  de imagen son una URL escrita a mano, validada con `z.url()`, con vista previa.
- `homeDesdeForm(form, base)`: parte del contenido publicado y sobrescribe solo lo que el
  formulario manda.

**No entra:**

- Subir archivos. Es la spec 0030: hasta entonces el campo apunta a una imagen que ya
  exista en algún sitio.
- Las landings `/aulas/adultos` y `/aulas/criancas`. Su contenido no se toca ni se mueve:
  solo se **copia** a la Home.
- El vídeo del hero y los ocho logos de parceiros, que siguen siendo constantes del
  componente. No los pidió nadie y cada uno trae su propio problema (ver spec 0028).
- El resto de las páginas del sitio, igual que en la 0021.

## Diseño

**Preservar lo no editable por construcción.** `homeDesdeForm(form, base)` hace
`{...base, chrome: {...base.chrome, nav: base.chrome.nav, ...}}`: todo campo que el
formulario no manda se toma del contenido ya publicado. Es lo que hace que sacar un campo
del formulario no lo borre del archivo, ahora y para los campos que vengan.

**La migración no puede cambiar la página.** Sembrar los ocho campos de las tarjetas con lo
que hoy heredan, y los tres medios con las constantes, tiene que dar exactamente el mismo
HTML. Se verifica comparando las cuatro homes construidas antes y después: byte a byte.

**Orden de claves.** Los campos nuevos se declaran en el schema donde corresponden
semánticamente, y los archivos se regeneran por la serialización canónica (ADR-0025), no a
mano.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/content.ts` | editar — `homeSchema`: `audiences.adults/children`, `hero.poster`, `dojo.photo`, `dojo.teacher.photo` |
| `src/lib/forms.ts` | editar — `homeDesdeForm(form, base)`, sin `nav` |
| `src/components/HomeView.astro` | editar — quitar `DOJO_PHOTO` y `TEACHER_PHOTO`; leer del contenido |
| `src/components/admin/FormularioHome.astro` | editar — quitar el menú, agregar tarjetas y medios |
| `src/pages/admin/paginas/home.astro` | editar — pasar el contenido publicado como base |
| `src/components/admin/CampoImagen.astro` | crear — URL con vista previa |
| `content/*/home.json` | migrar — sembrar los 11 campos nuevos |

### Disjunta?

**Sí.** La 0021 está implementada y desplegada; no hay otra spec abierta sobre estos
archivos. La 0030 depende de esta, pero es posterior.

## Verificacion

- [x] `astro check` 62 archivos 0/0/0, `npm test` 5/5, `npm run build` con 44 `index.html`.
- [x] Las cuatro homes construidas quedan **byte a byte idénticas** a las de antes de
      migrar, ignorando el `href` del CSS (ver el hallazgo de Tailwind, abajo).
- [x] El formulario pasa de 51 a **52 campos** por idioma y no contiene ningún `nav[...]`.
      Son 5 campos de imagen y 5 vistas previas por idioma, con `id` únicos.
- [x] Guardar la Home en pt con el menú fuera del formulario conserva los cuatro enlaces.
- [x] Cambiar `audiences.adults.photo` cambia la portada construida y **no**
      `/aulas/adultos`; `content/pt/adults.json` queda intacto.
- [x] `dojo.photo = "no-soy-una-url"` → 422 nombrando el campo, sin publicar.
- [x] Cambiar `dojo.photo` cambia la `<figure>` de la sección 04 y deja el `poster` del
      vídeo del hero como estaba.
- [x] En `HomeView.astro` solo quedan las 8 URLs de los logos de parceiros.
- [x] Las 6 comprobaciones de la spec 0021 siguen pasando.

## Hallazgo — el CSS público dependía de la prosa de `docs/`

La comparación byte a byte dio una única diferencia: el hash del CSS. Dentro había una
regla nueva, `.invisible{visibility:hidden}`, que no viene de ninguna clase del código.
Viene de la palabra "invisible" que este mismo trabajo escribió en el ADR-0026.

Tailwind v4 sin `@source` explícito escanea **el proyecto entero**, `docs/**/*.md`
incluido, y toma por candidata a clase cualquier palabra que coincida con una utilidad:
"visible", "invisible", "static", "fixed", "table", "grid", "container". El CSS que se
sirve a los visitantes cambiaba según lo que se escribiera en la documentación.

Arreglado en el origen y no con una nota: `@import 'tailwindcss' source(none)` más
`@source '../**/*.{astro,ts}'` en `src/styles/global.css`. El CSS baja de 28 805 a 28 173
bytes. Verificado que no se pierde nada: de las **305 clases distintas** que usan las 44
páginas construidas, las que no tienen regla son las mismas dos que ya no la tenían antes
—`hero-traditional`, que es una clase muerta anterior a este trabajo, y un artefacto de
escapado—, y las reglas de las pestañas del backoffice siguen generándose.

## Abierto

- Duplicación asumida (ADR-0026): la misma frase puede vivir en `home.json` y en
  `adults.json`. Si el cliente la cambia en la portada esperando que cambie en la landing,
  es una queja legítima y la respuesta es traer las landings al editor, no volver a
  compartir campos.
- Los campos de imagen piden una URL que el cliente no tiene de dónde sacar hasta la 0030.
- `hero-traditional` se usa en `HomeView.astro` y no tiene ninguna regla CSS, ni antes ni
  después de este trabajo. Es residuo de un rediseño anterior. No se tocó para no ensuciar
  la comparación byte a byte; se borra cuando alguien pase por ese componente.
