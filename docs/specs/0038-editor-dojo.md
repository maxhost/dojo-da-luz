---
spec: 0038
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /dojo con el bloque de Pablo Duran, un listado de profesores de largo libre que la pagina publica renderiza, y las tres cajas de "Uma transmissão viva" editables.
disjunta: no
archivos: src/pages/admin/paginas/dojo.astro, src/components/admin/{FormularioPaginaDojo,TablaFilas}.astro, src/lib/{pagina-dojo-edicion,schemas,traduccion}.ts, src/components/DojoView.astro, content/*/dojo.json
---

# 0038 — Editor de /dojo

> Cuarto editor con el molde de la spec 0037. La forma de la pantalla no se inventa: es la
> misma que el cliente ya aprobo en `/aulas`, Adultos/Criancas y `/aikido`.

## Problema

`/dojo` no se puede editar, y ademas **buena parte de lo que se ve ahi no existe en ningun
JSON**:

1. **Los tres profesores de la rejilla estan escritos dentro de `DojoView.astro`** — el
   objeto `additionalTeachers` con los cuatro idiomas a mano, mas un array `teacherPhotos`
   con tres URLs de Wix. Son tres porque el componente dice tres.
2. **Las dos fotos grandes son constantes del componente** (`DOJO`, `TEACHER`), como pasaba
   en `/aikido` antes de la spec 0037.
3. **Los cinco textos del borde** —bajada del logo, menu, salto al contenido y las dos
   lineas del pie— tambien: el array `ui` del componente, con `Benfica · Lumiar ·
   Encarnação` escrito en el HTML.
4. Lo que si esta en `content/*/dojo.json` —portada, "O lugar da prática", el bloque de
   Pablo y el linaje— no tiene editor: cambiar una palabra es un commit a mano en cuatro
   archivos.

## Alcance

**Entra:**

- Pagina `/admin/paginas/dojo` con el contrato de siempre: cuatro pestañas de idioma,
  portugues manda la estructura (ADR-0030), marca "sin traducir", aviso de conflicto por
  `sha`, publicar PT escribe los cuatro archivos en un commit.
- **El bloque del profesor principal** (hoy Pablo Duran) como seccion propia: rotulo,
  nombre, titulos, parrafos, foto y el texto del boton que lleva a su pagina.
- **El listado de otros profesores, de largo libre**: crear y quitar filas con nombre,
  titulo, parrafos y foto. **La pagina publica lo renderiza desde el contenido.**
- **"Uma transmissão viva"**: el titulo y el texto de cada una de las **tres cajas**, que
  siguen siendo tres (ADR-0034).
- Las dos fotos grandes y los cinco textos del borde pasan al contenido.
- Textos de boton editables: el del bloque de Pablo es el unico boton de la pagina.

**No entra:**

- **A donde lleva el boton de Pablo.** Es `pathFor('teacher', locale)`: una pagina del
  sitio, no un destino que se escribe (ADR-0026).
- **El menu de arriba**, por lo de siempre: sale de `siteNav(locale)`.
- **La pagina `/professor`** (`teacher.json`). Tiene su propio contenido y su propia spec
  cuando toque; este editor no la toca.
- **Añadir o quitar cajas del linaje.** Tres fijas (ADR-0034).
- El diseño de la pagina publica: la jerarquia del ADR-0023 —Pablo grande arriba, fichas en
  rejilla abajo— se conserva tal cual. El HTML construido no debe cambiar mas que por los
  valores que ahora salen del JSON.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| 00 | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| 01 | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 02 | Portada | Antetítulo · Titular · Bajada · **Foto** · Descripción de la foto |
| 03 | El lugar de la práctica | Título · Párrafos *(tabla)* |
| 04 | Profesor principal | Rótulo · Nombre · Títulos · Párrafos *(tabla)* · **Foto** · Descripción de la foto · Texto del botón |
| 05 | Otros profesores | **tabla de largo libre**: Foto + Nombre + Título + Párrafos |
| 06 | Uma transmissão viva | Título · **tres cajas fijas**: Nombre + Rol + Texto |

**La tabla de otros profesores.** Una fila por profesor, con "Quitar" y un "Añadir fila"
abajo — solo en la pestaña portuguesa:

```
┌──────────────────────────────────────────────────────────┐
│ [ miniatura ]   Nombre:    [ Inês Martins             ]  │
│ [ Cambiar   ]   Título:    [ Instrutora · Dojo da Luz ]  │
│                 Párrafos:  [ A sua prática privilegia…]  │
│                            [ Acompanha os alunos…     ]  │
│                 Descripción de la foto: [ Inês Martins]  │
│                                              Quitar      │
└──────────────────────────────────────────────────────────┘
                                          [ Añadir fila ]
