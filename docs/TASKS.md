# TASKS

**Estado actual del proyecto. Este es el punto de retorno.**

Si una sesion se cae, se cierra o se compacta, se vuelve aca — no al chat. Hay un hook
`Stop` que bloquea el fin del turno si se toco codigo y este archivo quedo viejo.

Regla: **marcar `hecho` solo con verificacion real** — tests que pasan, comando corrido,
cosa vista en pantalla. No "deberia andar".

Ultima actualizacion: 2026-09-18 — lote publico completo (specs 0008-0018, ADR 0010-0014) publicado en `origin/main` y desplegado en produccion: https://dojo-da-luz.vercel.app

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

**Próximo paso de producto: cerrar el inventario de URLs Wix y materializar los 301.**
Las páginas públicas previstas ya están construidas en cuatro idiomas. El formulario de
Contacto queda visible pero sin envío hasta confirmar email/endpoint; el formulario de
Adultos todavía usa el destino Wix heredado. Agenda no se construirá.

El lote descrito en `docs/HANDOFF-CLAUDE-CODE.md` ya fue revisado, commiteado y empujado: 36 rutas
prerenderizadas, `astro check` en 0/0/0 y `git diff --check` limpio. Ese archivo queda como
registro del corte, no como trabajo pendiente.

**Produccion viva.** Proyecto Vercel `dojo-da-luz` (`prj_q6TX7OfOiiKJob6RxZBde0Umo2nA`,
equipo `maxhost27-6230s-projects`), conectado al repo `maxhost/dojo-da-luz` y con
`DATABASE_URL` ya cargada: `GET /api/health` responde `{"ok":true,"db":"up"}` desde la URL
publica. Las 16 rutas comprobadas devuelven 200 en pt/es/fr/en.

**Ojo con el alias.** La URL publica es `dojo-da-luz.vercel.app`, pero el deploy nuevo no
la tomo solo: quedo en `dojo-da-l4avxyfws-…` y hubo que asignarla a mano con
`vercel alias set`. Los dominios `*-maxhost27-6230s-projects.vercel.app` estan detras de
Vercel Authentication y responden 302: no sirven para verificar nada. Despues de cada
deploy, comprobar contra `dojo-da-luz.vercel.app`, no contra la URL del deployment.

**Falta para el lanzamiento real:** dominio propio `aikido-duran.com` (hoy en Wix), los
301 de las 34 URLs viejas, sitemap/robots y los endpoints de formulario.

## Siguiente

