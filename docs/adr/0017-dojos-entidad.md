---
adr: 0017
fecha: 2026-09-18
estado: aceptada
resumen: Los dojos pasan a ser una entidad unica en content/dojos.json con NAP, coordenadas y horarios estructurados; el contenido localizado deja de duplicarlos. No van a la base de datos.
---

# 0017 — Dojos como entidad de contenido

## Contexto

Hoy los tres dojos son texto libre repetido en cuatro idiomas y en tres paginas distintas:
`home.places.items[]` ("Manhã · almoço · noite"), `classes.schedule.venues[]` y
`contact.venues[]`. Cambiar un horario son doce ediciones a mano y ninguna garantia de
que queden iguales.

Ademas el sitio **no publica ninguna direccion postal ni telefono** — el hallazgo que
`docs/TASKS.md` marca como la mayor perdida de SEO local. Sin NAP estructurado no hay
`LocalBusiness` creible ni para Google ni para los motores generativos.

## Decision

**Un dojo es una entidad con identidad propia, y vive en `content/dojos.json` — un solo
archivo, fuera de las carpetas por idioma.**

```jsonc
{
  "dojos": [{
    "slug": "benfica",                  // identidad estable; no cambia al renombrar
    "estado": "activo",                 // activo | archivado
    "orden": 1,
    "nombre": "Benfica",
    "dojo": "Dojo da Luz",
    "direccion": { "calle": "", "codigoPostal": "", "localidad": "Lisboa", "pais": "PT" },
    "geo": { "lat": null, "lng": null },
    "telefono": null,
    "transporte": ["Metro Alfornelos"],
    "horarios": [{ "audiencia": "adultos", "dias": ["lun","mie"], "desde": "19:30", "hasta": "21:00" }],
    "i18n": { "pt": { "nota": "" }, "es": {}, "fr": {}, "en": {} }
  }]
}
```

Reglas del modelo:

- **Los datos duros no se traducen.** Una direccion, una hora y una coordenada son las
  mismas en cuatro idiomas. Solo `i18n` guarda lo traducible, y las etiquetas de audiencia
  y de dias se resuelven con diccionarios de `src/lib/i18n.ts`, no escribiendolas cuatro
  veces.
- **Se archiva, no se borra.** `estado: "archivado"` saca al dojo de las tarjetas y
  conserva la fila. Borrar pierde historia y rompe enlaces.
- **`slug` es la identidad.** Renombrar "Benfica" no debe invalidar nada que apunte a el.
- **Horarios estructurados**, no una frase. De `{dias, desde, hasta}` salen las tarjetas de
  la home, las tablas de horarios y el `openingHoursSpecification` del JSON-LD. Una frase
  no puede producir ninguna de las tres.

## Por que no en la base de datos

Es la pregunta obvia teniendo Neon al lado. No:

- El ADR-0002 ya decidio que el contenido es JSON en el repo, y el motivo sigue vigente:
  **el sitio publico no depende de nada en runtime**. Meter los dojos en Postgres obligaria
  a leerlos en build (el build pasa a depender de que Neon este arriba) o en runtime
  (adios HTML estatico).
- El versionado sale gratis de git: quien cambio el horario, cuando, y `revert` si estaba
  mal. Con la DB habria que escribirlo.
- Son tres filas que cambian unas pocas veces al año.

Neon sigue siendo para lo que tiene estado real: alumnos, facturas y sesiones del BO.

## Consecuencias

- `home.places.items[]` desaparece del schema localizado: la home pasa a renderizar los
  dojos activos. Los textos de la seccion (`label`, `titleLines`, `lead`, `ctaLabel`) siguen
  siendo contenido traducible.
- Las mismas tarjetas alimentan despues Aulas y Contacto, que hoy repiten los datos. Esa
  migracion es trabajo aparte, con su propia spec.
- Aparece `SportsActivityLocation` por dojo con `PostalAddress`, `geo` y horarios. Se emite
  **solo con los campos que existan**: sin calle confirmada no se inventa una — un NAP falso
  es peor que ninguno (ADR ya vigente en `src/lib/site.ts`).
- El backoffice necesita CRUD sobre este archivo. Es el primer listado editable y fija el
  patron para los que vengan.
