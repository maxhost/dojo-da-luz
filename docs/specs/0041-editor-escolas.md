---
spec: 0041
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /escolas con la portada, el bloque de comunidad y la galeria convertida en lista de medios de largo libre que acepta fotos y videos de YouTube.
disjunta: no
archivos: src/pages/admin/paginas/escolas.astro, src/components/admin/FormularioEscolas.astro, src/lib/{escolas-edicion,schemas,traduccion}.ts, src/components/{SchoolsView,GaleriaMedios,AudienceView,OtherArtsView}.astro, content/*/schools.json
---

# 0041 — Editor de /escolas

> Septimo y ultimo editor de pagina con el molde de la spec 0037.

## Problema

`/escolas` no se puede editar. Ademas:

1. **Su galeria no admite video** y exige **entre 4 y 8 fotos** (`.min(4).max(8)`): para
   sacar una hay que tener cuatro, y para sumar la novena hay que tocar codigo.
2. **Los cinco textos del borde estan escritos dentro de `SchoolsView.astro`** (el array
   `ui`), como en las cinco paginas anteriores antes de sus specs.

Lo que **ya esta bien** y no hay que tocar: la portada ya tiene foto de fondo, y el bloque
de introduccion ya tiene su foto en el contenido.

## Alcance

**Entra:**

- Pagina `/admin/paginas/escolas` con el contrato de siempre: cuatro pestañas de idioma,
  portugues manda la estructura (ADR-0030) y siembra las fotos (ADR-0032), marca "sin
  traducir", aviso de conflicto por `sha`, publicar PT escribe los cuatro archivos en un
  commit.
- **La portada**: antetitulo, titular, bajada y foto de fondo.
- **El bloque de comunidad**: antetitulo, titulo, subtitulo, parrafos y su foto con
  descripcion.
- **La galeria pasa a ser la lista de medios del resto del sitio** (ADR-0037): fotos
  subidas o videos de YouTube, largo libre, y vacia no se pinta.
- Los cinco textos del borde pasan al contenido.

**No entra:**

- **Un titulo para la galeria.** Se queda sin rotulo (ADR-0037): viene pegada al bloque de
  introduccion, que ya trae tres niveles de encabezado.
- **El menu**: sale de `siteNav(locale)`.
- **Botones.** Esta pagina no tiene ninguno —ni CTA, ni modal de formulario—, asi que no hay
  texto de boton que editar. Es la unica de las siete sin uno.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| — | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| — | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 01 | Portada | Antetítulo · Titular · Bajada · **Foto de fondo** |
| 02 | La comunidad | Antetítulo · Título · Subtítulo · Párrafos *(tabla)* · **Foto** · Descripción de la foto |
| 03 | Galería | **medios**: Añadir imagen / Añadir vídeo |

**La galería es la misma de Adultos y de Outras artes**: dos botones de alta, una fila por
medio, el tipo se elige al crear la fila. En es/fr/en la foto y el enlace se ven pero no se
tocan; lo que se traduce es la descripción. **Sin rótulo ni título**: la sección es la
rejilla, y si queda vacía no aparece.

## Diseño

Septimo uso del modulo generico de la spec 0037. Lo propio de esta pagina es
`escolas-edicion.ts`:

```ts
export const paginaEscolas: Pagina = {
  clave: 'schools', titulo: 'Escolas', rutaBO: '/admin/paginas/escolas',
  archivo: (l) => `content/${l}/schools.json`,
  schema: schoolsSchema, desdeForm: escolasDesdeForm,
  listas: LISTAS_ESCOLAS, sembrados: SEMBRADOS_ESCOLAS,
}
```

```ts
export const LISTAS_ESCOLAS = ['introduction.paragraphs', 'gallery']
export const SEMBRADOS_ESCOLAS = [
  'heroPhoto', 'introduction.photo',
  'gallery[].type', 'gallery[].src', 'gallery[].url',
]
```

Schema (`schoolsSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,
  eyebrow, title, lead, heroPhoto: z.url(),
  introduction: z.object({ eyebrow, title, subtitle, paragraphs, photo: z.url(), photoAlt }),
  gallery: z.array(galleryItemSchema),          // sin min ni max, puede estar vacia
})
```

**`GaleriaMedios` cambia de prop**: recibe `items` —la lista de medios— en vez del objeto
galeria entero. Es lo unico que usaba (`const medios = gallery.items`), y es lo que permite
reusarlo aca sin inventarle un rotulo y un titulo vacios. `AudienceView` y `OtherArtsView`
pasan a `items={c.gallery.items}` y **no cambian de HTML**.

`SchoolsView.astro` deja de tener el array `ui`, borra su rejilla propia y pinta
`GaleriaMedios` solo si hay medios.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/escolas-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioEscolas.astro` | crear |
| `src/pages/admin/paginas/escolas.astro` | crear |
| `src/components/GaleriaMedios.astro` | editar (prop `items`) |
| `src/components/{AudienceView,OtherArtsView}.astro` | editar (la prop nueva) |
| `src/lib/schemas.ts` | editar (`schoolsSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_ESCOLAS`, `SEMBRADOS_ESCOLAS`) |
| `src/components/SchoolsView.astro` | editar (chrome, galería compartida) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/schools.json` | editar (migración: `chrome`, `type` en cada foto) |

### Disjunta?

**No.** Toca `schemas.ts`, `traduccion.ts` y `GaleriaMedios.astro`, compartidos con las
specs 0035 a 0040.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0**, `npm test` **39/39**, `npm run build` **44 rutas**.
- [x] La pantalla abre en 200 con los cinco bloques. Campos de imagen tocables: **7**, todos
      en portugués —portada, comunidad, las cuatro de la galería y la plantilla de fila
      nueva—, y los dos botones de alta de la galería.
- [x] Un vídeo de YouTube añadido en portugués apareció en los cuatro idiomas; traducir su
      descripción en francés no tocó el portugués.
- [x] Un POST forjado desde español con otra foto de portada, otra del bloque de comunidad,
      otra de la galería, un medio de más y un párrafo de más quedó en **5 medios, 2
      párrafos y las tres fotos portuguesas**, y el cambio de título legítimo del mismo
      envío sí entró.
- [x] Con cinco medios la rejilla destaca el primero al doble y el vídeo sale como enlace
      con miniatura: **cero `<iframe>`** en la página.
- [x] Con **un** medio la rejilla pasa a una sola columna centrada; con **cero**, la franja
      entera desaparece.
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado:
      **44 páginas, 4 distintas**, exactamente las de `/escolas`. Comparadas etiqueta por
      etiqueta, lo único que cambia es la rejilla de la galería —las mismas cuatro fotos, en
      el mismo orden, con los mismos `alt`— y el `overflow-hidden` de su sección. Las
      páginas de Adultos, Crianças y `/outras-artes` **no cambiaron**, que es lo que había
      que comprobar tras tocar `GaleriaMedios`.

## Decidido

- La galería pasa a ser la lista de medios compartida, sin mínimo ni máximo (ADR-0037).
- No gana rótulo ni título.
- `GaleriaMedios` recibe la lista, no el objeto galería.

## Abierto

Con esta spec quedan con editor las siete páginas de contenido. **Sin editor siguen
`/contactos` y `/professor-pablo-duran`**: la primera es la más urgente según TASKS —duplica
las tres sedes en `contact.venues` y su formulario no envía— y la segunda repite el linaje
de `/dojo` en su propio campo.
