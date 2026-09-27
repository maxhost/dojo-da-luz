---
spec: 0058
fecha: 2026-09-27
estado: cerrada
resumen: La entrada del menu publico de /dojo pasa a "O Dojo - Equipa" (es "El Dojo - Equipo", fr "Le Dojo - Équipe", en "The Dojo - Team")
disjunta: si
archivos: src/lib/i18n.ts
---

# 0058 — "O Dojo - Equipa" en el menu

## Problema

El menu publico dice "O dojo" / "El dojo" / "Le dojo" / "The dojo". El cliente pidio el
2026-09-27 "O Dojo - Equipa", con Dojo en mayuscula, y su traduccion en los otros idiomas.

## Alcance

**Entra:** `NAV_LABELS.dojo` en `src/lib/i18n.ts` (lo consume `siteNav()`, que arma cabecera
y pie en las 44 paginas).

**No entra:** titulos de la pagina `/dojo`, su contenido ni las etiquetas del backoffice
("O dojo" en `Admin.astro` y el editor), que no son el menu publico.

## Verificacion

- [x] `npm test` y `npm run build` en verde.
- [x] El HTML construido muestra la etiqueta nueva en cabecera y pie de los cuatro idiomas y
      ninguna ocurrencia de la vieja como enlace a `/dojo`.
- [x] Captura de la cabecera en escritorio y movil: la etiqueta mas larga no rompe el menu.