```

Los parrafos de un profesor van en **un solo recuadro, un parrafo por linea** (ADR-0033):
son una lista dentro de una fila de otra lista. La foto se cambia tocando la miniatura
(ADR-0029) y **solo en portugues** (ADR-0032); en es/fr/en se ve pero no se toca, y lo que
se traduce ahi es el texto y la descripcion de la foto.

**Las tres cajas del linaje** se pintan con la misma tabla en modo no editable: sin
"Añadir" ni "Quitar" en ninguna pestaña, con los tres campos escribibles en los cuatro
idiomas.

## Diseño

Es el cuarto uso del modulo generico de la spec 0037: `editor-pagina.ts` +
`editor-pantalla.ts` mas un descriptor. Lo propio de esta pagina es `pagina-dojo-edicion.ts`:

```ts
export const paginaDojo: Pagina = {
  clave: 'dojo', titulo: 'O dojo', rutaBO: '/admin/paginas/dojo',
  archivo: (l) => `content/${l}/dojo.json`,
  schema: dojoSchema, desdeForm: dojoDesdeForm,
  listas: LISTAS_DOJO, sembrados: SEMBRADOS_DOJO,
}
```

```ts
export const LISTAS_DOJO = ['spaceParagraphs', 'teacher.paragraphs', 'teachers', 'lineage']
export const SEMBRADOS_DOJO = ['heroPhoto', 'teacher.photo', 'teachers[].photo']
```

`lineage` entra en `listas` aunque no se pueda añadir ni quitar desde la pantalla: es lo que
impide que un POST forjado en frances le meta una cuarta caja a un solo idioma.

Schema (`dojoSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,
  eyebrow, title, lead, heroPhoto: z.url(), heroPhotoAlt,
  spaceTitle, spaceParagraphs,
  teacher: { label, name, credentials, paragraphs, photo: z.url(), photoAlt, linkLabel },
  teachers: z.array({ name, credentials, paragraphs, photo: z.url(), photoAlt }),  // sin minimo
  lineageTitle, lineage: z.array({ name, role, text }).length(3),
})
```

**Un control nuevo, chico:** `TablaFilas` gana columnas de tipo `imagen`, que pintan un
`CampoImagen` dentro de la fila. Hoy la unica tabla con foto por fila es `TablaMedios`, que
es de la galeria y trae ademas lo de YouTube; copiarla para tres campos seria la tercera
copia del mismo control. La fila nueva engancha el script de `CampoImagen` con el mismo
evento `campo-imagen:inicializar` que ya usa `TablaMedios`.

`DojoView.astro` deja de tener `additionalTeachers`, `teacherPhotos`, `DOJO`, `TEACHER` y
`ui`: todo sale de `getContent('dojo', locale)`. Los parrafos de cada ficha se pintan con
un `map` en vez de `paragraphs[0]` y `paragraphs[1]`, conservando las clases exactas para
que el HTML de las fichas que ya existen no cambie ni un byte.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/pagina-dojo-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioPaginaDojo.astro` | crear |
| `src/pages/admin/paginas/dojo.astro` | crear |
| `src/components/admin/TablaFilas.astro` | editar (columna `imagen`) |
| `src/lib/schemas.ts` | editar (`dojoSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_DOJO`, `SEMBRADOS_DOJO`) |
| `src/components/DojoView.astro` | editar (todo desde el contenido) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/dojo.json` | editar (migración: `chrome`, fotos, `teachers`) |

El nombre `FormularioPaginaDojo` y no `FormularioDojo`, y `pagina-dojo-edicion.ts` y no
`dojo-edicion.ts`: **los dos en singular ya existen en plural** —`FormularioDojo.astro` y
`dojos-edicion.ts`— y son los de la entidad dojo, una sede con NAP y horarios, que no tiene
nada que ver con esta pagina.

### Disjunta?

**No.** Toca `schemas.ts`, `traduccion.ts` y `TablaFilas.astro`, compartidos con las specs
0035, 0036 y 0037.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0**, `npm test` **39/39**, `npm run build` **44 rutas**.
- [x] La pantalla abre en 200 con las cinco secciones (`01 · Portada` … `05 · Uma
      transmissão viva`) en las cuatro pestañas. Los campos de imagen tocables son **6** y
      están todos en portugués: portada, Pablo, las tres fichas y la plantilla de fila nueva.
      Los botones "Añadir fila" son **3** —párrafos del lugar, párrafos de Pablo, profesores—
      y ninguno en el linaje.
- [x] Un cuarto profesor creado en portugués aparece en los cuatro idiomas con el texto
      portugués y la marca **"Sin traducir"** en es/fr/en, y en ninguna fila más.
- [x] Traducirlo en español no tocó el portugués ni las otras filas españolas.
- [x] Un POST forjado desde español con otra foto de portada, otra de Pablo, otra de una
      ficha, un quinto profesor y una cuarta caja de linaje: quedó en **4 profesores, 3
      cajas y las tres fotos portuguesas**, y el cambio de texto legítimo del mismo envío sí
      entró.
- [x] Un POST forjado desde portugués con una cuarta caja de linaje → **422**, archivo
      intacto en 3 cajas.
- [x] Quitar el cuarto profesor en portugués lo sacó de los cuatro sin tocar la traducción
      de los otros tres.
- [x] Con la lista vacía la franja de fichas no se pinta (`bg-[#211e1b]` desaparece) y el
      bloque de Pablo y el linaje siguen ahí.
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado:
      **44 páginas, 0 distintas**. La migración del contenido dejó el sitio byte a byte
      igual, que es lo que tenía que pasar: lo que cambió es de dónde sale, no qué dice.

## Decidido

- El listado de profesores es de largo libre y la rejilla de tres columnas se queda
  (ADR-0034). Con cuatro profesores la rejilla hace dos filas.
- El linaje son tres cajas fijas, texto editable (ADR-0034, pedido explícito del cliente).
- Cabecera y pie entran, como en Adultos, Crianças y Aikido.

## Abierto

Nada bloqueante. Queda anotado: la página `/professor` (`teacher.json`) sigue sin editor y
repite el linaje con su propio campo; unificarlos es otra spec.
