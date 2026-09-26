---
adr: 0050
fecha: 2026-09-26
estado: aceptada
resumen: La seccion "Cabecera" desaparece de los once editores de pagina; la bajada del logo pasa a ser un campo por idioma en /admin/ajustes y el boton de menu y el skip link dejan de ser editables — nunca cambiaron entre paginas, son vocabulario de interfaz.
---

# 0050 — "Cabecera" sale del editor de cada pagina

## Contexto

Los once editores de pagina (`Formulario{Home,Aulas,Audiencia,Aikido,PaginaDojo,Eventos,
Escolas,Contactos,Professor,OutrasArtes}.astro`) tenian una seccion **"Cabecera"** con tres
campos por idioma: `chrome.caption` (la bajada del logo, ej. "Aikido · Lisboa"),
`chrome.menuLabel` (el texto del boton de menu movil) y `chrome.skipLink` (el link de salto
al contenido para lectores de pantalla).

El cliente pidio revisarla ("para mi no tiene ningun tipo de sentido, sobre todo lo del
Saltar al contenido o Boton del menu") y confirmando eso mismo se encontro:

- **`menuLabel` y `skipLink` nunca variaron entre paginas.** Comparando los 44
  `content/*/*.json`, cada idioma tenia siempre el mismo valor en sus once archivos (pt:
  "Menu"/"Saltar para o conteúdo", es: "Menú"/"Saltar al contenido", fr:
  "Menu"/"Aller au contenu", en: "Menu"/"Skip to content"). Viajaban repetidos 44 veces sin
  que nadie los tocara nunca — el mismo patron que ya motivo sacar el pie a `site.json`
  (ADR-0042).
- **`caption` casi tampoco variaba**, salvo un accidente: las diez paginas en portugues
  decian "Aikido · Lisboa" y `home.json` decia **"Aikikai · Lisboa"** — una inconsistencia
  de tipeo (Aikikai es la escuela/linaje, no el nombre que usa el resto del sitio), invisible
  porque nadie compara diez editores a mano.

## Decision

**`menuLabel` y `skipLink` dejan de ser contenido editable.** Se hardcodean por idioma en
`src/lib/i18n.ts` (`MENU_LABEL`, `SKIP_LINK`), con el mismo criterio que `NAV_ARIA` (spec
0048): vocabulario de interfaz que no cambia entre paginas no es un campo de formulario, es
una constante. `Base.astro` los calcula de `locale` directo, sin recibirlos como prop.

**`caption` pasa a `content/site.json`** (`marca.caption`, un objeto `{pt, es, fr, en}`),
al lado de donde ya se cargan el logo y el favicon en `/admin/ajustes` — es exactamente el
mismo patron que el pie de pagina (`marca.pie`, ADR-0042): un texto por idioma que se edita
una vez y se aplica a las 44 paginas, no diez veces. La inconsistencia "Aikikai" se resuelve
al valor mayoritario, "Aikido · Lisboa".

**La seccion "Cabecera" se borra entera de los once editores de pagina**, junto con su
entrada en `NavegacionEditor`. El campo `chrome` sale del schema de cada pagina
(`chromeSchema` se borra de `schemas.ts`) y de los 44 archivos de contenido.

## Consecuencias

- **Cambia una sola pagina publica de las 44**: `index.html` (Home, pt), porque la bajada
  del logo pasaba de "Aikikai" a "Aikido" — confirmado con `difflib` a nivel de caracter
  contra el build de `HEAD`: la unica diferencia en las 44 paginas es `kai` → `do`. Las
  otras 43 quedan byte a byte iguales.
- Si mas adelante hace falta que el boton de menu o el skip link cambien de texto, ya no es
  un campo del BO: es una linea en `MENU_LABEL`/`SKIP_LINK` de `i18n.ts`, igual que
  `NAV_ARIA` o `NAV_LABELS`.
- `content/site.json` gana su segundo campo por idioma (el primero fue `pie`, ADR-0042):
  el patron "un objeto `{pt,es,fr,en}` dentro de un archivo sin pestañas de idioma" queda
  establecido para lo que sea chico, compartido y traducible.
