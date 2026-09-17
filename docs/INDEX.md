# INDEX

Mapa de ADRs y specs. **Empeza aca.** Cada fila tiene lo suficiente para decidir si
abrir el archivo o no — no leas todo: lee la fila y abri lo que corresponda.

**Al crear un ADR o una spec, agregar la fila aca en el mismo commit.** Un indice
desactualizado es peor que no tenerlo.

## ADR — decisiones

| # | Fecha | Decision | Estado | Archivos |
|---|---|---|---|---|
| [0001](adr/0001-stack.md) | 2026-09-17 | Astro estatico + Vercel + Neon + R2; sitio publico sin dependencia de runtime | aceptada | `docs/adr/0001-stack.md` |
| [0002](adr/0002-contenido.md) | 2026-09-17 | Contenido = JSON en el repo, commiteado por el backoffice; git es el versionado | aceptada | `docs/adr/0002-contenido.md` |
| [0003](adr/0003-facturacion.md) | 2026-09-17 | Emision propia de facturas; PDF a R2 y envio por Resend, sin proveedor certificado | aceptada | `docs/adr/0003-facturacion.md` |

## Specs — que se construye

| # | Fecha | Spec | Estado | Disjunta? | Archivos |
|---|---|---|---|---|---|
| [0001](specs/0001-scaffold.md) | 2026-09-17 | Scaffold Astro: i18n 4 idiomas, contenido JSON validado, head de SEO completo | implementada | si | `package.json`, `src/**`, `content/**` |

**"Disjunta?"** = si el trabajo no comparte archivos con otra spec abierta. Es lo que
habilita paralelizar. Lo decide la spec, no el orquestador en runtime.

## Convenciones

- **ADR** = una decision y su motivo. Se escribe cuando la decision se toma, no despues.
  Inmutable: si cambia, se escribe uno nuevo que supersede al viejo.
- **Spec** = que se va a construir, cerrada **antes** de tocar codigo. Ver
  `specs/TEMPLATE.md`.
- Numeracion correlativa de 4 digitos. No se reusan numeros.
- Frontmatter obligatorio con `fecha` y `resumen` de una linea: es lo que se lee sin
  abrir el archivo.
