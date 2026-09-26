---
spec: 0055
fecha: 2026-09-26
estado: cerrada
resumen: Se borra la seccion "Cabecera" de los once editores de pagina; la bajada del logo pasa a /admin/ajustes (por idioma) y el boton de menu / skip link se hardcodean en i18n.ts.
disjunta: si
archivos: content/**/*.json, content/site.json, src/lib/{i18n,ajustes,ajustes-edicion,schemas,forms,aikido-edicion,audiencia-edicion,aulas-edicion,contactos-edicion,escolas-edicion,eventos-edicion,outras-artes-edicion,pagina-dojo-edicion,professor-edicion}.ts, src/layouts/Base.astro, src/components/*.astro, src/components/admin/Formulario*.astro
---

# 0055 — "Cabecera" sale del editor de cada pagina (ADR-0050)

## Problema

Los once editores de pagina tenian una seccion "Cabecera" con tres campos por idioma
(`chrome.caption`, `chrome.menuLabel`, `chrome.skipLink`) que el cliente calific de sin
sentido. Verificado contra los 44 `content/*.json`: `menuLabel` y `skipLink` nunca
cambiaban de valor entre paginas del mismo idioma, y `caption` solo variaba por un error de
tipeo en `home.json` ("Aikikai" en vez de "Aikido"). Repetir tres campos en once editores
para algo que no se toca nunca es el mismo problema que ya resolvio el pie de pagina
(ADR-0042).

## Alcance

**Entra:**
- Sacar `chrome` del schema de cada pagina y de los 44 archivos de contenido.
- `menuLabel` y `skipLink` como constantes por idioma en `i18n.ts`, consumidas por
  `Base.astro` directo desde `locale` (sin prop).
- `caption` como campo por idioma (`marca.caption.{pt,es,fr,en}`) en `content/site.json`,
  editado en `/admin/ajustes` debajo de logo y favicon.
- Borrar la seccion "Cabecera" (fieldset + entrada de `NavegacionEditor`) de los once
  `Formulario*.astro`.

**No entra:**
- No se toca el menu de navegacion (`siteNav`, ADR-0026): eso ya vive en codigo, no en esta
  seccion.
- No se centraliza nada mas del contenido de cada pagina — solo lo que ya vivia en `chrome`.

## Diseño

`Base.astro` ya importaba `getAjustes()` para `marca.logo/favicon/acento`. Se agrega
`marca.caption[locale]` a esa misma lectura. `MENU_LABEL` y `SKIP_LINK` son `Record<Locale,
string>` en `i18n.ts`, mismo criterio que `NAV_ARIA` (interfaz, no contenido). Las tres
props (`skipLink`, `menuLabel`, `caption`) se sacan de la interfaz `Props` de `Base.astro`:
ya no las pasa ninguna vista.

`ajustesSchema.marca.caption` usa un `textoPorIdioma` (objeto `{pt,es,fr,en}` de
`z.string().min(1)`), mismo patron que `pie` pero con texto de un renglon en vez de lineas.
`ajustesDesdeForm` lo arma con `Object.fromEntries(LOCALES.map(...))`, igual que `pie`.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/i18n.ts` | agregar `MENU_LABEL`, `SKIP_LINK` |
| `src/lib/ajustes.ts` | agregar `marca.caption` (textoPorIdioma) al schema |
| `src/lib/ajustes-edicion.ts` | parsear `marca.caption.<locale>` del form |
| `src/components/admin/FormularioAjustes.astro` | 4 campos de caption bajo el favicon |
| `content/site.json` | agregar `marca.caption` con los 4 valores migrados |
| `src/layouts/Base.astro` | computar `caption`/`menuLabel`/`skipLink` de `marca`/`locale`, sacar de `Props` |
| `src/lib/schemas.ts` | borrar `chromeSchema` y `chrome:` de los 10 schemas de pagina |
| `src/lib/forms.ts` | borrar bloque `chrome` de `homeDesdeForm` |
| `src/lib/{aikido,audiencia,aulas,contactos,escolas,eventos,outras-artes,pagina-dojo,professor}-edicion.ts` | borrar bloque `chrome` de cada `*DesdeForm` |
| `src/components/{AikidoView,AudienceView,ClassesView,ContactView,DojoView,EventsView,HomeView,OtherArtsView,SchoolsView,TeacherView}.astro` | sacar `chrome` y los 3 props de `<Base>` |
| `src/components/admin/Formulario{Aikido,Audiencia,Aulas,Contactos,Escolas,Eventos,Home,OutrasArtes,PaginaDojo,Professor}.astro` | borrar fieldset "Cabecera" y su entrada en `navegacion` |
| `content/{pt,es,fr,en}/{adults,aikido,children,classes,contact,dojo,events,home,other-arts,schools,teacher}.json` | borrar clave `chrome` (44 archivos) |

### Disjunta?

Si — no hay otra spec abierta en el INDEX que toque estos archivos.

## Verificacion

- [x] `npm test`: 103/103.
- [x] `npm run build`: 44 rutas, sin errores.
- [x] Comparacion character-level (`difflib`) del HTML de las 44 paginas contra el build de
      `HEAD` (antes de esta spec): **una sola diferencia en las 44**, `kai` → `do` en
      `index.html` (Home, pt) — el fix de "Aikikai" a "Aikido". Las otras 43 quedan byte a
      byte iguales.
- [ ] Verificado contra el BO corriendo: falta abrir `/admin/ajustes` y confirmar que los
      4 campos nuevos de "Bajada del logo" aparecen debajo del favicon y publican bien, y
      que ningun editor de pagina muestra mas la seccion "Cabecera".

## Abierto

Nada bloqueante. Falta el punto de verificacion contra el BO corriendo (sesion sin acceso a
Neon/BO en este momento) — queda para la proxima vez que alguien entre con la contraseña
real o con `scripts/sesion-temporal.mjs`.
