# Rediseño — Dojo da Luz

Documentación de producto y dirección de arte para la migración de
`aikido-duran.com` a Astro. Estado: propuesta lista para validación del cliente.

## Principios no negociables

- Cinco pantallas públicas: Inicio, Clases, Aikido, Dojo y Contacto.
- Misma arquitectura y contratos de contenido en pt, es, fr y en.
- Salida pública 100 % estática y sin JavaScript ejecutable.
- Mobile first desde 375 px; ningún texto dentro de cajas de altura fija.
- Horarios y precios como HTML visible, nunca como imágenes.
- Videos de YouTube mediante fachada; el iframe no forma parte de la carga inicial.
- Contenido visible para Aikido Lisboa, Benfica, Lumiar, Encarnação, Pablo Durán,
  Aikikai, aula experimental, horários y preços.
- No se inventan direcciones, teléfono ni datos operativos.
- Dirección oficial: ADR-0009. Paisaje continuo de sol, montaña, tierra, dojo y umbral,
  extendido con una metáfora propia a cada pantalla.

## Documentos

1. [Auditoría y arquitectura](./01-auditoria-arquitectura.md)
2. [Wireframes](./02-wireframes.md)
3. [Sistema de diseño](./03-sistema-diseno.md)
4. [Cabecera y navegación](./04-cabecera-navegacion.md)
5. [Inventario de contenido](./05-inventario-contenido.md)
6. [Datos pendientes](./06-datos-pendientes.md)
7. [Previsualización local](./07-preview-local.md)
8. [Investigación de composición](./08-investigacion-composicion.md)

## Artefactos relacionados

- Mockup: [`src/pages/mockup.astro`](../../src/pages/mockup.astro)
- Alcance del mockup: [`spec 0003`](../specs/0003-home-mockup.md)
- Decisión vigente: [`ADR-0009`](../adr/0009-direccion-paisaje.md)
- Consolidación: [`spec 0006`](../specs/0006-consolidar-diseno-c.md)
