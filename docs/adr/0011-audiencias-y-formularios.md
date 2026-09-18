---
fecha: 2026-09-18
resumen: Aulas separa el resumen operativo de las landing pages de adultos y niños; cada audiencia o disciplina conserva contenido y formulario propios.
---

# ADR-0011 — Audiencias y formularios específicos

## Estado

Aceptada. Complementa ADR-0010 y corrige la consolidación excesiva propuesta inicialmente
para Aulas.

## Contexto

La antigua `/criancas` no es sólo un horario: contiene propuesta pedagógica, objetivos,
edades, precios, fotografías y una conversión específica para familias. Adultos, niños,
Iaido y Tai Chi usan formularios diferentes. Colapsarlos en un solo CTA genérico pierde
contenido, contexto de conversión y capacidad de medir el interés real.

## Decisión

- `/aulas/` es el resumen operativo: sedes, horarios, cuotas y acceso a cada audiencia.
- `/aulas/adultos/` es la landing editorial y de conversión para adultos.
- `/aulas/criancas/` es la landing editorial y de conversión para niños/adolescentes.
- `/outras-artes/` conserva cada disciplina como sección sustancial. Si una disciplina
  crece lo suficiente podrá tener URL propia sin cambiar el contrato de formularios.
- Fotos y videos relevantes acompañan a su audiencia/disciplina; no se eliminan por el
  hecho de resumir horarios en Aulas.
- Se crea un modal de interés reutilizable, pero cada instancia recibe su propio tipo de
  actividad, audiencia y destino de formulario.
- El modal debe ser accesible, cerrable por teclado, tener fallback a un enlace directo
  y cargar el formulario externo sólo al abrirse. El JavaScript mínimo necesario para
  foco, cierre y carga diferida es una excepción deliberada a la preferencia de cero JS.

## Formularios conocidos

| Contexto | Destino actual | Estado |
|---|---|---|
| Aikido infantil | Google Form `1FAIpQLSfN-rw5gQ82gukAPdRKHsFkXvcjtogv7gWqgELtnek_6i2Biw` | confirmado desde `/criancas` |
| Aikido adultos | formulario integrado en `/aula-experimental` | fuente confirmada; campos no visibles en el HTML rastreable |
| Iaido | `https://forms.gle/jbVZnR31896h7p826` | confirmado desde `/outras-artes`; conservar el shortlink hasta resolver la URL final |
| Tai Chi | Google Form `1FAIpQLSclYRerVbnP0yIJ70o7NUgfporjBYQLuuxb2zhBhGb-BwDTbg` | confirmado desde `/outras-artes` |
| Shiatsu | no se observó formulario en la página actual | confirmar si requiere contacto propio |

## Consecuencias

La navegación y el sitemap ganan dos destinos bajo Aulas. El redirect de `/criancas`
ya no apunta a un anchor del resumen sino a `/aulas/criancas/`. Antes de sustituir el
formulario adulto integrado en Wix hay que inventariar sus campos y confirmar el canal
de recepción; no se debe confundir con los Google Forms de niños, Iaido o Tai Chi.
