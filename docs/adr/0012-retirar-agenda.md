---
fecha: 2026-09-18
resumen: Agenda desaparece del nuevo sitemap; sus URLs antiguas se redirigen individualmente a destinos semánticos existentes.
---

# ADR-0012 — Retirar Agenda

## Estado

Aceptada por decisión del cliente.

## Decisión

La nueva web no tendrá página Agenda/Actualidad y no migrará sus noticias o eventos.
Las URLs antiguas no se agrupan en un destino inexistente: cada una recibirá un `301`
hacia la página viva más afín. Videos históricos de Aikido apuntan a Aikido; eventos y
actualidad se asignarán a Home, Aulas o Dojo según su tema durante el crawl final.

## Consecuencias

Agenda sale de la navegación, sitemap objetivo y secuencia de construcción. No se activa
ningún redirect hasta que el destino exista y la matriz de 34 URLs esté cerrada.
