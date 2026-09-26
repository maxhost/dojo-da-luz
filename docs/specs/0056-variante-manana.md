---
spec: 0056
fecha: 2026-09-26
estado: cerrada
resumen: Se agrega "Mañana" como cuarta variante de horario (enum cerrado en i18n.ts), junto a mediodía, tarde y Buki Waza
disjunta: si
archivos: src/lib/i18n.ts
---

# 0056 — Variante de horario "Mañana"

## Problema

El editor de dojos (`/admin/dojos/[slug]`, seccion Horarios) ofrece variante como un
`<select>` con tres opciones fijas: mediodia, tarde y Buki Waza (`VARIANTES` en
`src/lib/i18n.ts:101`). El cliente pidio agregar franjas horarias de manana para el dojo
Benfica y esa opcion no existe — no es texto libre, es un enum cerrado que valida el schema
Zod (`src/lib/dojos.ts:27`, `z.enum(VARIANTES)`).

## Alcance

**Entra:**
- Agregar el valor `manana` a `VARIANTES` en `src/lib/i18n.ts`.
- Agregar su traduccion en las cuatro locales de `VARIANTE_LABEL` (pt/es/fr/en).

**No entra:**
- Cargar el horario real de manana de Benfica en `content/dojos.json` — eso lo hace el
  cliente desde el editor una vez que la opcion existe, o se pide como tarea aparte con el
  dato (dias/horas) especificado.
- Tocar `EditorHorarios.astro` ni `src/lib/dojos.ts` — ambos ya iteran sobre `VARIANTES` y
  `VARIANTE_LABEL` sin lista hardcodeada propia, asi que no hace falta editarlos.

## Diseño

`VARIANTES` es la unica fuente de verdad: el `<select>` del editor (`EditorHorarios.astro:64`)
y el schema de validacion (`dojos.ts:27`) la consumen por iteracion/enum, no por copia. Insertar
`manana` alcanza para que aparezca en el formulario y sea un valor valido al guardar.

Orden cronologico del dia: `manana` va primero en el array (antes de `almuerzo`), asi el
`<select>` lista las franjas en el orden en que ocurren.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/i18n.ts` | editar: agregar `'manana'` a `VARIANTES` y su fila en `VARIANTE_LABEL` |

### Disjunta?

No hay otra spec abierta tocando `src/lib/i18n.ts` en el INDEX actual (la ultima que lo toco,
0055, ya esta cerrada e implementada). Disjunta.

## Verificacion

- [ ] `npm test` sigue en verde (ningun test hardcodea las 3 variantes viejas — confirmado
      por grep, no aparece `'armas'` fuera de `i18n.ts` y `content/dojos.json`).
- [ ] `npm run build` sin errores.
- [ ] Visualmente: `/admin/dojos/benfica` muestra "Mañana" como cuarta opcion del select
      Variante.

## Abierto

Nada — el pedido es unicamente agregar la opcion al enum, no cargar horarios de Benfica.
