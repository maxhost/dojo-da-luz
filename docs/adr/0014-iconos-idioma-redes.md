---
adr: 0014
fecha: 2026-09-18
estado: aceptada
resumen: El selector de idioma usa banderas accesibles y las redes sociales sólo se muestran cuando su URL oficial está verificada.
---

# ADR-0014 — Iconos de idioma y redes

## Decisión

- Sustituir los nombres visibles de idioma por banderas, conservando el nombre completo
  mediante texto para lectores de pantalla, `title`, `hreflang` y `aria-current`.
- Mostrar enlaces sociales con SVG inline en la cabecera y el pie.
- Centralizar las URLs sociales y no publicar iconos sin destino oficial confirmado.

## Estado de cuentas

- Facebook confirmado: `https://www.facebook.com/aikidopabloduran/`.
- Instagram y YouTube: no verificados; no se renderizan hasta recibir URL del cliente.
