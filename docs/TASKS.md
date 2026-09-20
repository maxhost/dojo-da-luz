# TASKS

**Estado actual del proyecto. Este es el punto de retorno.**

Si una sesion se cae, se cierra o se compacta, se vuelve aca — no al chat. Hay un hook
`Stop` que bloquea el fin del turno si se toco codigo y este archivo quedo viejo.

Regla: **marcar `hecho` solo con verificacion real** — tests que pasan, comando corrido,
cosa vista en pantalla. No "deberia andar".

Ultima actualizacion: 2026-09-19 — galerías de Adultos y Crianças (0024) desplegadas y verificadas en producción. Queda la 0021: el editor del backoffice.

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

**El push a GitHub ya despliega.** La GitHub App de Vercel quedo autorizada sobre el repo
el 2026-09-18 y el webhook dispara: hay un deployment con `source: git` y
`meta.githubCommitSha = ed3b3af` que Vercel creo solo. Antes de eso el link estaba
`"sourceless": true` y no llegaba nada.

**Si un deployment se queda en `Queued`, mirar primero el estado de Vercel**
(`https://www.vercel-status.com/api/v2/incidents/unresolved.json`). El 2026-09-18 habia un
incidente abierto — "Elevated Errors Triggering Deployments" — y `dpl_tFuJezQqKJC4EDBAGhnhotfysJYF`
llevaba mas de 12 minutos en cola sin empezar a construir. No es del repo ni del proyecto:
no tiene arreglo local, se espera. Produccion sigue sirviendo el deployment anterior.

Deploy manual, cuando haga falta saltarse el webhook:

```sh
vercel --prod                 # build y deploy de produccion
vercel ls dojo-da-luz         # esperar ● Ready
vercel alias set <url-del-deployment> dojo-da-luz.vercel.app
```

**Ojo con el alias.** La URL publica es `dojo-da-luz.vercel.app`, pero el deploy nuevo no
la tomo solo: quedo en `dojo-da-l4avxyfws-…` y hubo que asignarla a mano con
`vercel alias set`. Los dominios `*-maxhost27-6230s-projects.vercel.app` estan detras de
Vercel Authentication y responden 302: no sirven para verificar nada. Despues de cada
deploy, comprobar contra `dojo-da-luz.vercel.app`, no contra la URL del deployment.

**Ojo con `GH_TOKEN`.** El 2026-09-19 `git push` fallo con "Invalid username or token":
la variable de entorno `GH_TOKEN` del shell esta vencida y tapa al token del keyring de
`gh`. Se empuja con `env -u GH_TOKEN -u GITHUB_TOKEN git push origin main`. Con el push,
el webhook crea el deployment y el alias `dojo-da-luz.vercel.app` se actualiza solo — el
`vercel alias set` a mano solo hizo falta con deploys por CLI.

**Falta para el lanzamiento real:** dominio propio `aikido-duran.com` (hoy en Wix), los
301 de las 34 URLs viejas, sitemap/robots y los endpoints de formulario.

**Backoffice vivo en local.** `/admin` con login real: sesion de 8 h en Neon, cookie
`bo_session` `HttpOnly`/`SameSite=Lax`, 5 intentos por email cada 15 minutos y
`X-Robots-Tag: noindex` en todas sus respuestas. El admin se siembra con
`ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:seed`, que ademas cierra todas las
sesiones abiertas — hoy es el unico camino de recuperacion hasta la spec 0022.

## Siguiente

| # | Tarea | Spec | Estado | Notas |
|---|---|---|---|---|
| 1 | Baseline: crawl de las 34 URLs (texto, title, description, H1) + imagenes originales de wixstatic en alta | — | proximo | No depende de nadie. |
| 2 | Export de Google Search Console 16 meses | — | bloqueada | Necesita acceso del cliente. |
| 3 | Migración de contenido y páginas: Aulas, Aikido, Dojo, Pablo Durán, Contacto y Otras Artes | 0010–0017 | hecho | Sitemap de páginas completo en pt/es/fr/en. Agenda retirada. Quedan endpoints operativos separados. |
| 4 | Diseño visual | 0003–0009 / ADR-0010 | hecho | Estructura tradicional productiva, video hero e información práctica en HTML; paridad pt/es/fr/en. |
| 5 | Deploy real: Vercel conectado al repo + `DATABASE_URL` en env | — | hecho | https://dojo-da-luz.vercel.app sirve las 36 rutas y `/api/health` responde contra Neon. Falta el dominio propio (tarea 10). |
| 5c | Autorizar la GitHub App de Vercel sobre `maxhost/dojo-da-luz` | — | hecho | Autorizada por el cliente. Vercel ya crea deployments con `source: git`. |
| 5b | Borrar el proyecto Neon huerfano `bitter-tree-51605379` | — | pendiente | Lo cree yo antes de que existiera `silent-wave`. El MCP quedo scopeado y no puede borrarlo: va por consola. |
| 6 | Spec 0019 — backoffice: login y sesion | 0019 | hecho | `/admin` con guard por Host, noindex, rate limit y sesion en Neon. Sin reset por email: eso es la 0022. |
| 6d | Spec 0022 — recuperacion de contraseña por Resend | 0022 | bloqueada | Decision del cliente: arrancar sin Resend. Necesita `RESEND_API_KEY`. Mientras tanto la contraseña se repone con `npm run admin:seed`. |
| 6b | Spec 0020 — dojos como entidad y render en la home | 0020 | hecho | 3 dojos en `content/dojos.json` con horarios estructurados. Falta migrar Aulas y Contacto a la entidad (fila 6f). |
| 6f | Migrar Aulas y Contacto a la entidad de dojos | — | pendiente | Hoy `classes.schedule.venues` y `contact.venues` siguen duplicando sedes y horarios en 4 idiomas. Ahi entra `transporte` en la entidad. |
| 6c | Spec 0023 — capa GEO (resumen en Home, Q&A en Aulas/Adultos/Niños, robots, llms.txt) | 0023 | hecho | 13 pares Q&A por idioma con `FAQPage`. Falta que el cliente confirme precios y edades: hoy salen del contenido que ya estaba publicado. |
| 6e | Spec 0021 — editor de Home y CRUD de dojos en el BO | 0021 | proximo | Spec cerrada. Ultimo de la cadena: 0019 → 0020 → 0023 → 0021. Necesita `GITHUB_TOKEN`. |
| 7 | Alumnos + emision de factura + PDF a R2 + envio Resend | — | pendiente | Necesita una factura de ejemplo real. Spec sin escribir: el numero 0004 del INDEX es otra cosa. |
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

