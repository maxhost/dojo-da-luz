# Handoff — corte del 2026-09-21

Registro del ultimo corte cerrado, no lista de pendientes. **El estado real del proyecto
esta en `docs/TASKS.md`**; este archivo solo explica que se cerro por ultima vez y con
que se verifico.

## Que se cerro

**Spec 0027 — jerarquia del equipo docente en `/dojo`** (ADR-0023).

`/dojo` renderizaba cuatro profesores con la misma seccion a pantalla completa,
alternando el lado de la imagen y repitiendo el mismo retrato cuatro veces. Ahora es una
sola seccion con dos niveles:

- **Pablo Duran** como bloque protagonista: retrato vertical `4/5` con marco azul
  desplazado, nombre hasta `text-7xl`, biografia completa con filete lateral y el boton
  a su pagina propia.
- **Ines Martins, Miguel Costa y Sofia Almeida** en tres fichas compactas sobre fondo
  `#211e1b`, separadas por filetes: imagen `4/3`, nombre, credenciales y dos parrafos.
- En movil las fichas se apilan; desde `md` forman tres columnas.
- Sin rotulo «Equipo docente» ni numeracion: el cliente las pidio fuera.
- Los cuatro idiomas heredan la jerarquia sin tocar contenido.

El cambio funcional vivio solo en `src/components/DojoView.astro`.

## Procedencia y deuda de proceso

El codigo llego implementado desde otra herramienta, **sin spec previa**, contra el flujo
de `CLAUDE.md`. La spec 0027 y el ADR-0023 se escribieron despues, a partir del diff, y lo
dejan anotado en su encabezado. Se documenta el incumplimiento en vez de disimularlo: lo
que no esta en `docs/` no sobrevive a la proxima sesion.

## Deuda de producto abierta

Las tres imagenes de las fichas secundarias son **fotografias de practica ya alojadas en
Wix, recortadas con `fp_` distintos** — no retratan a la persona que nombran. No existen
retratos individuales de esos docentes. Cuando el cliente los entregue, se sustituye el
array `teacherPhotos` de `DojoView.astro` sin tocar la composicion. Es la fila 11 de
`docs/TASKS.md`.

## Verificacion ejecutada

```sh
npm run typecheck   # astro check: 48 archivos, 0 errores / 0 warnings / 0 hints
npm test            # 5/5
npm run build       # 44 index.html en .vercel/output/static
git diff --check    # limpio
```

Commit `335976d`, empujado a `origin/main`; el webhook de Vercel creo el deployment de
produccion solo.

## Como seguir

1. `docs/TASKS.md` → seccion **Siguiente**. El proximo de la cadena es la **spec 0021**:
   el editor de Home y CRUD de dojos en el backoffice. Necesita `GITHUB_TOKEN`.
2. Para empujar: `env -u GH_TOKEN -u GITHUB_TOKEN git push origin main` — la `GH_TOKEN`
   del shell esta vencida y tapa al token del keyring de `gh`.
3. Verificar siempre contra `dojo-da-luz.vercel.app`, nunca contra la URL del deployment
   (`*-maxhost27-6230s-projects.vercel.app` esta detras de Vercel Authentication y
   devuelve 302).
