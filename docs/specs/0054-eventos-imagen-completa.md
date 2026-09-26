---
spec: 0054
fecha: 2026-09-25
estado: cerrada
resumen: /eventos deja de recortar sus fotos —se ven enteras, a tamaño natural— y se saca photoFoco del todo el camino de eventos (schema, edicion, traduccion, editor, contenido); supersede la parte de /eventos de la spec 0053.
disjunta: no
archivos: src/lib/{schemas,traduccion,eventos-edicion}.ts, src/components/EventsView.astro, src/components/admin/FormularioEventos.astro, content/*/events.json
---

# 0054 — /eventos muestra la imagen completa, sin recorte

> **Nada de codigo empieza sin esta spec en `cerrada`.**

## Problema

ADR-0049: un punto focal (spec 0052/0053) elige que parte de un flyer se recorta, pero no
evita que se pierda informacion — y en un flyer, a diferencia de un retrato, cualquier
parte puede ser importante (titulo, fecha, lugar, logos). El cliente lo pidio en esos
terminos: *"necesito una solucion real"* donde las imagenes **siempre** queden completas.

## Alcance

**Entra:**

- `EventsView.astro`: el `<img>` de cada evento pierde `aspect-[4/5]`, `object-cover` y el
  `style` de `object-position`. Queda `class="w-full"` — el navegador escala al ancho de
  la columna y la altura sale de la proporcion real del archivo. Nunca recorta.
- Se saca `photoFoco` de **todo el camino de eventos**: `eventsSchema` (schemas.ts),
  `SEMBRADOS_EVENTOS` (traduccion.ts), `eventosDesdeForm` (eventos-edicion.ts), la columna
  del editor (FormularioEventos.astro) y los cuatro `content/*/events.json` — incluido el
  foco `"37% 4%"` que el cliente ya habia elegido para Praga, que deja de tener sentido
  porque no hay nada que recortar.
- `eventos-edicion.test.ts` se borra: probaba exclusivamente la forma y lectura de
  `photoFoco`, que ya no existe en esta pagina.
- La ayuda del editor pasa a decir que la foto se ve entera y que el encuadre se decide
  al elegir el archivo, no despues.

**No entra:**

- **`/dojo` no se toca.** "Otros profesores" sigue con el punto focal (spec 0053):
  `focoSchema` sigue exportado de `schemas.ts` porque dojo lo usa, y `CampoFoco.astro` /
  el tipo de columna `'foco'` de `TablaFilas.astro` quedan intactos.
- **Ningun rediseño del layout de `/eventos`** mas alla de sacar la caja fija. La fila ya
  centra el texto solo (`self-center`) contra lo que mida la imagen.

## Diseño

Antes:
```
<img class="aspect-[4/5] w-full object-cover" style="object-position: 37% 4%">
```
Ahora:
```
<img class="w-full">
```

Sin `object-fit`, no hay nada que posicionar: la imagen se muestra a su proporcion
intrinseca, escalada solo por el ancho. Es la unica forma de garantizar cero perdida de
informacion sin importar que tan alto o ancho venga el archivo.

## Archivos

| Archivo | Accion |
|---|---|
| `src/components/EventsView.astro` | editar (`<img>` sin caja fija ni `object-cover`) |
| `src/lib/schemas.ts` | editar (`photoFoco` sale del item de `eventsSchema`) |
| `src/lib/traduccion.ts` | editar (`photoFoco` sale de `SEMBRADOS_EVENTOS`) |
| `src/lib/eventos-edicion.ts` | editar (`eventosDesdeForm` deja de leer `photoFoco`) |
| `src/components/admin/FormularioEventos.astro` | editar (columna `'foco'` fuera de la tabla) |
| `content/*/events.json` | editar (`photoFoco` fuera de los 4 eventos) |
| `src/lib/eventos-edicion.test.ts` | borrar |

### Disjunta?

**No.** Mismos archivos compartidos (`schemas.ts`, `traduccion.ts`) que cualquier otra
spec de pagina con listas.

## Verificacion

- [x] `npm test` **103/103** (108 menos los 5 de `photoFoco` en eventos, que se borraron).
- [x] `npm run build` 44 rutas.
- [x] Comparacion contra `HEAD` con el hash del CSS neutralizado: **exactamente las 4
      paginas de `/eventos` cambian**, ninguna otra se mueve.
- [x] HTML construido de la tarjeta de Praga: `class="w-full"`, sin `aspect-`, sin
      `object-cover`, sin `style` — confirmado leyendo el archivo generado.
- [ ] Mirar las 4 tarjetas en produccion: confirmar que se ven bien con alturas distintas
      entre si, y que el texto de cada fila sigue centrado contra su imagen.

## Abierto

Ninguno.
