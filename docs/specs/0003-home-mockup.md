---
spec: 0003
fecha: 2026-09-17
estado: implementada
resumen: Mockup movil estatico de la home propuesta, compilado con Tailwind y sin JavaScript.
disjunta: si
archivos: src/pages/mockup.astro
---

# 0003 — Mockup movil de la home

## Problema

El scaffold solo tiene marcado provisional y no permite evaluar la direccion visual propuesta
para la home a 375 px.

## Alcance

**Entra:** una ruta aislada `/mockup/`, en portugues, con header CSS-only, hero, sedes,
propuesta, profesor, clase experimental y footer; Tailwind compilado por Astro; cero scripts.

**No entra:** migracion de contenido, navegacion productiva, formularios, descarga de imagenes,
otras pantallas ni responsive desktop terminado.

## Diseño

Documento Astro autocontenido. Los textos de este artefacto son muestra visual; la implementacion
productiva consumira JSON validado como el resto del sitio.

## Archivos

| Archivo | Accion |
|---|---|
| `src/pages/mockup.astro` | crear |

### Disjunta?

Si. No comparte archivos con las specs implementadas ni altera rutas existentes.

### Archivos compartidos

Ninguno.

## Verificacion

- [x] `npm run typecheck` limpio
- [x] `npm run build` genera `.vercel/output/static/mockup/index.html`
- [x] el HTML generado no contiene `<script`

## Abierto

Nada bloqueante: las direcciones y el enlace de reserva quedan explicitamente marcados como
pendientes, no se inventan.