| # | Tarea | Spec | Estado | Notas |
|---|---|---|---|---|
| 1 | Baseline: crawl de las 34 URLs (texto, title, description, H1) + imagenes originales de wixstatic en alta | — | proximo | No depende de nadie. |
| 2 | Export de Google Search Console 16 meses | — | bloqueada | Necesita acceso del cliente. |
| 3 | Migración de contenido y páginas: Aulas, Aikido, Dojo, Pablo Durán, Contacto y Otras Artes | 0010–0017 | hecho | Sitemap de páginas completo en pt/es/fr/en. Agenda retirada. Quedan endpoints operativos separados. |
| 4 | Diseño visual | 0003–0009 / ADR-0010 | hecho | Estructura tradicional productiva, video hero e información práctica en HTML; paridad pt/es/fr/en. |
| 5 | Deploy real: Vercel conectado al repo + `DATABASE_URL` en env | — | hecho | https://dojo-da-luz.vercel.app sirve las 36 rutas y `/api/health` responde contra Neon. Falta el dominio propio (tarea 10). |
| 5b | Borrar el proyecto Neon huerfano `bitter-tree-51605379` | — | pendiente | Lo cree yo antes de que existiera `silent-wave`. El MCP quedo scopeado y no puede borrarlo: va por consola. |
| 6 | Spec 0003 — backoffice: auth magic link + contenido -> commit a GitHub | 0003 | pendiente | |
| 7 | Spec 0004 — alumnos + emision de factura + PDF a R2 + envio Resend | 0004 | pendiente | Necesita una factura de ejemplo real. |
| 8 | Redirects 301 de las 34 URLs viejas | — | plan definido | Matriz conceptual documentada. Falta crawl final, Search Console e implementación cuando existan todos los destinos. |
| 9 | Sitemap + robots.txt | — | pendiente | Con el set completo de paginas. |
| 10 | Apuntar `aikido-duran.com` a Vercel | — | pendiente | Hoy resuelve a Wix. Va junto con la tarea 8: sin los 301 no se corta. Necesita accesos de DNS del cliente. |

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
| 2026-09-17 | Spec 0003 — mockup movil de home | `npm run typecheck` sin errores; build genera `/mockup/`; HTML generado sin `<script>` |
| 2026-09-17 | Documentación integral de rediseño | 7 documentos enlazados desde `docs/design/README.md` y `docs/INDEX.md` |
| 2026-09-17 | Legibilidad tipográfica de home | Cuerpo principal a 17/30 px; rótulos de sección a 12/18 px; contraste secundario elevado |
| 2026-09-17 | Comparador de home A/B | Dos rutas prerenderizadas, enlaces recíprocos, `aria-current` correcto y cero scripts |
| 2026-09-17 | Diseño C — paisaje narrativo | `/mockup-c/` prerenderizado; selector A/B/C; narrativa completa; cero scripts/gradientes/sombras |
| 2026-09-17 | Consolidación de dirección C | Única ruta `/mockup/`; Encarnação y selector ausentes; docs alineados; typecheck/build limpios |
| 2026-09-17 | Spec 0007 — home productiva con el Diseño C | `npm run typecheck` 0 errores; build emite `/`, `/es/`, `/fr/`, `/en/` (no `/mockup/`); `rg mockup src/` vacío; HTML sin `<script>` ejecutable; hreflang recíproco correcto |
| 2026-09-18 | Spec 0008 — home tradicional y contenido rastreable | `npm run typecheck` 0 errores; `npm run build` emite 4 idiomas; sedes y horarios presentes como HTML; `git diff --check` limpio |
| 2026-09-18 | Spec 0009 — video centrado en hero | `npm run typecheck` 0 errores; `npm run build` emite 4 idiomas; atributos de video y poster presentes en HTML; `git diff --check` limpio |
| 2026-09-18 | Arquitectura de URLs y plan de redirects | Matriz por idioma, reglas 301/410/PDF, secuencia de páginas y gate de lanzamiento en `docs/design/09-arquitectura-urls-y-redirects.md`; enlaces actualizados en INDEX/README |
| 2026-09-18 | Spec 0010 — Aulas productivas | `npm run typecheck` 0 errores; build emite `/aulas`, `/es/clases`, `/fr/cours`, `/en/classes`; canonical/hreflang recíprocos y horarios, cuotas, anchors verificados en HTML |
| 2026-09-18 | Menú global localizado | Home y Aulas comparten 5 destinos en pt/es/fr/en; paths generados por `siteNav()`; `/es` sustituye el enlace manual erróneo `/es/`; typecheck/build limpios |
| 2026-09-18 | Spec 0011 — traducciones de Home | Sin `Placeholder` en `content/*/home.json`; H1 y CTAs es/fr/en verificados en HTML; typecheck/build y `git diff --check` limpios |
| 2026-09-18 | ADR-0011 — audiencias y formularios | Arquitectura corregida: Aulas como resumen, landing pages Adultos/Niños, medios preservados y modal con destino específico por actividad |
| 2026-09-18 | Spec 0012 — Adultos y Niños | 8 rutas nuevas; formularios diferenciados y lazy; 16 rutas totales en build; typecheck y `git diff --check` limpios |
| 2026-09-18 | ADR-0012 + spec 0013 | Agenda retirada; Aikido publicado en pt/es/fr/en; build con 20 rutas, canonical/hreflang y menú localizado verificados |
| 2026-09-18 | Spec 0014 — Dojo y Contacto | 8 rutas nuevas; build con 28 rutas; professor/linaje/transporte/formulario en HTML; canonical, menú y typecheck verificados |
| 2026-09-18 | Spec 0015 — Otras Artes | 4 rutas nuevas; build con 32 rutas; Shiatsu/Iaido/Tai Chi y horarios en HTML; formularios Iaido/Tai Chi distintos y lazy; canonical/hreflang, menú, typecheck y `git diff --check` verificados |
| 2026-09-18 | Spec 0016 — CTA en hero de audiencias | Los 8 HTML de Adultos/Niños contienen 2 CTAs y 1 solo modal; formularios por audiencia conservados; typecheck/build y `git diff --check` limpios |
| 2026-09-18 | ADR-0013 + spec 0017 — Pablo Durán | 4 rutas nuevas y 36 totales; biografía, cronología, formación y linaje en HTML; JSON-LD `Person` parseado; enlaces Dojo, canonical/hreflang y mapa 301 verificados |
| 2026-09-18 | ADR-0014 + spec 0018 — idiomas, redes y handoff | 36 páginas con banderas accesibles y Facebook en cabecera/menú móvil/pie; perfiles no verificados omitidos; handoff de push escrito; typecheck/build y `git diff --check` limpios |
| 2026-09-18 | Revision y commit del lote publico completo (specs 0008-0018, ADR 0010-0014) | `npm run typecheck` 0 errores/0 warnings/0 hints; `npm run build` con 36 `index.html` en `.vercel/output/static`; `git diff --check` limpio; `git status --porcelain -uall` sin archivos ajenos al lote |
| 2026-09-18 | Push del lote publico a GitHub | `git push origin main` → `6de1c9c..4bd7fd3`; `git ls-remote origin refs/heads/main` devuelve `4bd7fd3` |
| 2026-09-18 | Deploy de produccion en Vercel | `vercel git connect` (repo ya vinculado) + `vercel alias set` sobre `dpl_55BEsW9Q8mENbx2iUec2aJM3Cbr6`; 16 rutas pt/es/fr/en devuelven 200 en `dojo-da-luz.vercel.app`; `/api/health` → `{"ok":true,"db":"up"}`; home con video, hreflang, Facebook y un unico `<script type="application/ld+json">` |

## Descartado (y por que)

Los caminos descartados importan: sin registro, se reintentan.

| Que | Por que no |
|---|---|
