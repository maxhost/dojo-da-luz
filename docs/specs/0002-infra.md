---
spec: 0002
fecha: 2026-09-17
estado: implementada
resumen: Infra desplegable: adapter de Vercel, proyecto Neon en Frankfurt, migracion inicial versionada en el repo y un endpoint /api/health que prueba SSR + DB en el deploy real.
disjunta: si
archivos: astro.config.mjs, src/lib/db.ts, src/pages/api/health.ts, db/migrations/**, .env.example
---

# 0002 — Infra de deploy

## Problema

El scaffold builda en local pero no hay forma de desplegarlo ni de saber si el entorno real
funciona. Falta: adapter, base de datos, y **una señal verificable de que el deploy anda**.

Sin esa señal, "deberia desplegar bien" es exactamente el tipo de afirmacion que este
proyecto no acepta.

## Alcance

**Entra:**
- `@astrojs/vercel` con `output: 'static'`. Las paginas siguen prerenderizadas; solo las
  rutas marcadas `prerender = false` se vuelven funciones.
- Proyecto Neon `dojo-da-luz` (`silent-wave-15401445`) en `aws-eu-central-1` (Frankfurt,
  lo mas cerca de Lisboa que ofrece Neon). Lo creo Maxi; trae **Neon Auth** provisionado.
- Migracion inicial **como archivo SQL en el repo** (`db/migrations/0001_init.sql`),
  aplicada a Neon. El repo es la fuente de verdad del schema; Neon es donde se aplico.
- `src/lib/db.ts` — cliente `@neondatabase/serverless`.
- `GET /api/health` — unica ruta SSR. Devuelve `{ ok, db }` tras un `select 1`.

**No entra:**
- Backoffice, auth, emision de facturas. Specs 0003 y 0004.
- Cualquier ORM. Tres tablas y ~4 queries por mes no justifican una capa mas.
- `vercel.json`. El adapter genera el Build Output; una config manual encima solo puede
  contradecirlo.

## Diseño

**Schema** (tres tablas, sin ORM):

- `alumno` — nombre, email, nif, morada.
- `serie` — la serie de facturacion y su `proximo_numero`. Es la config que pidio el
  cliente: "poner la serie y el numero donde comienza".
- `factura` — `unique (serie, numero)`, y **copia congelada** de nombre/nif/morada del
  alumno al momento de emitir. Una factura emitida no puede cambiar porque el alumno
  actualizo su direccion: es un documento, no una vista.

`r2_key` guarda la clave del PDF. Segun ADR-0003, ese objeto es el documento conservado y
su nombre lleva serie y numero, asi que el estado de facturacion es reconstruible desde R2.

**`/api/health` es el oraculo del deploy.** No es andamiaje: es lo que convierte "creo que
desplego" en una verificacion. Se queda mientras el proyecto tenga runtime.

## Archivos

| Archivo | Accion |
|---|---|
| `astro.config.mjs` | editar — adapter |
| `db/migrations/0001_init.sql` | crear |
| `src/lib/db.ts` | crear |
| `src/pages/api/health.ts` | crear |
| `.env.example` | editar |

### Disjunta?

**Si.** La spec 0001 esta implementada y solo toca `astro.config.mjs`, que aca se edita en
una linea (el adapter). No hay otras specs abiertas.

## Verificacion

Corrida el 2026-09-17:

- [x] `npm run typecheck` → 0 errors, 0 warnings
- [x] `npm run build` → 4 HTML estaticos en `.vercel/output/static/` y **una** funcion
      (`_render.func`). El `config.json` rutea `^/api/health$` a la funcion y todo lo
      demas resuelve por `filesystem`.
- [x] Las 4 paginas siguen con **0 scripts ejecutables**
- [x] `/_astro/*` sale con `cache-control: public, max-age=31536000, immutable`
- [x] Barra final → 308 a la URL sin barra, coherente con el canonical
- [x] Migracion aplicada en `silent-wave-15401445`: `alumno` (7 cols), `factura` (12) y
      `serie` (3) existen en el schema `public`
- [x] `GET /api/health` contra Neon real → `{"ok":true,"db":"up","ms":1105}` en frio y
      `{"ok":true,"db":"up","ms":195}` en caliente, desde local hasta Frankfurt

## Abierto

El deploy a Vercel necesita el repo en GitHub y la cuenta conectada. Hasta entonces lo
verificado es el build output, no una URL.
