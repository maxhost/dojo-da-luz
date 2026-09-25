---
spec: 0052
fecha: 2026-09-25
estado: cerrada
resumen: Cada evento de /eventos gana un punto focal opcional para su foto, elegido con un clic sobre la imagen completa; sin foco, el recorte sigue centrado como hoy.
disjunta: no
archivos: src/lib/{schemas,traduccion,eventos-edicion}.ts, src/components/admin/{TablaFilas,CampoFoco,FormularioEventos}.astro, src/components/EventsView.astro, content/*/events.json
---

# 0052 — Foco de imagen en /eventos

> **Nada de codigo empieza sin esta spec en `cerrada`.**

## Problema

Las tarjetas de `/eventos` recortan con `object-cover` centrado, sin `object-position`.
Las fotos no son retratos: son flyers de diseño libre con texto y logos en cualquier
posicion del cuadro (medido en la sesion del 2026-09-25, bajando y simulando el recorte
real de las cuatro con `sips`):

- La foto de Franck Noël en Praga (`5238ffe4bf0a`) **esta rota hoy**: el recorte centrado
  deja solo el cuello, sin cara.
- La foto de Franck Noël en Valencia (`585a41b36921`) **esta bien hoy**: el recorte
  centrado muestra el retrato completo.

Un `object-position` fijo por CSS no puede acertar las dos a la vez: cada flyer pone la
foto en un lugar distinto. La decision de que se vea (ADR-0048) es guardar un **punto
focal por imagen**, elegible desde el BO. Hoy no existe ningun control para eso.

## Alcance

**Entra:**

- Un campo nuevo `photoFoco` en cada entrada de `events.json.items[]`: una cadena CSS de
  `object-position` (`"64% 18%"`) o vacia. Vacio = centrado, el comportamiento de hoy —
  ningun evento existente cambia de aspecto hasta que alguien elija un foco.
- **`CampoFoco.astro`**, componente nuevo: muestra la foto **completa, sin recortar**
  (`object-contain`, no `object-cover`) con un punto superpuesto en la posicion guardada.
  Un clic en cualquier parte de la imagen mueve el punto ahi y actualiza el campo oculto.
  Al lado, una vista previa a la proporcion real de la tarjeta (`aspect-[4/3]`) muestra
  como queda. Un boton "Centrar" limpia el campo.
- Un tipo de columna nuevo en **`TablaFilas.astro`**: `tipo: 'foco'`, con `campoImagen`
  apuntando al nombre de la columna de imagen de la misma fila (`photo`). Es lo que hace
  que esto sea reusable en cualquier otra tabla el dia que haga falta, sin que esa reusa
  sea el motivo de esta spec — hoy solo se usa en `/eventos`.
- **`EventsView.astro`**: el `<img>` de cada evento aplica `event.photoFoco` como
  `style="object-position: …"` cuando existe, y nada (el `object-cover` de siempre) cuando
  esta vacio.
- Migracion de `content/*/events.json`: los cuatro eventos existentes suman
  `photoFoco: ""`. Cero cambio visual hasta que el cliente elija un foco para el que esta
  roto.
- Como toda lista de `/eventos` (ADR-0030): **el foco se elige solo en la pestaña
  Português** y se propaga a los otros tres idiomas junto con `photo` — no tiene sentido
  que el mismo flyer tenga un encuadre distinto por idioma.

**No entra:**

- **Zoom o recorte real.** El punto reposiciona, no acerca ni recorta pixeles. Es lo que
  ADR-0048 decidio que alcanza para el problema medido.
- **Extender el foco a otras paginas** (`/dojo`, `/professor-pablo-duran`, la galeria de
  medios de Adultos/Crianças/Escolas/Outras Artes). Esas se auditaron en la sesion del
  2026-09-25 y **no estan rotas** — `/dojo` y `/professor-pablo-duran` ya se arreglaron con
  `object-top` fijo, que alcanza porque son siempre retratos. Sumar el campo ahi es otra
  spec, si aparece un caso real que lo pida.
- **El `heroPhoto` de `/eventos`** (la foto de fondo de la portada, detras del titular). Es
  un fondo de seccion completa, no una tarjeta con proporcion fija chica: el riesgo de
  recorte es otro y no se midio como roto.

## Diseño

```
FormularioEventos (TablaFilas, columna tipo:'foco')
        │
        ▼
   CampoFoco.astro
   ┌─────────────────────┐      ┌───────────────┐
   │ foto completa        │      │ vista previa   │
   │ (object-contain)      │      │ aspect-[4/3]   │
   │        •  ← punto     │  →   │ object-cover   │
   │   (clic la mueve)     │      │ object-position│
   └─────────────────────┘      │  = el punto     │
                                  └───────────────┘
   <input type="hidden" name="items[N].photoFoco" value="64% 18%">
