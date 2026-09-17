# TASKS

**Estado actual del proyecto. Este es el punto de retorno.**

Si una sesion se cae, se cierra o se compacta, se vuelve aca — no al chat. Hay un hook
`Stop` que bloquea el fin del turno si se toco codigo y este archivo quedo viejo.

Regla: **marcar `hecho` solo con verificacion real** — tests que pasan, comando corrido,
cosa vista en pantalla. No "deberia andar".

Ultima actualizacion: 2026-09-17 — scaffold + infra de deploy (specs 0001 y 0002).

## Contexto

Rediseño de https://www.aikido-duran.com/ (Dojo da Luz / Aikido-Duran, Lisboa, asociacion
sin fines de lucro). Hoy: **Wix**, 34 URLs, 4 idiomas (pt/es/fr/en), sin hreflang.
Trafico: ~3000 impresiones y ~200 visitas / 90 dias. ~4 facturas/mes.
Objetivos del cliente: mantener contenido, quitar cosas, **backoffice** para alumnos +
datos fiscales + emision de facturas por email. Prioridad: carga hiper rapida, mantener
SEO actual, mejorar GEO.

## Ahora

**Scaffold hecho y verificado** (spec 0001): Astro estatico, 4 idiomas, contenido JSON
validado con zod, head de SEO completo. `dist/` entero pesa 28K y no lleva un solo script
ejecutable.

El contenido de `content/` es **placeholder**. La migracion del contenido real es trabajo
aparte y no forma parte del scaffold.

**Infra lista.** Proyecto Neon `dojo-da-luz` (`silent-wave-15401445`, aws-eu-central-1,
pg18) con las 3 tablas aplicadas. El build emite las 4 paginas estaticas y una sola
funcion, y `/api/health` responde contra Neon: 195ms en caliente desde local.

**Proximo paso: el deploy real.** Falta subir el repo a GitHub y conectar Vercel, y cargar
`DATABASE_URL` en las env vars del proyecto. El connection string esta en `.env` local
(ignorado por git) y en la consola de Neon.

## Siguiente

| # | Tarea | Spec | Estado | Notas |
|---|---|---|---|---|
| 1 | Baseline: crawl de las 34 URLs (texto, title, description, H1) + imagenes originales de wixstatic en alta | — | proximo | No depende de nadie. |
| 2 | Export de Google Search Console 16 meses | — | bloqueada | Necesita acceso del cliente. |
| 3 | Migracion de contenido: home real + las otras 10 paginas en los 4 idiomas + nav | — | pendiente | Tras baseline. Amplia `ROUTES` en `src/lib/i18n.ts`. |
| 4 | Diseño visual | — | pendiente | El scaffold es marcado semantico sin maquetar. |
| 5 | Deploy real: repo a GitHub + conectar Vercel + `DATABASE_URL` en env | — | proximo | Verificar `/api/health` en la URL de produccion. |
| 5b | Borrar el proyecto Neon huerfano `bitter-tree-51605379` | — | pendiente | Lo cree yo antes de que existiera `silent-wave`. El MCP quedo scopeado y no puede borrarlo: va por consola. |
| 6 | Spec 0003 — backoffice: auth magic link + contenido -> commit a GitHub | 0003 | pendiente | |
| 7 | Spec 0004 — alumnos + emision de factura + PDF a R2 + envio Resend | 0004 | pendiente | Necesita una factura de ejemplo real. |
| 8 | Mapa de redirects 301 de las 34 URLs viejas | — | pendiente | No negociable antes de lanzar. |
| 9 | Sitemap + robots.txt | — | pendiente | Con el set completo de paginas. |

## Hallazgos del sitio actual

Investigacion previa, para cuando toque migrar contenido:

- **Ingles no existe.** El sitemap tiene pt, es y fr. Sumar `en` es contenido nuevo.
- **Las versiones por idioma no son la misma pagina** (`/inicioes` y `/accueil-fr` tienen
  contenido distinto de la home pt). Hay que decidir si se busca paridad o se respeta la
  asimetria: cambia lo que significan los hreflang.
- **No publican ninguna direccion postal ni telefono.** Tres dojos y cero NAP. Es la mayor
  perdida de SEO local del sitio.

## Abierto — necesario del cliente

| Que | Bloquea |
|---|---|
| **Moradas completas, telefono y URLs de redes** de los 3 dojos | JSON-LD, SEO local, pagina de contacto |
| **Una factura de ejemplo** que emitan hoy | Spec 0004 |
| Accesos: registrador del dominio, DNS, cuenta Wix, Search Console, Google Business Profile | Lanzamiento, DKIM, tarea 2 |
| Direccion de email desde la que se envian las facturas | Config de Resend |
| Lista de paginas a eliminar | Tarea 8 |

## Abierto — decision pendiente

**Auth del backoffice: Neon Auth o magic link propio.** El proyecto Neon trae `neon_auth`
provisionado (user, session, account, verification, jwks). El ADR-0001 dijo "magic link,
1 admin, sin roles" sin saberlo. Neon Auth ya resuelve sesiones y providers, pero mete una
dependencia de runtime con Neon en el backoffice. Decidir al abrir la spec 0003 — sale un
ADR que supersede la fila de auth del 0001.

## Hecho

| Fecha | Que | Verificado con |
|---|---|---|
| 2026-09-17 | Inventario del sitio actual: 34 URLs, Wix, 3 idiomas reales, sin hreflang, sin NAP | `curl` a sitemap/robots + extraccion del HTML |
| 2026-09-17 | ADR-0001/0002/0003 + spec 0001 | Filas en `docs/INDEX.md` |
| 2026-09-17 | Spec 0001 — scaffold Astro 4 idiomas | `npm run typecheck` 0 errores; `npm run build` 4 paginas; 0 scripts ejecutables en el HTML; JSON invalido → build exit 1 |
| 2026-09-17 | Spec 0002 — infra de deploy | build: 4 HTML estaticos + 1 funcion en `.vercel/output`; 3 tablas creadas en Neon; `GET /api/health` → `{"ok":true,"db":"up"}` |

## Descartado (y por que)

Los caminos descartados importan: sin registro, se reintentan.

| Que | Por que no |
|---|---|
