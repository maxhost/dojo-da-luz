---
spec: 0053
fecha: 2026-09-25
estado: cerrada
resumen: El punto focal (spec 0052) se extiende a "Otros profesores" de /dojo, y la tarjeta de /eventos pasa de aspect-[4/3] a aspect-[4/5] porque los flyers son verticales y el recorte fijo pierde informacion sin importar el foco.
disjunta: no
archivos: src/lib/{schemas,traduccion,pagina-dojo-edicion}.ts, src/components/admin/{TablaFilas,CampoFoco,FormularioPaginaDojo,FormularioEventos}.astro, src/components/{DojoView,EventsView}.astro, content/*/{dojo,events}.json
---

# 0053 — Foco en Otros profesores, y la proporcion de /eventos

> **Nada de codigo empieza sin esta spec en `cerrada`.**

## Problema

Verificada en produccion la spec 0052 (el foco de `5238ffe4bf0a` se guardo, se propago a
los cuatro idiomas y arreglo la tarjeta de Praga), el cliente pidio dos cosas mas sobre lo
mismo:

1. **"04 · Otros profesores" de `/dojo`** hoy usa `object-top` fijo (arreglado a mano el
   2026-09-21) en vez del punto focal elegible. `object-top` funciono para las cinco fotos
   de hoy porque son retratos con la cara arriba, pero no hay garantia de que la proxima
   foto que suba el cliente tenga esa forma — y a diferencia de `/eventos`, aca **si** tiene
   sentido un default razonable (retrato, cara arriba) con la opcion de ajustarlo.
2. **La caja de `/eventos` es `aspect-[4/3]`** (horizontal) para flyers que son casi todos
   verticales (medido: `1414×2000`, `1080×1920`, `1440×1920`, `1055×1491` — relacion
   0,56-0,75). Con una caja horizontal, el recorte descarta entre el 44 % y el 47 % del
   alto de la imagen **antes** de que el foco elija que parte mostrar: el punto ayuda a
   elegir *cual* mitad se pierde, no evita perder la mitad. Con una caja mas vertical se
   pierde mucho menos, y el foco pasa a ser un ajuste fino en vez de la unica defensa.

## Alcance

**Entra:**

- `photoFoco` en cada `teachers[]` de `dojo.json`, mismo `focoSchema` que `/eventos`
  (exportado de `schemas.ts`, ya no es privado). Se elige solo en portugues (ADR-0030) y
  se propaga a los otros tres (`SEMBRADOS_DOJO`).
- **`CampoFoco.astro` gana `aspecto?: '4/3' | '4/5'`** (clases literales, no un template
  dinamico — Tailwind solo genera CSS de lo que encuentra escrito tal cual en el archivo).
  Default `'4/3'`, que es lo que ya usa la ficha de "Otros profesores" y lo que sigue
  usando `/eventos` en el editor hasta que se decide bajar el valor nuevo.
- **`DojoView.astro`**: la imagen de cada ficha de profesor **mantiene `object-top` como
  clase**, y superpone `style="object-position: …"` solo cuando `teacher.photoFoco` no
  esta vacio. Es al reves que `/eventos`: aca el vacio no es "centrado", es "el default
  que ya funciona", y el foco es una excepcion cuando alguna foto lo necesite.
- **`EventsView.astro`**: la caja pasa de `aspect-[4/3]` a `aspect-[4/5]`. Medido contra
  la foto de Praga con su foco ya elegido (`37% 4%`): el recorte pasa de descartar ~45 %
  del alto a ~12 %, y ahora se ve el titulo, la cara completa y los logos del pie —
  ninguno de los tres entraba con la caja vieja.
- **`TablaFilas.astro`** pasa `aspecto` de la columna a `CampoFoco`, asi el editor
  previsualiza con la proporcion real de cada pagina.
- Migracion: los 5 profesores de `dojo.json` suman `photoFoco: ""` (sin cambio visual,
  `object-top` sigue siendo lo que se ve).

**No entra:**

- **El foco de "Profesor principal"** (Pablo Durán, la ficha grande) ni el `heroPhoto` de
  `/dojo`. El cliente pidio especificamente "Otros profesores"; esas dos fotos ya estan
  bien con `object-top` fijo y nadie reporto un caso roto ahi.
- **Recalcular el foco de Praga para la caja nueva.** El valor `37% 4%` se eligio contra
  `aspect-[4/3]`; con `aspect-[4/5]` el recorte es mucho mas chico y es probable que el
  mismo valor siga viendose bien (medido que si), pero es el cliente quien decide si hace
  falta un ajuste, no esta spec.

## Diseño

`CampoFoco` ya sabe pintar la foto completa y una vista previa — lo unico que faltaba era
que esa vista previa pudiera mentir con la proporcion equivocada. `aspecto` resuelve eso
sin tocar la logica de clic ni el formato guardado (`"X% Y%"` sigue siendo el mismo en
las dos paginas).

La diferencia real de diseño es la del default: `/eventos` no tiene una forma tipica (cada
flyer es distinto), asi que vacio = centrado es la unica opcion honesta. `/dojo` **si**
tiene una forma tipica (retrato, cara arriba), asi que vacio sigue heredando `object-top`
por CSS y el campo solo entra en juego cuando hace falta corregirlo.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/schemas.ts` | editar (`focoSchema` exportado; `photoFoco` en `teachers[]` de `dojoSchema`) |
| `src/lib/traduccion.ts` | editar (sumar `'teachers[].photoFoco'` a `SEMBRADOS_DOJO`) |
| `src/lib/pagina-dojo-edicion.ts` | editar (`dojoDesdeForm` lee `photoFoco`; de paso, imports con `.ts`) |
| `src/components/admin/CampoFoco.astro` | editar (prop `aspecto`) |
| `src/components/admin/TablaFilas.astro` | editar (`Columna.aspecto`, lo pasa a `CampoFoco`) |
| `src/components/admin/FormularioPaginaDojo.astro` | editar (columna `photoFoco` en "Otros profesores") |
| `src/components/admin/FormularioEventos.astro` | editar (`aspecto: '4/5'` en la columna) |
| `src/components/DojoView.astro` | editar (`style` con `teacher.photoFoco`, `object-top` como base) |
| `src/components/EventsView.astro` | editar (`aspect-[4/5]` en vez de `aspect-[4/3]`) |
| `content/*/dojo.json` | editar (migracion: `photoFoco: ""` en los 5 profesores) |
| `src/lib/pagina-dojo-edicion.test.ts` | crear |

### Disjunta?

**No.** Mismos archivos compartidos que la 0052 (`schemas.ts`, `traduccion.ts`,
`TablaFilas.astro`).

## Verificacion

- [x] `npm test` **108/108**, `npm run build` 44 rutas.
- [x] Comparacion contra `HEAD` con el hash del CSS neutralizado: **exactamente las 4
      paginas de `/eventos` cambian** (por el ratio), **cero paginas de `/dojo` cambian**
      (el foco vacio no altera lo que ya se veia con `object-top`).
- [x] Simulado con `sips` contra la foto real de Praga: con `aspect-[4/5]` y
      `photoFoco: "37% 4%"` se ve el titulo, la cara completa y los logos — mejor que con
      la caja vieja.
- [ ] Contra el BO corriendo o produccion: en "04 · Otros profesores" de `/dojo`, tocar
      "Encuadre de la foto" de un profesor, mover el punto, publicar, y confirmar que
      `/dojo` en los cuatro idiomas muestra el ajuste.
- [ ] Confirmar visualmente que `/eventos` con la caja nueva se ve bien en las cuatro
      tarjetas, no solo en la de Praga que ya se midio.

## Abierto

Ninguno.
