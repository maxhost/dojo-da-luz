---
spec: 0027
fecha: 2026-09-21
estado: implementada
resumen: El equipo docente de /dojo pasa a una sola sección con Pablo Durán protagonista y los otros tres instructores en fichas compactas de tres columnas.
disjunta: si
archivos: src/components/DojoView.astro, docs/**
---

# 0027 — Jerarquía del equipo docente en Dojo

> Spec escrita **después** del código, contra el flujo de `CLAUDE.md`. El cambio llegó
> implementado desde otra herramienta (ver `docs/HANDOFF-CLAUDE-CODE.md`). Se deja
> registrada porque lo que no está en `docs/` no sobrevive a la próxima sesión, y se
> anota aquí el incumplimiento en vez de disimularlo.

## Problema

Desde la spec 0026, `/dojo` renderiza cuatro profesores con el mismo componente en bucle:
cuatro secciones a pantalla completa, alternando el lado de la imagen. Observable hoy:

- Pablo Durán —el único con página propia— no se distingue de los otros tres.
- Las cuatro secciones usan el mismo asset `TEACHER`: el mismo retrato repetido.
- Cuatro scrolls completos para cuatro biografías de dos párrafos.

## Alcance

**Entra:**

- Una sola `<section>` para el equipo docente, con dos niveles jerárquicos.
- Bloque protagonista de Pablo Durán: retrato `4/5` con marco azul desplazado, título
  hasta `text-7xl`, biografía con filete lateral y enlace a su página.
- Tres fichas compactas para Inês Martins, Miguel Costa y Sofia Almeida: imagen `4/3`
  con `loading="lazy"`, nombre, credenciales y sus dos párrafos.
- Un array `teacherPhotos` con tres URLs de wixstatic ya en uso, recortadas con `fp_`
  distintos, como imagen provisional de las fichas.
- Conservar los `id` de ancla existentes.

**No entra:**

- Contenido: no se tocan `content/*/dojo.json` ni los schemas de `content.ts`.
- JavaScript de cliente: sigue siendo cero.
- Retratos reales de los tres instructores: el cliente no los entregó.
- Página propia para los instructores adicionales: solo Pablo la tiene.
- Rótulo «Equipo docente» y numeración de las fichas: descartados por pedido del cliente.

## Diseño

`teachers` (el array de cuatro que se mapeaba) desaparece. Quedan `leadTeacher` —el
objeto de `c.teacher` con su `href`— y `additionalTeachers`, que ya existía y se recorre
directamente. El `href` del protagonista es siempre `pathFor('teacher', locale)`, así que
el enlace deja de ser condicional.

La jerarquía es puramente de composición: escala tipográfica, proporción de imagen
(vertical contra horizontal) y fondo (`#27231f` contra `#211e1b` separado por filete). No
hay texto que anuncie «estos son secundarios»; lo dice la forma.

En móvil las fichas se apilan separadas por filete inferior; desde `md` forman tres
columnas separadas por filete vertical, con el primero sin `padding` izquierdo y el
último sin borde derecho.

Decisión de accesibilidad: la sección lleva `aria-labelledby` apuntando al `h2` de Pablo.
Es el encabezado real de la sección; los tres instructores son `h3` dentro de `article`.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/DojoView.astro` | editar |
| `docs/adr/0023-jerarquia-equipo-docente.md` | crear |
| `docs/INDEX.md` | editar |
| `docs/TASKS.md` | editar |
| `docs/HANDOFF-CLAUDE-CODE.md` | editar |

### Disjunta?

**Sí.** La única spec abierta es la 0021 (editor del backoffice), que toca
`src/lib/publish.ts`, `src/pages/admin/**` y `src/components/admin/**`. Cero solape.

## Verificacion

- [x] `npm run typecheck` → 48 archivos, 0 errores / 0 warnings / 0 hints
- [x] `npm run build` → 44 `index.html` en `.vercel/output/static`
- [x] `npm test` → 5/5
- [x] `git diff --check` limpio
- [x] Producción: `/dojo` y sus tres traducciones sirven un solo bloque de equipo docente

## Abierto

- **Retratos reales.** Las tres fichas muestran escenas de práctica, no a la persona que
  nombran. Cuando el cliente entregue fotos, sustituir `teacherPhotos` sin tocar la
  composición. Es deuda visible para cualquiera que mire la página.
- Las imágenes siguen servidas desde `static.wixstatic.com`, como el resto del sitio.
