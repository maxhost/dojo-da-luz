# Handoff — accesos de audiencias desde la Home

Fecha de corte: 2026-09-19.

Este archivo es el punto de reentrada después de `/clear`. Antes de continuar, leer
`docs/TASKS.md`, `docs/INDEX.md`, `docs/adr/0020-accesos-audiencias-home.md` y
`docs/specs/0025-accesos-audiencias-home.md`. No reconstruir el estado desde el chat.

## Pedido y resultado

El cliente pidió hacer visibles las dos páginas principales de práctica —Adultos y
Crianças— directamente desde la Home, porque hasta ahora estaban escondidas detrás de
Aulas y su selector.

La spec 0025 está implementada localmente:

- `HomeView.astro` incluye una sección nueva antes de sedes y horarios.
- La sección muestra dos tarjetas completas enlazables: Adultos y Crianças.
- Cada tarjeta reutiliza título, introducción, foto y texto alternativo desde
  `content/*/adults.json` o `content/*/children.json`; no duplica ese contenido en Home.
- Los textos de encuadre y CTA viven en `home.audiences` y están traducidos en pt/es/fr/en.
- Los enlaces salen de `pathFor('adults' | 'children', locale)` y respetan las rutas
  canónicas localizadas.
- La numeración narrativa posterior de la Home pasó de 02–04 a 03–05.
- No se añadió JavaScript ejecutable.

## Working tree sin commit

Todos los cambios actuales pertenecen a este lote:

```text
 M content/en/home.json
 M content/es/home.json
 M content/fr/home.json
 M content/pt/home.json
 M docs/HANDOFF-CLAUDE-CODE.md
 M docs/INDEX.md
 M docs/TASKS.md
 M src/components/HomeView.astro
 M src/lib/content.ts
?? docs/adr/0020-accesos-audiencias-home.md
?? docs/specs/0025-accesos-audiencias-home.md
```

No hay commit ni push de la spec 0025. El último commit existente al corte es
`19dafa0 docs: deploy de las galerías verificado en producción`.

## Archivos clave

- `src/components/HomeView.astro`: carga ambos contenidos de audiencia y renderiza las
  dos tarjetas.
- `src/lib/content.ts`: `homeSchema` valida el objeto nuevo `audiences`.
- `content/{pt,es,fr,en}/home.json`: textos localizados y numeración de secciones.
- `docs/adr/0020-accesos-audiencias-home.md`: decisión de producto.
- `docs/specs/0025-accesos-audiencias-home.md`: alcance y verificación, marcada
  `implementada`.
- `docs/TASKS.md`: estado actualizado; indica que este lote aún queda por desplegar.

## Verificación ejecutada

Se ejecutó después de implementar:

```sh
npm run typecheck
npm test
npm run build
git diff --check
```

Resultados:

- Astro check: 0 errores, 0 warnings, 0 hints en 44 archivos.
- Tests: 5/5.
- Build: 36 páginas estáticas más `/llms.txt`.
- Las cuatro Homes generadas contienen sus dos enlaces directos localizados:
  - PT: `/aulas/adultos` y `/aulas/criancas`
  - ES: `/es/clases/adultos` y `/es/clases/ninos`
  - FR: `/fr/cours/adultes` y `/fr/cours/enfants`
  - EN: `/en/classes/adults` y `/en/classes/children`
- Las cuatro Homes contienen las fotos de Adultos y Crianças.
- Cero scripts ejecutables en las Homes; permanece únicamente el JSON-LD existente.
- `git diff --check` limpio.

## Próximo paso seguro

Revisar visualmente la nueva sección si el cliente lo desea. Si se aprueba, hacer commit,
push y verificar el deployment automático en `https://dojo-da-luz.vercel.app`.

Antes de commitear:

```sh
git status --short
npm run typecheck
npm test
npm run build
git diff --check
```

No descartar ni sobrescribir el working tree. No usar `git reset --hard` ni
`git checkout --`. Para el push, recordar que el `GH_TOKEN` del shell estaba vencido y
tapaba el token válido del keyring:

```sh
env -u GH_TOKEN -u GITHUB_TOKEN git push origin main
```

Después del push, esperar el deployment por webhook y comprobar la URL pública, no una
URL protegida del equipo de Vercel.

## Pendientes generales que no pertenecen a este lote

La fuente de verdad es `docs/TASKS.md`. En especial siguen pendientes el crawl/redirects
del Wix, sitemap final, endpoints de formularios, datos NAP del cliente y la spec 0021 del
editor de Home/dojos en el backoffice. No mezclarlos con el commit de la spec 0025.