```

- El punto se calcula del clic: `x = (clientX - rectImagen.left) / rectImagen.width * 100`,
  igual en Y. Se redondea a un entero — precision de mas no cambia nada visible.
- `CampoFoco` no sube nada a R2: es puro cliente, un campo de texto oculto con el
  porcentaje. No hay endpoint nuevo.
- Sin foto (`photo` vacio), `CampoFoco` no se pinta — no hay nada que encuadrar.
- El valor por defecto al crear un evento nuevo es cadena vacia: el editor no obliga a
  elegir un foco para publicar, es una mejora opcional.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/schemas.ts` | editar (`photoFoco: z.string()` en el item de `eventsSchema`) |
| `src/lib/traduccion.ts` | editar (sumar `'items[].photoFoco'` a `SEMBRADOS_EVENTOS`) |
| `src/lib/eventos-edicion.ts` | editar (`eventosDesdeForm` lee `photoFoco`) |
| `src/components/admin/TablaFilas.astro` | editar (tipo de columna `'foco'`) |
| `src/components/admin/CampoFoco.astro` | crear |
| `src/components/admin/FormularioEventos.astro` | editar (columna `photoFoco` en la tabla) |
| `src/components/EventsView.astro` | editar (`style` con `photoFoco`) |
| `content/*/events.json` | editar (migracion: `photoFoco: ""` en los 4 eventos) |
| `src/lib/schemas.test.ts` o `eventos-edicion.test.ts` | editar/crear (vacio valido, formato) |
| `src/lib/traduccion.test.ts` | editar (propagacion de `photoFoco` con `photo`) |

### Disjunta?

**No.** Comparte `schemas.ts` y `traduccion.ts` con cualquier otra spec que este tocando
otro tipo de pagina con listas (`LISTAS_*`/`SEMBRADOS_*`), y `TablaFilas.astro` con
cualquier otro editor que use tablas de filas. Verificar contra el INDEX antes de
arrancar si hay algo mas abierto en esos archivos.

## Verificacion

- [ ] `astro check` 0/0/0, `npm test` sin regresiones, `npm run build` 44 rutas.
- [ ] Contra el BO corriendo: abrir el evento de Praga, hacer clic arriba de la cara en la
      imagen completa, ver que la vista previa (`aspect-[4/3]`) ahora muestra la cara.
      Guardar, publicar, y comprobar en produccion que `/eventos` en portugues (y los
      otros tres idiomas) muestra la cara.
- [ ] El evento de Valencia sin tocar: sigue con `photoFoco` vacio y el mismo recorte
      centrado de hoy — no se rompe por la spec.
- [ ] Un foco elegido en portugues aparece propagado (mismo valor) en es/fr/en tras
      publicar portugues, igual que `photo`.
- [ ] Comparar el HTML construido contra `HEAD` con el hash del CSS neutralizado: solo
      cambian las paginas de `/eventos` (4), y solo si `photoFoco` dejo de estar vacio en
      algun evento migrado.
- [ ] Quitar el foco (boton "Centrar") vuelve al recorte centrado de siempre.

## Abierto

Ninguno: el alcance quedo acotado a `/eventos` a proposito (ADR-0048). Si despues de
implementarla aparece otra pagina con el mismo problema, es una spec nueva que reusa
`CampoFoco.astro` y el tipo de columna `'foco'` de `TablaFilas.astro` — el trabajo de
diseño ya esta hecho, falta solo cablearlo.
