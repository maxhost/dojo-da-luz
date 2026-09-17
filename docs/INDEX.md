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
| [0004](adr/0004-direccion-visual.md) | 2026-09-17 | Cinco pantallas, estructura multilingue simetrica y estetica editorial japonesa con indigo | aceptada para prototipo | `docs/adr/0004-direccion-visual.md` |
| [0005](adr/0005-direccion-visual-dojo.md) | 2026-09-17 | Segunda dirección: silencio, proporción de dojo, sumi/washi y bermellón; supersede la expresión visual de 0004 | aceptada para prototipo | `docs/adr/0005-direccion-visual-dojo.md` |
| [0006](adr/0006-home-zen-modular.md) | 2026-09-17 | Home continua y modular: ma, proporciones contenidas, rojo óxido y ninguna imagen dominante | aceptada para prototipo | `docs/adr/0006-home-zen-modular.md` |
| [0007](adr/0007-home-alternativa-b.md) | 2026-09-17 | Alternativa B con acento rojo concentrado y comparación estática A/B | propuesta comparativa | `docs/adr/0007-home-alternativa-b.md` |
| [0008](adr/0008-home-paisaje.md) | 2026-09-17 | Alternativa C como paisaje continuo: sol, montaña, tierra, dojo y umbral | propuesta comparativa | `docs/adr/0008-home-paisaje.md` |
| [0009](adr/0009-direccion-paisaje.md) | 2026-09-17 | Diseño C elegido; paisaje extendido como gramática oficial de las cinco pantallas | aceptada | `docs/adr/0009-direccion-paisaje.md` |

## Specs — que se construye

| # | Fecha | Spec | Estado | Disjunta? | Archivos |
|---|---|---|---|---|---|
| [0001](specs/0001-scaffold.md) | 2026-09-17 | Scaffold Astro: i18n 4 idiomas, contenido JSON validado, head de SEO completo | implementada | si | `package.json`, `src/**`, `content/**` |
| [0002](specs/0002-infra.md) | 2026-09-17 | Infra de deploy: adapter Vercel, Neon en Frankfurt, migracion inicial y /api/health | implementada | si | `astro.config.mjs`, `db/**`, `src/lib/db.ts`, `src/pages/api/**` |
| [0003](specs/0003-home-mockup.md) | 2026-09-17 | Mockup movil estatico de la home con Tailwind y cero JavaScript | implementada | si | `src/pages/mockup.astro` |
| [0004](specs/0004-home-alternative.md) | 2026-09-17 | Alternativa creativa de home y selector HTML entre propuestas A/B | implementada | si | `src/components/DesignSwitcher.astro`, `src/pages/mockup*.astro` |
| [0005](specs/0005-home-landscape.md) | 2026-09-17 | Home como paisaje narrativo SVG y selector A/B/C | implementada | si | `src/components/DesignSwitcher.astro`, `src/pages/mockup-c.astro` |
| [0006](specs/0006-consolidar-diseno-c.md) | 2026-09-17 | Consolidar C, retirar A/B y alinear la documentación del sistema | implementada | no | `src/pages/mockup*.astro`, `docs/design/**` |

**"Disjunta?"** = si el trabajo no comparte archivos con otra spec abierta. Es lo que
habilita paralelizar. Lo decide la spec, no el orquestador en runtime.

## Diseño de producto

| Documento | Contenido |
|---|---|
| [Índice de rediseño](design/README.md) | Principios y mapa de la documentación de diseño |
| [Auditoría y arquitectura](design/01-auditoria-arquitectura.md) | Diagnóstico, cinco pantallas, descartes y SEO visible |
| [Wireframes](design/02-wireframes.md) | Secciones mobile-first y transformación desktop |
| [Sistema de diseño](design/03-sistema-diseno.md) | Paleta, tipografía, grilla, imagen y componentes |
| [Cabecera y navegación](design/04-cabecera-navegacion.md) | Contrato responsive, accesibilidad e i18n |
| [Inventario de contenido](design/05-inventario-contenido.md) | Contrato exhaustivo del backoffice |
| [Datos pendientes](design/06-datos-pendientes.md) | Información a solicitar al cliente |
| [Preview local](design/07-preview-local.md) | Ejecución y verificación del mockup |
| [Investigación de composición](design/08-investigacion-composicion.md) | Ma, proporción áurea, módulo japonés y rojo |

## Convenciones

- **ADR** = una decision y su motivo. Se escribe cuando la decision se toma, no despues.
  Inmutable: si cambia, se escribe uno nuevo que supersede al viejo.
- **Spec** = que se va a construir, cerrada **antes** de tocar codigo. Ver
  `specs/TEMPLATE.md`.
- Numeracion correlativa de 4 digitos. No se reusan numeros.
- Frontmatter obligatorio con `fecha` y `resumen` de una linea: es lo que se lee sin
  abrir el archivo.