**Repo publico y backoffice que commitea.** El ADR-0002 asumia repo privado; hoy
`maxhost/dojo-da-luz` es publico. No hay secretos en el arbol, asi que no cambia el diseño,
pero conviene decidirlo antes de que el BO empiece a escribir el historial de ediciones del
cliente en un repo abierto.

*(La duda de auth — Neon Auth o propio — quedo cerrada por el ADR-0015: propia, email y
contraseña, sesion opaca en Neon.)*

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
| 2026-09-19 | Spec 0023 — capa GEO | `astro check` 0/0/0, `npm test` 5/5, build con 36 estaticas + `/llms.txt`; resumen visible en las 4 homes; 6/3/4 preguntas visibles en Aulas/Adultos/Niños × 4 idiomas con un `FAQPage` por pagina; una respuesta de 10 caracteres rompe el build nombrando el campo; `robots.txt` con 7 bloques y ningun `Disallow: /`; `llms.txt` con los 4 idiomas; la home sigue con un solo `<script type="application/ld+json">` |
| 2026-09-19 | Spec 0020 — dojos como entidad | `astro check` 0/0/0, `npm test` 5/5, build con 36 estaticas; las 4 homes muestran Benfica, Lumiar y Encarnação con sus horarios; dias traducidos y horas identicas en los 4 idiomas; JSON-LD con 3 `SportsActivityLocation` y `openingHoursSpecification`, sin claves nulas; archivar un dojo lo saca de las 4 homes y del JSON-LD; `hasta` anterior a `desde`, slug repetido y cero activos rompen el build nombrando el campo |
| 2026-09-18 | Spec 0019 — login del backoffice | `npm test` 5/5 en `auth.test.ts`; `astro check` 0/0/0; build con 36 estaticas y `/admin/*` como funcion; en `astro dev`: password mala → 401 sin sesion, buena → 302 + cookie `HttpOnly; SameSite=Lax`, `/admin` sin cookie → 302, salir invalida la cookie vieja, sexto intento fallido → 429, `X-Robots-Tag` presente, y con `BO_HOST` el host correcto da 200 y cualquier otro 404 |
| 2026-09-18 | GitHub App autorizada: el push dispara deploy | `dpl_tFuJezQqKJC4EDBAGhnhotfysJYF` con `source: git` y `meta.githubCommitSha = ed3b3af`, creado por Vercel sin intervencion. Quedo en cola por el incidente "Elevated Errors Triggering Deployments" del propio Vercel |
| 2026-09-18 | Diagnostico del auto-deploy | `GET /v9/projects/...` devuelve `link.sourceless: true`; el push de `b7c7ab0` no genero ningun deployment en `vercel ls` |
| 2026-09-19 | Spec 0024 — galerías de Adultos y Crianças | `astro check` 0/0/0, tests 5/5 y build con 36 páginas; las 8 rutas de audiencia contienen 6 medios, 1 vídeo con controles y carga diferida de imágenes; `git diff --check` limpio |
| 2026-09-19 | Deploy de las galerías a producción | `git push origin main` → `c1b2266`; deployment `dojo-da-43utj2x3l` ● Ready por webhook de GitHub; las 8 rutas de audiencia en `dojo-da-luz.vercel.app` devuelven 200 con 6 medios, 1 `<video>` y el rótulo de galería en pt/es/fr/en; el mp4 remoto responde 206 |

## Descartado (y por que)

Los caminos descartados importan: sin registro, se reintentan.

| Que | Por que no |
|---|---|
