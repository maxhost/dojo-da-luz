# Rediseño — Dojo da Luz

Documentación de producto, dirección de arte y migración SEO de
`aikido-duran.com` a Astro. Estado: dirección tradicional aceptada por el cliente.

## Principios no negociables

- Núcleo público: Inicio, Aulas, Aikido, Dojo y Contacto. Otras Artes conserva URL
  propia; Agenda fue retirada por ADR-0012.
- Misma arquitectura y contratos de contenido en pt, es, fr y en.
- Salida pública 100 % estática y sin JavaScript ejecutable.
- Mobile first desde 375 px; ningún texto dentro de cajas de altura fija.
- Horarios y precios como HTML visible, nunca como imágenes.
- Videos de YouTube mediante fachada; el iframe no forma parte de la carga inicial.
- Contenido visible para Aikido Lisboa, Benfica, Lumiar, Encarnação, Pablo Durán,
  Aikikai, aula experimental, horários y preços.
- No se inventan direcciones, teléfono ni datos operativos.
- Dirección oficial: ADR-0010. Web tradicional de dojo, hero audiovisual, fotografía,
  jerarquía clásica y contenido práctico como HTML rastreable.

## Documentos

1. [Auditoría y arquitectura](./01-auditoria-arquitectura.md)
2. [Wireframes](./02-wireframes.md)
3. [Sistema de diseño](./03-sistema-diseno.md)
4. [Cabecera y navegación](./04-cabecera-navegacion.md)
5. [Inventario de contenido](./05-inventario-contenido.md)
6. [Datos pendientes](./06-datos-pendientes.md)
7. [Previsualización local](./07-preview-local.md)
8. [Investigación de composición](./08-investigacion-composicion.md)
9. [Arquitectura de URLs y redirecciones 301](./09-arquitectura-urls-y-redirects.md)

## Artefactos relacionados

- Home productiva: [`src/components/HomeView.astro`](../../src/components/HomeView.astro)
- Decisión vigente: [`ADR-0010`](../adr/0010-direccion-tradicional.md)
- Consolidación del mockup: [`spec 0006`](../specs/0006-consolidar-diseno-c.md)
- Migración a producción: [`spec 0007`](../specs/0007-home-productiva.md)
