---
spec: 0040
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /outras-artes con las tres artes editables una por una, la portada con foto de fondo nueva y una galeria de fotos y videos de YouTube para la pagina.
disjunta: no
archivos: src/pages/admin/paginas/outras-artes.astro, src/components/admin/FormularioOutrasArtes.astro, src/lib/{outras-artes-edicion,schemas,traduccion}.ts, src/components/OtherArtsView.astro, content/*/other-arts.json
---

# 0040 — Editor de /outras-artes

> Sexto editor con el molde de la spec 0037. La forma de la pantalla no se inventa: es la
> misma que el cliente ya aprobo en `/aulas`, Adultos/Criancas, `/aikido`, `/dojo` y
> `/eventos`.

## Problema

`/outras-artes` —Shiatsu, Iaido y Tai Chi Chuan— no se puede editar. Y ademas:

1. **La portada es plana.** Una franja oscura con texto centrado, sin imagen. Es la ultima
   pagina interior sin la portada con foto que ya tienen `/aikido`, `/eventos`, Adultos y
   Criancas.
2. **No hay galeria.** Cada arte tiene una sola foto y no hay donde poner mas.
3. **Los cinco textos del borde estan escritos dentro de `OtherArtsView.astro`** (el array
   `ui`), como pasaba en las cuatro paginas anteriores antes de sus specs.
4. **Cada arte lleva un `id` escrito en el contenido** que sale como ancla HTML y que **no
   enlaza nadie** —comprobado con `grep` sobre `src/`, `content/`, `public/`, `docs/` y la
   matriz de redirects.
5. Defecto latente: el numero de cada arte se pinta con `0{index + 1}`. Con tres no se ve;
   es el mismo `010` que ya se corrigio en `/aikido` y `/eventos`.

## Alcance

**Entra:**

- Pagina `/admin/paginas/outras-artes` con el contrato de siempre: cuatro pestañas de
  idioma, portugues manda la estructura (ADR-0030) y siembra las fotos (ADR-0032), marca
  "sin traducir", aviso de conflicto por `sha`, publicar PT escribe los cuatro archivos en
  un commit.
- **La portada gana foto de fondo** (ADR-0036), editable y decorativa.
- **Las tres artes, una por una**: nombre, subtitulo, foto, descripcion de la foto,
  parrafos, beneficios, horarios, profesor y el texto de su boton.
- **Una galeria de la pagina** con fotos subidas o videos de YouTube, de largo libre, con
  el mismo control que Adultos y Criancas. Nace vacia y **mientras este vacia no se pinta**.
- Los cinco textos del borde pasan al contenido.
- Se borra el `id` de cada arte; el ancla pasa a ser `#arte-1`, `#arte-2`… por posicion.
- Se corrige el `0{index + 1}`.

**No entra:**

- **Añadir o quitar artes.** Son tres (ADR-0036): cada una trae un formulario externo que
  no se edita desde el BO, y un arte nueva sin formulario seria media alta.
- **`formUrl`, el destino de cada formulario.** Misma razon que en la spec 0035: un destino
  mal escrito deja el modal en blanco sin avisar. Viaja oculto en el formulario y se siembra
  desde portugues.
Los tres textos del boton y su modal —el que abre (`trialLabel`), el enlace para abrirlo
  aparte (`directLabel`) y el de cerrar (`closeLabel`)— **si entran**, como en `/aulas` y en
  las paginas de audiencia. El unico que no es el destino.
- **El menu**, por lo de siempre: sale de `siteNav(locale)`.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| — | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| — | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 01 | Portada | Antetítulo · Titular · Bajada · **Foto de fondo** |
| 02 | Arte 1 · Shiatsu | Nombre · Subtítulo · **Foto** · Descripción de la foto · Párrafos · Beneficios · Horarios · Profesor · Texto del botón · Enlace para abrir el formulario aparte · Texto para cerrar |
| 03 | Arte 2 · Iaido | los mismos |
| 04 | Arte 3 · Tai Chi Chuan | los mismos |
| 05 | Galería | Rótulo · Título · Introducción · **medios**: Añadir imagen / Añadir vídeo |

**Cada arte es un bloque, no una fila de tabla.** Tiene nueve campos y tres listas adentro:
una tabla de tres filas con nueve columnas cada una no se lee. Las tres listas —párrafos,
beneficios, horarios— se editan como **un recuadro de texto, una entrada por línea**
(ADR-0033): están dentro de una fila de otra lista, que es exactamente el caso que ese ADR
cubre.

**Beneficios y horarios pueden quedar vacíos** y hoy lo están: Shiatsu no tiene horario
publicado e Iaido no tiene lista de beneficios. Un recuadro vacío es una lista vacía, y la
página no pinta el bloque.

**El profesor es opcional.** Solo Iaido tiene uno hoy. Vacío = no se muestra.

**La galería es la de Adultos**, el mismo control: dos botones de alta —*Añadir imagen* y
*Añadir vídeo*— y una fila por medio. El tipo se elige al crear la fila. En es/fr/en la foto
y el enlace se ven pero no se tocan: lo que se traduce es la descripción.

**El número de cada arte y el lado de la foto no se editan**: salen de la posición. Ojo con
una diferencia buscada: en la pantalla del editor los bloques se numeran en orden de
recorrido —`01` es la portada— mientras que en la página pública las artes empiezan en `01`.
Se numera lo que hay que recorrer para editar, que incluye la portada y la galería.

## Diseño

Sexto uso del modulo generico de la spec 0037. Lo propio de esta pagina es
`outras-artes-edicion.ts`:

```ts
export const paginaOutrasArtes: Pagina = {
  clave: 'otherArts', titulo: 'Outras artes', rutaBO: '/admin/paginas/outras-artes',
  archivo: (l) => `content/${l}/other-arts.json`,
  schema: otherArtsSchema, desdeForm: outrasArtesDesdeForm,
  listas: LISTAS_OUTRAS_ARTES, sembrados: SEMBRADOS_OUTRAS_ARTES,
}
```

```ts
export const LISTAS_OUTRAS_ARTES = ['activities', 'gallery.items']
export const SEMBRADOS_OUTRAS_ARTES = [
  'heroPhoto',
  'activities[].photo',
  'activities[].formUrl',
  'gallery.items[].type', 'gallery.items[].src', 'gallery.items[].url',
]
```

`activities[].formUrl` va sembrado **y** oculto: el campo no se pinta, viaja en un `hidden`
para no perderse al guardar, y ademas se copia del portugues antes de validar, asi que por
la puerta de una traduccion no entra un destino distinto.

Schema (`otherArtsSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,
  eyebrow, title, lead, heroPhoto: z.url(),
  activities: z.array(z.object({          // sin `id`
    name, subtitle, photo: z.url(), photoAlt,
    paragraphs: linesSchema, benefits: z.array(...), schedule: z.array(...),
    teacher: z.string().min(1).optional(),
    trialLabel, formUrl: z.url().nullable(), directLabel, closeLabel,   // formUrl oculto
  })).min(1),
  gallery: gallerySchema,
})
```

`OtherArtsView.astro` gana la portada con foto, pinta la galeria **solo si tiene medios**,
numera con `padStart(2, '0')` y arma el ancla y el `id` del modal por posicion.

El editor reusa `CampoTexto`, `CampoImagen` y `TablaMedios` sin cambios. **Ningun control
nuevo.**

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/outras-artes-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioOutrasArtes.astro` | crear |
| `src/pages/admin/paginas/outras-artes.astro` | crear |
| `src/lib/schemas.ts` | editar (`otherArtsSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_OUTRAS_ARTES`, `SEMBRADOS_OUTRAS_ARTES`) |
| `src/components/OtherArtsView.astro` | editar (portada, chrome, galería, numeración, ancla) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/other-arts.json` | editar (migración: `chrome`, `heroPhoto`, `gallery`, sin `id`) |

### Disjunta?

**No.** Toca `schemas.ts` y `traduccion.ts`, compartidos con las specs 0035 a 0039.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0**, `npm test` **39/39**, `npm run build` **44 rutas**.
- [x] La pantalla abre en 200 con los siete bloques: cabecera, SEO, `01 · Portada`, las tres
      artes y `05 · Galería`. Campos de imagen tocables: **5**, todos en portugués —portada,
      las tres fotos y la plantilla de fila nueva—. `formUrl` viaja oculto en las cuatro
      pestañas (12 campos: 3 artes × 4 idiomas) y no se pinta en ninguna.
- [x] Una foto y un vídeo de YouTube subidos a la galería desde portugués aparecieron en los
      cuatro idiomas; traducir la descripción en inglés no tocó el portugués.
- [x] Un POST forjado desde español con otra foto de portada, otra foto de un arte, otro
      `formUrl`, otra foto de galería, un medio de más y un cuarto arte quedó en **3 artes,
      2 medios y las cuatro cosas portuguesas**, y el cambio de texto de botón legítimo del
      mismo envío sí entró.
- [x] Vaciar el recuadro de beneficios dejó la lista vacía y la página **no pinta** ese
      bloque; borrar el profesor quitó la clave del JSON —no la dejó en cadena vacía— y la
      página no lo pinta.
- [x] Con la galería vacía la sección entera desaparece de la página pública: ni el rótulo.
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado:
      **44 páginas, 4 distintas**, exactamente las de `/outras-artes`. Comparadas etiqueta
      por etiqueta, las únicas diferencias son el bloque de portada nuevo y el ancla de cada
      arte (`#shiatsu` → `#arte-1`, con el `id` del modal en consecuencia). **Ni un texto
      cambió.**

## Decidido

- La portada lleva foto de fondo, decorativa (ADR-0036).
- La galería es una por página, no una por arte, y vacía no se pinta (ADR-0036).
- Las tres artes son tres: no hay alta ni baja (ADR-0036).
- `formUrl` no se edita; viaja oculto y sembrado.

## Abierto

Nada bloqueante. Queda anotado: **Shiatsu no tiene formulario** (`formUrl: null`) y su
botón lleva a `/contactos`. Si el cliente quiere darle uno, hoy no puede hacerlo solo — es
la misma decisión pendiente sobre `formUrl` que arrastran `/aulas` y las dos páginas de
audiencia.
