---
spec: 0039
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /eventos con el listado de largo libre que se arma en portugues y se traduce, la alternancia izquierda/derecha por posicion y el estado "no hay eventos proximos".
disjunta: no
archivos: src/pages/admin/paginas/eventos.astro, src/components/admin/FormularioEventos.astro, src/lib/{eventos-edicion,schemas,traduccion}.ts, src/components/EventsView.astro, content/*/events.json
---

# 0039 — Editor de /eventos

> Quinto editor con el molde de la spec 0037. La forma de la pantalla no se inventa: es la
> misma que el cliente ya aprobo en `/aulas`, Adultos/Criancas, `/aikido` y `/dojo`.

## Problema

`/eventos` no se puede editar, y es **la pagina que mas lo necesita**: una agenda cambia
sola con el tiempo. Hoy:

1. **El schema exige entre 3 y 4 eventos** (`items` con `.min(3).max(4)`). Para sacar un
   seminario que ya paso hay que inventar otro; para sumar un quinto, tocar codigo.
2. **Las cuatro tarjetas son de relleno.** Las cuatro dicen *"Data a confirmar"*, como
   anticipo el ADR-0022.
3. **No hay estado vacio.** Con la lista vacia el build ni siquiera pasa, y si pasara se
   veria una franja beige sin nada.
4. **La foto de portada y los cinco textos del borde estan escritos dentro de
   `EventsView.astro`** (`HERO_PHOTO` y el objeto `ui`), como pasaba en `/aikido` y `/dojo`
   antes de sus specs.
5. Defecto latente: el numero de cada evento se pinta con `0{index + 1}`, que a partir del
   decimo escribe `010`. Hoy no se ve porque el maximo es cuatro; con la lista libre, si.

## Alcance

**Entra:**

- Pagina `/admin/paginas/eventos` con el contrato de siempre: cuatro pestañas de idioma,
  portugues manda la estructura (ADR-0030), marca "sin traducir", aviso de conflicto por
  `sha`, publicar PT escribe los cuatro archivos en un commit.
- **El listado de eventos, de largo libre**: crear y quitar sin limite, cada uno con foto,
  titulo, fecha, lugar, descripcion y descripcion de la foto.
- **El estado vacio**: con cero eventos la pagina publica no pinta la lista y muestra la
  linea `emptyText` —"Não há eventos próximos."— editable y traducible.
- La foto de portada y los cinco textos del borde pasan al contenido.
- Se corrige el `0{index + 1}` para que el evento 10 diga `10` y no `010`.

**No entra:**

- **El orden de los eventos.** Es el orden de la lista, y se cambia moviendo el texto. Un
  campo "orden" o un selector de fecha real es otra spec — ver "Abierto".
- **`date` como fecha de verdad.** Hoy es texto libre ("Data a confirmar", "14 de março")
  y se queda asi: convertirlo en fecha obliga a decidir formato por idioma, orden
  cronologico y que pasa con un evento pasado.
- **El menu** y el destino de los enlaces: salen de `siteNav(locale)`.
- Datos estructurados `Event` para buscadores. La pagina no emite JSON-LD de eventos hoy y
  hacerlo con fechas que dicen "a confirmar" seria publicar datos falsos (ADR-0018).

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| 00 | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| 01 | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 02 | Portada | Antetítulo · Titular · Bajada · **Foto de fondo** |
| 03 | Los eventos | **tabla de largo libre**: Foto + Título + Fecha + Lugar + Descripción + Descripción de la foto |
| 04 | Cuando no hay eventos | Texto que se muestra con la lista vacía |

**La tabla de eventos.** Una fila por evento, con "Quitar" y un "Añadir fila" abajo — solo
en la pestaña portuguesa:

```
┌──────────────────────────────────────────────────────────────┐
│ [ miniatura ]   Título:      [ Treino aberto de Aikido    ]  │
│ [ Cambiar   ]   Fecha:       [ Data a confirmar           ]  │
│                 Lugar:       [ Dojo da Luz · Lisboa       ]  │
│                 Descripción: [ Uma sessão aberta para…    ]  │
│                 Descripción de la foto: [ Prática de…     ]  │
│                                                  Quitar      │
└──────────────────────────────────────────────────────────────┘
                                              [ Añadir fila ]
```

**La alternancia no se edita.** El primer evento lleva la foto a la izquierda, el segundo a
la derecha, y asi. Sale de la posicion en la lista: mover un evento cambia su lado solo. El
numero —`01`, `02`…— tampoco: lo pone la pagina.

**El texto del vacio se escribe siempre**, aunque haya eventos. Es la unica forma de que el
dia que se borre el ultimo evento la pagina diga algo en los cuatro idiomas.

## Diseño

Quinto uso del modulo generico de la spec 0037. Lo propio de esta pagina es
`eventos-edicion.ts`:

```ts
export const paginaEventos: Pagina = {
  clave: 'events', titulo: 'Eventos', rutaBO: '/admin/paginas/eventos',
  archivo: (l) => `content/${l}/events.json`,
  schema: eventsSchema, desdeForm: eventosDesdeForm,
  listas: LISTAS_EVENTOS, sembrados: SEMBRADOS_EVENTOS,
}
```

```ts
export const LISTAS_EVENTOS = ['items']
export const SEMBRADOS_EVENTOS = ['heroPhoto', 'items[].photo']
```

Schema (`eventsSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,
  eyebrow, title, lead, heroPhoto: z.url(),
  items: z.array({ title, date, location, description, photo: z.url(), photoAlt }),  // sin min ni max
  emptyText,
})
```

`heroPhoto` no lleva `alt`: es un fondo detras del titular con un velo negro encima, igual
que en `/aikido`, y se publica como decorativa.

El editor reusa `TablaFilas` con la columna `imagen` que sumo la spec 0038: ningun control
nuevo.

`EventsView.astro` deja de tener `HERO_PHOTO` y `ui`, pinta la lista solo si tiene filas,
y numera con `padStart(2, '0')`.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/eventos-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioEventos.astro` | crear |
| `src/pages/admin/paginas/eventos.astro` | crear |
| `src/lib/schemas.ts` | editar (`eventsSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_EVENTOS`, `SEMBRADOS_EVENTOS`) |
| `src/components/EventsView.astro` | editar (chrome, foto, vacío, numeración) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/events.json` | editar (migración: `chrome`, `heroPhoto`, `emptyText`) |

### Disjunta?

**No.** Toca `schemas.ts` y `traduccion.ts`, compartidos con las specs 0035 a 0038.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0**, `npm test` **39/39**, `npm run build` **44 rutas**.
- [x] La pantalla abre en 200 con los cinco bloques. Los campos de imagen tocables son **6**
      y están todos en portugués (portada, los cuatro eventos y la plantilla de fila nueva);
      el botón "Añadir fila" es **1** y solo en portugués.
- [x] Un quinto evento creado en portugués apareció en los cuatro idiomas; traducirlo en
      francés no tocó el portugués.
- [x] Un POST forjado desde español con otra foto de portada, otra foto del primer evento y
      un sexto evento quedó en **5 eventos y las dos fotos portuguesas**, y el cambio de
      título legítimo del mismo envío sí entró.
- [x] Con **diez** eventos la página numera `01…09, 10` —el `0{index + 1}` que escribía
      `010` está arreglado— y alterna: 5 de 10 llevan la foto a la derecha.
- [x] Con la lista vacía las cuatro páginas públicas no pintan **ninguna** tarjeta y
      muestran su `emptyText` traducido: *"Não há eventos próximos."*, *"No hay eventos
      próximos."*, *"Aucun événement à venir."*, *"There are no upcoming events."*
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado:
      **44 páginas, 0 distintas**. La migración del contenido dejó el sitio byte a byte
      igual: lo que cambió es de dónde sale, no qué dice.

## Decidido

- La lista es de largo libre y el vacío es un estado con texto propio (ADR-0035).
- La alternancia y el número salen de la posición, no de un campo.
- `date` sigue siendo texto libre.

## Abierto

Queda anotado, sin bloquear: **el orden es el de la lista y no hay forma de mover una fila
sin recortar y pegar el texto**. Con cuatro eventos no molesta; si la agenda crece, un
"subir/bajar" por fila es la siguiente mejora de `TablaFilas`, y vale para las cinco listas
que ya existen.
