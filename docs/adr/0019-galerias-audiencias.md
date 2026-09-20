---
fecha: 2026-09-19
resumen: Las galerías de audiencias son contenido estructurado con imágenes o vídeo y una grilla responsive, sin carrusel ni JavaScript.
---

# ADR-0019 — Galerías de audiencias como contenido estructurado

## Estado

Aceptada.

## Contexto

Adultos y Crianças necesitan más material visual, pero las imágenes actuales son
provisionales y el administrador deberá cambiarlas más adelante. Un carrusel añadiría
controles, JavaScript y una interacción peor en móvil para sólo seis piezas.

## Decisión

La galería vive en cada JSON de audiencia con título, introducción y seis medios. El
contrato admite imagen o vídeo desde el inicio. La vista usa una grilla CSS visible y
rastreable, con carga diferida, proporciones reservadas y ningún script de interacción.

## Consecuencias

El contenido puede sustituirse sin modificar Astro y el futuro backoffice tiene un
contrato explícito. Mientras no haya más originales, puede haber recursos repetidos.
