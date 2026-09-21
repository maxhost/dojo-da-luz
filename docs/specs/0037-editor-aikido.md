---
spec: 0037
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /aikido con la lista numerada de largo libre, el bloque O-Sensei siempre presente y las dos fotos que hoy estan escritas dentro del componente.
disjunta: no
archivos: src/pages/admin/paginas/aikido.astro, src/components/admin/FormularioAikido.astro, src/lib/{aikido-edicion,editor-pagina,editor-pantalla,audiencia-edicion,traduccion,schemas}.ts, src/components/AikidoView.astro, content/*/aikido.json
---

# 0037 — Editor de /aikido

> El layout campo por campo y las cuatro decisiones de "Abierto" las aprobo el cliente el
> 2026-09-21 antes de que se escribiera una linea de codigo.

## Problema

`/aikido` no se puede editar. Es la pagina que explica que es el Aikido —seis secciones
numeradas, el fundador y el cierre con los dos botones de audiencia— y cambiar una palabra
es un commit a mano en cuatro archivos.

Tres cosas especificas de esta pagina:

1. **Las dos fotos no estan en el contenido.** `HERO_PHOTO` y `UESHIBA_FAMILY_PHOTO` son
   constantes escritas dentro de `AikidoView.astro` (lineas 15-19): no hay JSON que editar
   aunque hubiera editor. Es el mismo caso que los botones de `/aulas` en la spec 0035.
2. **El `alt` de la foto de Ueshiba esta en español en los cuatro idiomas**
   (`alt="Familia Ueshiba"`), escrito en el componente.
3. **Cada seccion carga un `id` que no usa nadie.** `introducao`, `origem`… salen como
   ancla HTML (`<article id="…">`) y **ningun enlace del sitio, ninguna redireccion 301 y
   ningun dato estructurado apunta a ellas** — comprobado con `grep` sobre `src/`,
   `content/`, `public/` y la matriz de redirects. Ademas el id es distinto por idioma, asi
   que propagar una fila nueva desde portugues (ADR-0030) meteria `introducao` dentro de la
   pagina inglesa.

Y un defecto latente: el numero de cada seccion se pinta con `0{index+1}`, que a partir de
la decima seccion escribe `010`. Hoy no se ve porque son seis y no se pueden agregar.

## Alcance

**Entra:**

- Pagina `/admin/paginas/aikido`, con las cuatro pestañas de idioma y el mismo contrato que
  Adultos y Criancas (spec 0036): portugues manda la estructura, marca "sin traducir",
  aviso de conflicto por `sha`, publicar PT escribe los cuatro archivos en un commit.
- **La lista numerada pasa a ser de largo libre**: añadir y quitar secciones sin limite. El
  numero lo pone la pagina por posicion, asi que una seccion nueva es `07` sola.
- **El bloque O-Sensei siempre esta**: no se puede quitar. Se editan sus cuatro textos, sus
  parrafos y su foto.
- **Las dos fotos pasan al contenido** y se editan con la miniatura que se toca. Portugues
  las siembra a los cuatro idiomas (ADR-0032).
- **Los dos textos de boton del cierre** y su titulo.
- **Los cinco textos de cabecera y pie** pasan al contenido, como en Adultos.
- Se corrige el `0{index+1}` para que la seccion 10 diga `10` y no `010`.

**No entra:**

- **A donde van los dos botones del final.** Apuntan a Adultos y Criancas por
  `pathFor(...)`: son las paginas del sitio, no un destino que se escribe.
- **El menu**, por lo mismo de siempre: sale de `siteNav(locale)`.
- **El `id` de cada seccion.** Se borra del schema y de los cuatro archivos; el ancla pasa a
  ser `seccion-1`, `seccion-2`… por posicion. Ver "Abierto", punto 1.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| 00 | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| 01 | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 02 | Portada | Antetítulo · Titular · Bajada · **Foto de fondo** |
| 03 | Las secciones numeradas | **tabla de largo libre**: Título + Párrafos |
| 04 | O-Sensei | Rótulo · Nombre · Años · Párrafos *(tabla)* · Foto · Descripción de la foto |
| 05 | Cierre | Título · Texto del botón de adultos · Texto del botón de crianças |

**La tabla de secciones.** Una fila por sección, con "Quitar" y un "Añadir sección" abajo:

```
┌ 01 ──────────────────────────────────────────────────┐
│ Título:   [ Equilíbrio antes da força.            ]  │
│ Párrafos: [ O Aikido é uma disciplina marcial…    ]  │
│           [ A sua técnica privilegia equilíbrio…  ]  │
│                                          Quitar      │
└──────────────────────────────────────────────────────┘
```

Los párrafos de una sección van en **un solo recuadro, un párrafo por línea**. Es la única
excepción a "una tablita por lista" y tiene un motivo: es una lista *dentro* de una fila de
otra lista, y una tabla adentro de una tabla es más pantalla de la que el contenido merece.
Los párrafos del bloque O-Sensei, que no están anidados, sí van en su tablita.

**La foto de portada no lleva descripción.** Es un fondo detrás del titular, con un velo
negro encima; para un lector de pantalla no aporta nada y se publica como decorativa
(`alt=""`). La de O-Sensei sí lleva, y se traduce.

## Diseño

**Este es el tercer editor con la misma forma** —`/aulas`, Adultos/Criancas, y ahora
`/aikido`—, y con el tercero se paga la deuda: el POST, la lectura de los cuatro archivos,
la propagacion desde portugues, el aviso de conflicto por `sha` y el commit de cuatro
archivos salen de `audiencia-edicion.ts`/`audiencia-pantalla.ts` a un modulo generico,
`src/lib/editor-pagina.ts` + `editor-pantalla.ts`, parametrizados por un **descriptor** de
pagina:

```ts
type Pagina = {
  clave: string                    // 'adults' | 'children' | 'aikido'
  titulo: string                   // como se llama en el BO y en el commit
  rutaBO: string                   // /admin/paginas/aikido
  archivo: (locale) => string      // content/<locale>/aikido.json
  schema: z.ZodType
  desdeForm: (form: FormData) => unknown
  listas: readonly string[]        // largo decidido por portugues (ADR-0030)
  sembrados: readonly string[]     // campos que siempre vienen de PT (ADR-0032)
}
```

Adultos y Criancas se migran al modulo en el mismo commit: copiar el molde una tercera vez
es como se llega a tres copias del mismo bug. `/aulas` **no** se migra —tiene ademas el
paso de `publicarMedia` sobre `media.json`— y queda anotado en TASKS.

Lo especifico de `/aikido`:

- Todo el texto en `content/<idioma>/aikido.json`; las fotos viajan adentro y portugues las
  siembra (ADR-0032). No se toca `content/media.json`.
- `LISTAS_AIKIDO = ['sections', 'founder.paragraphs']` para la propagacion por posicion, y
  `SEMBRADOS_AIKIDO = ['heroPhoto', 'founder.photo']`.
- `sections[].paragraphs` se arma con el helper `lineas()` que ya existe en `forms.ts`.
- El editor reusa `TablaFilas`, `CampoTexto` y `CampoImagen` sin cambios.

Cambios al schema:

```ts
export const aikidoSchema = z.object({
  seo, chrome,
  eyebrow, title, lead, heroPhoto: z.url(),
  sections: z.array(z.object({ title, paragraphs })).min(1),   // sin `id`
  founder: z.object({ label, title, years, paragraphs, photo: z.url(), photoAlt }),
  audienceTitle, adultsLabel, childrenLabel,
})
```

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/editor-pagina.ts` | crear (el descriptor y la publicacion, genericos) |
| `src/lib/editor-pantalla.ts` | crear (el POST y la lectura de los 4 archivos) |
| `src/lib/aikido-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/lib/audiencia-edicion.ts` | editar (pasa a ser descriptor + `desdeForm`) |
| `src/lib/audiencia-pantalla.ts` | borrar (lo reemplaza `editor-pagina.ts`) |
| `src/pages/admin/paginas/{adultos,criancas}.astro` | editar (usan el modulo generico) |
| `src/components/admin/FormularioAikido.astro` | crear |
| `src/pages/admin/paginas/aikido.astro` | crear |
| `src/lib/schemas.ts` | editar (`aikidoSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_AIKIDO`, `SEMBRADOS_AIKIDO`) |
| `src/components/AikidoView.astro` | editar (chrome, fotos del contenido, numeración, ancla) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/aikido.json` | editar (migración: `chrome`, fotos, sin `id`) |

### Disjunta?

**No.** Toca `schemas.ts` y `traduccion.ts`, compartidos con las specs 0035 y 0036.

## Verificación

- [ ] `astro check` 0/0/0, `npm test` verde, `npm run build` 44 rutas.
- [ ] **Con el BO corriendo**: añadir una séptima sección en portugués y verla aparecer en
      los cuatro idiomas marcada "sin traducir"; quitarla y que se vaya de los cuatro.
- [ ] Cambiar la foto de O-Sensei desde portugués y ver que cambia en los cuatro.
- [ ] La página pública con 7 secciones: la séptima dice `07`. Con 10: dice `10`.
- [ ] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado: solo
      deben cambiar las 4 páginas de `/aikido`.

## Decidido

Las cuatro preguntas que bloqueaban el cierre, resueltas por el cliente el 2026-09-21:

1. **El ancla de cada sección se borra** y pasa a ser por posición (`#seccion-1`). Es un
   identificador técnico que no significa nada para quien edita (ADR-0026) y que ademas era
   distinto por idioma.
2. **Los párrafos de cada sección van en un recuadro, uno por línea** (ADR-0033).
3. **La foto de portada se publica como decorativa**, sin descripción.
4. **Cabecera y pie entran**, como en Adultos y Crianças.

## Abierto

Nada bloqueante. Queda anotado: `/aulas` sigue con su propio `aulas-edicion.ts` sin migrar
al módulo genérico, porque publica además `media.json`.
