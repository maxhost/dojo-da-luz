---
fecha: 2026-09-17
resumen: Cinco pantallas con arquitectura multilingue simetrica y una estetica editorial basada en ma, asimetria e indigo.
---

# ADR-0004 — Arquitectura y direccion visual

## Estado

Aceptada para prototipo; pendiente de validacion del cliente antes de migrar contenido.

## Decision

Reducir el sitio publico a Inicio, Clases, Aikido, Dojo y Contacto. Los cuatro idiomas usan
identica estructura y contratos JSON; pueden variar los textos, no los tipos de bloque. La interfaz
es mobile-first, editorial y asimetrica, con fondo washi, sumi e indigo como unico acento. La
navegacion movil usa `details/summary`, sin JavaScript. Horarios y precios son HTML visible, nunca
imagenes. Los videos se sirven mediante fachadas estaticas.

## Consecuencias

Las URLs antiguas necesitan redirects uno-a-uno. Actualidad deja de ser un archivo infinito y pasa
a novedades seleccionadas. Las biografias de maestros, enlaces historicos y material redundante se
editan o se retiran con justificacion documentada en la propuesta de contenido.
