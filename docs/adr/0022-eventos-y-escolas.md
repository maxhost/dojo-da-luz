---
fecha: 2026-09-20
resumen: Eventos y Escolas vuelven como páginas propias en los cuatro idiomas; supersede la parte de 0012 que dejaba los eventos sin destino propio.
---

# ADR-0022 — Eventos y Escolas

## Estado

Aceptada.

## Contexto

El ADR-0012 retiró Agenda y repartió sus URLs entre Home, Aulas y Dojo porque no había
destino vivo para eventos. Desde entonces el dojo mantiene dos necesidades que ninguna
página actual cubre: anunciar seminarios y treinos abertos, y mostrar las escuelas y la
comunidad que ya aparecían en el sitio Wix con fotografía propia.

## Decisión

Eventos y Escolas son páginas propias del sitemap, en pt/es/fr/en, con slug localizado:
`/eventos`, `/es/eventos`, `/fr/evenements`, `/en/events`; `/escolas`, `/es/escuelas`,
`/fr/ecoles`, `/en/schools`. Entran en el menú global entre Dojo y Outras artes.

Su contenido vive en `content/<idioma>/{events,schools}.json`, validado por zod como el
resto: nada de listados en el componente.

Esto supersede la regla de 0012 según la cual `/eventos-e-destaquespt` se repartía entre
Aulas y Dojo: ahora su 301 apunta a `/eventos/`. Agenda/Actualidad sigue retirada.

## Consecuencias

- El sitemap pasa de 9 a 11 conceptos por idioma; el build pasa de 36 a 44 páginas.
- El menú global tiene 8 entradas: es el límite antes de tener que jerarquizarlo.
- Eventos sin fechas reales es una página vacía de valor: hasta que el cliente confirme
  el calendario, sus tarjetas dicen "Data a confirmar" y la página no se anuncia como
  agenda cerrada.
