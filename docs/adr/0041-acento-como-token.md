---
adr: 0041
fecha: 2026-09-21
estado: aceptada
resumen: El color de acento deja de ser un hex escrito 74 veces y pasa a ser un token del tema con dos derivados calculados por color-mix; el contenido fija el valor y el backoffice se queda azul.
---

# 0041 — El acento es un token, no un hex repetido

## Contexto

El acento `#0099ff` (ADR-0021) esta escrito **74 veces a mano** en `src/`, y no viene solo:

| Color | Veces | Que es | Donde |
|---|---|---|---|
| `#0099ff` | 74 | el acento | 37 en el sitio publico, 37 en el backoffice |
| `#b3e5ff` | 18 | el acento **aclarado** — antetitulos sobre fondo oscuro | solo el sitio publico |
| `#006eb8` | 5 | el acento **oscurecido** — texto de botones blancos sobre azul | solo el sitio publico |
| `#d6f0ff` / `#cceeff` | 4 | el acento **casi blanco** — antetitulos **sobre** el acento | solo el sitio publico |
| `#eaf6ff` | 8 | un azul casi blanco para avisos | solo el backoffice |

Hacer editable solo el primero es peor que no hacerlo: elegir verde dejaria los antetitulos
celestes y el texto de los botones azul marino. Los cuatro son **el mismo color en cuatro
claridades**, y ninguna pantalla puede pedirle al cliente que elija cuatro.

## Decision

**Un solo valor en el contenido, cuatro tokens en el tema, los tres derivados calculados.**

```css
@theme {
  --color-acento: #0099ff;
  --color-acento-claro:  color-mix(in srgb, var(--color-acento) 30%, white);
  --color-acento-oscuro: color-mix(in srgb, var(--color-acento) 72%, black);
  --color-acento-tenue:  color-mix(in srgb, var(--color-acento) 16%, white);
}
```

- Los 62 usos del sitio publico pasan a las utilidades `bg-acento`, `text-acento`,
  `border-acento`, `text-acento-claro`, `text-acento-oscuro` y `text-acento-tenue`. Las
  variantes de opacidad siguen funcionando (`border-acento/45`).
- **Son cuatro tonos y no tres porque el cuarto aparecio al buscarlo.** La primera pasada
  encontro tres; los cuatro `#d6f0ff`/`#cceeff` salieron de repasar **todos** los hex del
  sitio publico con `b > r + 20` en vez de buscar los tres que ya conocia. Un antetitulo
  celeste sobre un fondo herrumbre no lo habria visto ningun typecheck.
- `Base.astro` emite en el `<head>` un `<style is:inline>` con
  `html:root{--color-acento:<valor>}`. El selector lleva `html` de mas a proposito: con
  `:root` solo empataria en especificidad con lo que emite Tailwind y el resultado
  dependeria del orden en que Astro inyecte el CSS.
- **El backoffice no sigue el color.** Sus 37 usos, su `#eaf6ff` y su boton azul se quedan asi: es una
  herramienta interna, no la marca, y que cambie de color al elegir un acento nuevo es
  confuso sin ser util.

## Las dos mezclas estan medidas, no estimadas

Los porcentajes salen de comparar el resultado renderizado contra los dos hex escritos a
mano, con Chrome headless leyendo el pixel:

| Token | Formula | Da | Hoy es | Diferencia |
|---|---|---|---|---|
| oscuro | `srgb 72% + black` | `#006eb8` | `#006eb8` | **ninguna** |
| claro | `srgb 30% + white` | `#b3e0ff` | `#b3e5ff` | 5/255 en verde |
| tenue | `srgb 16% + white` | `#d6efff` | `#d6f0ff` | 1/255 en verde |

`color-mix(in oklab, …)`, que es lo que uno escribiria por reflejo, da `#c3e2ff` al 30% —
bastante mas claro. Se descarta por eso, no por gusto.

El `#cceeff` del antetitulo del hero —el unico de los cuatro que no estaba sobre el
acento sino sobre el video oscurecido— **pasa a `#d6efff`**: es el mismo rol y no justifica
un quinto token.

**El tono claro se mueve 5/255 en un solo canal**, sobre texto de 12 px en mayusculas: no
hay porcentaje de ninguna mezcla que reproduzca `#b3e5ff` exactamente, porque fue elegido a
ojo y no derivado. Se acepta el corrimiento y queda escrito: es el precio de que el celeste
siga al acento cuando el acento cambie.

## Consecuencias

- Cambiar el color del sitio entero es **un campo**, y los cuatro tonos se mueven juntos.
- El HTML construido **cambia**: los nombres de clase son otros. Lo que no puede cambiar es
  como se ve, y eso se verifica comparando capturas de pantalla, no el HTML.
- Un acento muy claro deja el texto blanco de los botones sin contraste. No se valida: el
  cliente ve el resultado en la pagina y lo corrige. Poner un calculo de contraste que
  rechace colores seria una pantalla discutiendo con su dueño.
- Los cuatro azules del backoffice quedan como deuda conocida: el dia que alguien quiera un
  BO que siga la marca, son las mismas cuatro sustituciones.
