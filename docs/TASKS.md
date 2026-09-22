# TASKS

**Estado actual del proyecto. Este es el punto de retorno.**

Si una sesion se cae, se cierra o se compacta, se vuelve aca — no al chat. Hay un hook
`Stop` que bloquea el fin del turno si se toco codigo y este archivo quedo viejo.

Regla: **marcar `hecho` solo con verificacion real** — tests que pasan, comando corrido,
cosa vista en pantalla. No "deberia andar".

Ultima actualizacion: 2026-09-21 — gate verde: `astro check` **0/0/0**, `npm test`
**39/39**, `npm run build` 44 rutas. Esta sesion, ocho entregas seguidas — y con la
ultima **no queda ninguna pagina de contenido del sitio sin editor**:

1. **Spec 0036** — editores de Adultos y Crianças con galeria de largo libre y YouTube
   (ADR-0031, ADR-0032). Commiteado y desplegado: `main` en `e330802`, comprobado en las
   seis paginas publicas.
2. **Spec 0037** — editor de `/aikido` (ADR-0033). Con el tercer editor de la misma forma
   se pago la deuda: el POST, la lectura de los cuatro archivos, la propagacion y el commit
   salieron a `editor-pagina.ts` + `editor-pantalla.ts`, y Adultos y Criancas se migraron
   ahi. `/aulas` **no** se migro: publica ademas `media.json` en un commit aparte.
3. **Spec 0038** — editor de `/dojo` (ADR-0034). Cuarto uso del
   molde: descriptor `pagina-dojo-edicion.ts` + `FormularioPaginaDojo.astro` + una pagina de
   tres lineas. Lo nuevo de esta pagina es que **el equipo docente estaba escrito adentro de
   `DojoView.astro`** —cuatro idiomas a mano y tres fotos de Wix— y ahora es una lista de
   largo libre en el contenido que el front renderiza. Las tres cajas de "Uma transmissão
   viva" siguen siendo tres, con su texto editable en los cuatro idiomas. `TablaFilas` gano
   columnas de tipo `imagen`.

Verificado contra el BO corriendo, no por lectura, en las specs 0037 y 0038. En la 0037: una
septima seccion creada en portugues aparecio en los cuatro idiomas marcada "sin traducir",
traducirla en español no pudo cambiar ninguna de las dos fotos ni con un POST forjado, y
quitarla la saco de los cuatro sin tocar las traducciones de las otras seis; con once
secciones la pagina numera `01…09, 10, 11`. En la 0038: un cuarto profesor creado en
portugues aparecio en los cuatro marcado "sin traducir", un POST forjado desde español con
tres fotos distintas, un quinto profesor y una cuarta caja de linaje quedo en **4
profesores, 3 cajas y las tres fotos portuguesas** —y el cambio de texto legitimo del mismo
envio si entro—, una cuarta caja forjada desde portugues dio **422**, y con la lista de
profesores vacia la franja de fichas no se pinta. La comparacion del HTML construido contra
`HEAD` dio **44 paginas, 0 distintas**: la migracion del contenido de `/dojo` dejo el sitio
byte a byte igual. Las dos quedaron desplegadas: la 0037 en `641c9e6` y la 0038 en
`cce4906` — deployment `dojo-da-aama28v6d` ● Ready en 15 s, y las cuatro `/dojo` publicas
en 200 con los tres profesores, el linaje y el bloque de Pablo. Sin cookie,
`/admin/paginas/dojo` redirige a `/admin/entrar`.
4. **Spec 0039** — editor de `/eventos` (ADR-0035). Quinto uso del molde, y el primero de
   una pagina que **se vacia**: la lista dejo de exigir entre 3 y 4 tarjetas, ahora es de
   largo libre y con cero eventos la pagina dice `emptyText` en vez de pintar una franja
   vacia. La alternancia izquierda/derecha y el numero salen de la posicion, no de un campo.
   Verificado con el BO corriendo: un quinto evento creado en portugues aparecio en los
   cuatro, un POST forjado desde español con dos fotos distintas y un sexto evento quedo en
   **5 eventos y las fotos portuguesas**, con diez eventos numera `01…09, 10` y alterna 5 de
   10, y con la lista vacia las cuatro paginas publicas no pintan ninguna tarjeta y muestran
   su texto traducido. 44 paginas construidas, **0 distintas** contra `HEAD`. Desplegada en
   `8953ddb` (deployment `dojo-da-7uhgcm95e`, Ready en 17 s) y comprobada en produccion con
   una sesion temporal: las dos pantallas nuevas —`/admin/paginas/eventos` y
   `/admin/paginas/dojo`— abren en 200 con sus bloques.
5. **Spec 0040** — editor de `/outras-artes` (ADR-0036). Sexto uso del molde. Tres cambios
   visibles ademas del editor: la portada deja de ser una franja plana y pasa a tener **foto
   de fondo** como el resto de las paginas interiores, la pagina gana una **galeria de fotos
   y videos de YouTube** —una por pagina, no una por arte, y vacia no se pinta—, y el `id`
   escrito de cada arte se borra: era un ancla que no enlazaba nadie, igual que en
   `/aikido`. Las tres artes siguen siendo tres: cada una trae un `formUrl` que no se edita
   desde el BO y viaja oculto y sembrado desde portugues. Desplegada en `cbb9ac4`
   (deployment `dojo-da-fburjdlp9`, Ready en 25 s) y comprobada en produccion: las cuatro
   paginas con la portada nueva, las anclas `arte-1..3` y la numeracion `01 02 03`, la
   galeria sin pintarse por estar vacia, y la pantalla del BO en 200 con sus siete bloques,
   5 campos de imagen y los 12 `formUrl` ocultos.
6. **Spec 0041** — editor de `/escolas` (ADR-0037). Septimo y ultimo editor de pagina. Su
   galeria era la unica distinta del sitio: un array de `{src, alt}` con `.min(4).max(8)` y
   rejilla propia escrita dentro de la vista. Ahora es la lista de medios compartida —foto
   subida o video de YouTube, largo libre, vacia no se pinta— **sin ganar titulo**: viene
   pegada al bloque de introduccion, que ya trae tres encabezados. Para poder reusar el
   componente sin inventarle un rotulo vacio, `GaleriaMedios` pasa a recibir la lista de
   medios en vez del objeto galeria; Adultos, Criancas y `/outras-artes` se migraron a la
   prop nueva y **su HTML no cambio**. Desplegada en `7af0457` (deployment
   `dojo-da-k2gbmyrzl`, Ready en 24 s) y comprobada en produccion: las cuatro paginas de
   `/escolas` con sus cuatro fotos en la rejilla nueva y cero `<iframe>`, Adultos con sus 5
   medios y `/outras-artes` con la galeria todavia vacia. **El panel del BO lista ahora once
   entradas**: Home, Aulas, Adultos, Crianças, Aikido, O dojo, Eventos, Outras artes,
   Escolas, Imágenes y Dojos.
7. **Spec 0042** — editor de `/contactos` (ADR-0038). Octavo editor, y de paso **cierra la
   fila 6f**: las sedes dejan de estar duplicadas en `contact.venues` y salen de la entidad
   de dojos, igual que en `/aulas`. Consecuencia inmediata: **Encarnação desaparece de
   `/contactos` en los cuatro idiomas** —cerro hace tiempo y era la ultima pagina que lo
   seguia publicando—. Lo unico que queda en el contenido traducible es **como se llega**,
   indexado por el `slug` del dojo, porque *Autocarros* / *Autobuses* si se traduce y la
   ficha del dojo se guarda una sola vez sin traducir (ADR-0017). El editor **no edita
   dojos**: pinta un recuadro por sede activa con su nombre como rotulo intocable, y las de
   los dojos archivados viajan ocultas para que publicar no las borre. Desplegada en
   `08e21af` (deployment `dojo-da-6oahgvyay`, Ready en 17 s) y comprobada en produccion: las
   cuatro paginas de `/contactos` con **dos** tarjetas y **cero** menciones a Encarnação en
   ellas, `/aulas` con sus dos sedes, y con sesion temporal `/admin/paginas/contactos` en
   200 con sus seis bloques, los dos recuadros visibles y el de Encarnação oculto.
8. **Spec 0043** — editor de `/professor-pablo-duran` (ADR-0039, ADR-0040). Noveno y
   **ultimo** editor: con este el panel lista doce entradas y **todas las paginas de
   contenido tienen editor**. Lo pedido era el **Percurso como listado**, y lo es: los hitos
   se añaden y se quitan desde la pestaña portuguesa y bajan a los cuatro idiomas. Los
   parrafos de biografia, formacion y enseñanza, y las cajas del linaje, tambien. `chrome`
   entro al contenido —era el unico `teacher.json` sin el— y el HTML construido quedo en
   **44 paginas, 0 distintas**. Ademas se arreglo lo que el cliente vio en la pagina
   publica: **"Percurso" estaba escrito y no se leia** —`.section-title` fija `#211f1c` y la
   franja es `#27231f`—, y se arreglo en el CSS y no en ese `<h2>`:
   `.text-white .section-title { color: inherit }`, asi que **ninguna seccion oscura futura
   puede nacer con el titulo invisible** (ADR-0040). Verificado con captura de Chrome
   headless: el titulo se lee en blanco. **Pendiente de deploy.**

**Y una noticia que llego sola: `publicarVarios` ya corrio contra GitHub.** El push del
editor de `/aikido` fue rechazado por no-fast-forward porque `origin/main` tenia el commit
`a73982d` — *"contenido: Aulas desde el backoffice (1 archivos)"*, escrito por el BO en
produccion a las 17:23. Ese mensaje solo lo emite `guardarPortugues`, o sea el camino de la
Git Data API —blobs → tree → commit → `PATCH` de la ref— que estaba pendiente desde la spec
0035. **Funciona.** Queda una cosa a la vista: el cambio que se publico fue
`"label": "Idades"` → `"Idades 1"` en `content/pt/classes.json`, aparentemente una prueba,
y **sigue publicado en `/aulas` en portugues**.

**Lo que hay que saber antes de tocar nada:**

1. **Un editor nuevo ya no se copia: se describe.** Despues de tres pantallas rechazadas
   (specs 0031, 0032, 0033), la cuarta salio aprobada porque se hizo al reves: **el
   entregable de la primera vuelta fue el layout campo por campo**, el cliente lo corrigio,
   y recien entonces se escribio codigo. Las tres veces siguientes funciono igual. Hoy el
   codigo comun vive en `src/lib/editor-pagina.ts` + `editor-pantalla.ts` y lo propio de
   cada pagina es un **descriptor** (`<pagina>-edicion.ts`) mas su formulario; los controles
   son `CampoTexto`, `CampoImagen`, `TablaFilas` y `TablaMedios`. Ver la receta de seis
   pasos en "Por donde seguir". Lo que el cliente pidio textualmente: *"un form simple donde
   tenes inputs de texto que modifican textos, inputs de texto que modifican texto de
   botones, input de imagen que modifica imagenes"*, y para las listas *"es una tablita con
   un quitar, añadir fila. Es simple."*
2. **Ya se puede ver el BO sin sacar al cliente.** `node --env-file=.env
   scripts/sesion-temporal.mjs` inserta una sesion de 40 minutos en `admin_session` y la
   imprime; `--borrar <token>` la saca. **No toca la contraseña** —`npm run admin:seed` si,
   y expulsa al cliente—. Con eso se cierra el agujero que costo tres iteraciones del
   editor: la pantalla de `/admin/paginas/aulas` se leyo de verdad antes de darla por
   hecha. Un POST necesita ademas `-H "Origin: http://localhost:4321"`.
3. **La subida a R2 ya se ejercito y funciona** (fila 6j, verificada el 2026-09-21). Un
   logo subido desde el BO llego a R2, quedo en `content/partners.json` por un commit del
   propio BO, Vercel construyo en 20 s y se ve en las cuatro homes publicas. El camino
   entero —subir, guardar, publicar, desplegar— esta comprobado de punta a punta.

## Contexto

Rediseño de https://www.aikido-duran.com/ (Dojo da Luz / Aikido-Duran, Lisboa, asociacion
sin fines de lucro). Hoy: **Wix**, 34 URLs, 4 idiomas (pt/es/fr/en), sin hreflang.
Trafico: ~3000 impresiones y ~200 visitas / 90 dias. ~4 facturas/mes.
Objetivos del cliente: mantener contenido, quitar cosas, **backoffice** para alumnos +
datos fiscales + emision de facturas por email. Prioridad: carga hiper rapida, mantener
SEO actual, mejorar GEO.

## Ahora

### Por donde seguir (corte del 2026-09-21, tercera sesion)

**Todas las paginas de contenido tienen editor**: `/` (Home), `/aulas`,
`/aulas/adultos`, `/aulas/criancas`, `/aikido`, `/dojo`, `/eventos`, `/outras-artes`,
`/escolas`, `/contactos` y `/professor-pablo-duran` (specs 0021 y 0035 a 0043). El recorrido
de editores esta cerrado.

### Lo que sigue: desplegar, y despues ya no hay editores

La spec 0043 cerro el recorrido. **Lo inmediato es el deploy** del commit de esta sesion y
comprobarlo en produccion, como las siete veces anteriores: las cuatro paginas publicas de
`/professor-*` en 200, "Percurso" legible, y `/admin/paginas/professor` en 200 con sesion
temporal.

Las tres gotchas que la sesion anterior dejo anotadas, ya resueltas o decididas:

1. **Los cinco textos del borde** estaban dentro de `TeacherView.astro`: pasaron a `chrome`
   en el contenido, y el HTML construido no cambio ni un byte. Hecho.
2. **El JSON-LD `Person` con `name: 'Pablo Durán'` escrito a mano**: se deja y se dice por
   que (ADR-0039). No es texto de la pagina sino dato para buscadores, y el dia que el
   profesor no sea Pablo el cambio es de ruta, no de campo.
3. **El linaje duplicado con `/dojo`**: **no se unifico, y ahora los dos tienen editor**, o
   sea que se pueden desincronizar. Es una decision de modelo de contenido —cual manda, o
   si pasa a ser entidad como los dojos— y necesita su propia spec. Queda abierta.

**La receta, ya probada tres veces.** Con el modulo generico, un editor nuevo es:

1. Leer el JSON y la vista y **enumerar los campos**. Buscar constantes escritas dentro del
   componente: en `/aikido` eran dos fotos y cinco textos, en `/aulas` eran dos botones.
   `grep` de cada campo del JSON en `src/` para no poner en el formulario algo que no pinta
   nadie.
2. **Entregar el layout campo por campo y esperar.** El entregable de la primera vuelta no
   es codigo. Las tres veces el cliente corrigio algo.
3. Spec cerrada + ADR de lo que se decida + fila en el INDEX.
4. Implementar: **un descriptor** (`src/lib/<pagina>-edicion.ts`, 60 lineas: como se llama,
   que archivo escribe, su schema, su `desdeForm`, sus `listas` y sus `sembrados`), **un
   formulario** (`src/components/admin/Formulario<Pagina>.astro`) y **una pagina de tres
   lineas** que llama a `pantallaEditor(descriptor, Astro.request, Astro.url)` y pinta
   `<EditorPestanas formulario={...} />`. Mas la fila en `src/pages/admin/index.astro`.
5. Verificar **con el BO corriendo** (`scripts/sesion-temporal.mjs`), no por lectura: alta,
   baja, traduccion, y un POST forjado desde una pestaña que no es portugues.
6. Comparar el HTML construido contra `HEAD` con el hash del CSS neutralizado.

**Lo que hay que mirar en produccion antes de seguir:** el cliente probo el editor de
`/aulas` y dejo publicado `"label": "Idades 1"` en `content/pt/classes.json` (commit
`a73982d`). Se ve en `/aulas` en portugues, en la seccion de crianças. Lo arregla el en dos
clics desde el mismo editor, pero conviene avisarle.

1. **Rediseñar la interfaz del editor de Home** (fila 6o). Sigue pendiente. Ahora hay un
   molde aprobado —el de `/aulas`— al que alinearla, incluido el cambio de los textarea de
   "una linea por renglon" a tablas.

2. **Un fallo de subida se publica como "no habia cambios"** — es el unico defecto que
   dejo esta verificacion. `partnersDesdeForm` descarta en silencio toda fila con `src`
   vacio (`src/lib/forms.ts:262`), asi que si R2 falla al elegir el archivo, el logo nuevo
   nunca llega al POST y `guardarPartners` contesta *"No habia cambios: no se publico
   nada"* (`src/lib/partners-edicion.ts:48`) — un mensaje verde que dice justo lo
   contrario de lo que paso. El error de la subida solo se ve en el textito bajo la
   miniatura. Sin spec: hay que decidir si la fila vacia se rechaza con un error propio o
   si el boton de publicar se bloquea mientras haya una subida sin resolver.

3. **Probar lo que queda del editor en el BO** (filas 6l, 6m, 6n): quitar un logo, el aviso
   de conflicto con dos pestañas, y cambiar una foto viendo que cambia en los cuatro
   idiomas con los dos commits.

Para verificar el BO en local hace falta una sesion: no existe forma de entrar sin
contraseña. Lo que se hizo en esta sesion fue insertar una fila temporal en `admin_session`
con un token propio y borrarla al terminar — **sin tocar la contraseña**, porque
`npm run admin:seed` la repone y expulsa al cliente. La base es la misma que usa
produccion.

**El `GITHUB_TOKEN` de `.env` esta muerto.** El 2026-09-21 `GET /user` con el token del
archivo local contesto **401**: es un `ghp_` clasico, probablemente expirado. No prueba nada
sobre el de Vercel —que publico de verdad en la fila 6k— pero **es el primer sospechoso si el
BO en produccion empieza a contestar que no puede publicar**. Verificarlo antes de tocar
permisos: `curl -H "Authorization: token <t>" https://api.github.com/user`.

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

`docs/HANDOFF-CLAUDE-CODE.md` es el registro del ultimo corte cerrado, no trabajo
pendiente. Hoy el sitio construye **44 rutas** prerenderizadas con `astro check` en 0/0/0.

**Produccion viva.** Proyecto Vercel `dojo-da-luz` (`prj_q6TX7OfOiiKJob6RxZBde0Umo2nA`,
equipo `maxhost27-6230s-projects`), conectado al repo `maxhost/dojo-da-luz` y con
`DATABASE_URL` ya cargada: `GET /api/health` responde `{"ok":true,"db":"up"}` desde la URL
publica. Las rutas comprobadas devuelven 200 en pt/es/fr/en.

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

**Y ya edita** (spec 0021): `/admin/paginas/home` con los 4 idiomas en una pagina, y
`/admin/dojos` con alta, edicion, archivado y reactivacion. Lo que no valida contra el
schema del build no llega al repo, y el editor no puede romper el sitio.

**El BO escribe al disco en `astro dev` y commitea a `main` en produccion** (ADR-0025). Lo
decide el modo de ejecucion, no la presencia del token: un `GITHUB_TOKEN` vencido en el
shell no puede hacer que una sesion de desarrollo publique contra el repo. `BO_PUBLICAR=github`
fuerza el camino de GitHub a mano. **Cuidado: guardar desde `/admin` en local ensucia el
working tree**, igual que editar el JSON a mano.

**Que un campo exista en el JSON no prueba que la pagina lo use.** El 2026-09-21 el editor
de `/aulas` salio a produccion con un bloque "Etiquetas del menu" que editaba `chrome.nav`
— un campo que **ninguna vista lee**: las diez arman su menu con `siteNav(locale)` desde
`NAV_LABELS`. Estaba en `home.json` y `classes.json` desde el scaffold y nadie lo habia
mirado. Lo encontro el cliente preguntando "¿que menu, el navbar o el footer?". Antes de
poner un campo en el editor, **buscar quien lo renderiza** (`grep` del nombre en `src/`),
no alcanza con que valide el schema. El campo se borro; el HTML construido no cambio en
un solo byte, que es la prueba de que estaba muerto.

**El orden de las claves del contenido lo fija el schema de zod, no el archivo.** Los cinco
JSON de contenido se normalizaron a ese orden el 2026-09-21 (mismos datos, `resumen` sube
al segundo lugar en los 4 `home.json`). Si se reordena un campo en `src/lib/content.ts`, el
siguiente guardado del BO reordena el archivo: ruido de una vez, no perdida de datos.

## Siguiente

| # | Tarea | Spec | Estado | Notas |
|---|---|---|---|---|
| 1 | Baseline: crawl de las 34 URLs (texto, title, description, H1) + imagenes originales de wixstatic en alta | — | proximo | No depende de nadie. |
| 2 | Export de Google Search Console 16 meses | — | bloqueada | Necesita acceso del cliente. |
| 3 | Migración de contenido y páginas: Aulas, Aikido, Dojo, Pablo Durán, Contacto y Otras Artes | 0010–0017 | hecho | Sitemap de páginas completo en pt/es/fr/en. Agenda retirada. Quedan endpoints operativos separados. |
| 4 | Diseño visual | 0003–0009 / ADR-0010 | hecho | Estructura tradicional productiva, video hero e información práctica en HTML; paridad pt/es/fr/en. |
| 5 | Deploy real: Vercel conectado al repo + `DATABASE_URL` en env | — | hecho | https://dojo-da-luz.vercel.app sirve las 44 rutas y `/api/health` responde contra Neon. Falta el dominio propio (tarea 10). |
| 5c | Autorizar la GitHub App de Vercel sobre `maxhost/dojo-da-luz` | — | hecho | Autorizada por el cliente. Vercel ya crea deployments con `source: git`. |
| 5b | Borrar el proyecto Neon huerfano `bitter-tree-51605379` | — | pendiente | Lo cree yo antes de que existiera `silent-wave`. El MCP quedo scopeado y no puede borrarlo: va por consola. |
| 6 | Spec 0019 — backoffice: login y sesion | 0019 | hecho | `/admin` con guard por Host, noindex, rate limit y sesion en Neon. Sin reset por email: eso es la 0022. |
| 6d | Spec 0022 — recuperacion de contraseña por Resend | 0022 | bloqueada | Decision del cliente: arrancar sin Resend. Necesita `RESEND_API_KEY`. Mientras tanto la contraseña se repone con `npm run admin:seed`. |
| 6b | Spec 0020 — dojos como entidad y render en la home | 0020 | hecho | 3 dojos en `content/dojos.json` con horarios estructurados. Falta migrar Aulas y Contacto a la entidad (fila 6f). |
| 6f | Migrar Aulas y Contacto a la entidad de dojos | 0034, 0042 | **hecho** | Las dos leen la entidad: archivar un dojo lo saca de `/aulas` y de `/contactos`, comprobado en las dos direcciones con el BO corriendo. `contact.venues` se borro; como se llega quedo en el contenido traducible indexado por `slug` (ADR-0038). |
| 6c | Spec 0023 — capa GEO (resumen en Home, Q&A en Aulas/Adultos/Niños, robots, llms.txt) | 0023 | hecho | 13 pares Q&A por idioma con `FAQPage`. Falta que el cliente confirme precios y edades: hoy salen del contenido que ya estaba publicado. |
| 6e | Spec 0021 — editor de Home y CRUD de dojos en el BO | 0021 | hecho en local | Verificado contra `astro dev` con backend de disco: 16 comprobaciones en la spec. **No desplegado y sin un solo commit salido por la API de GitHub.** |
| 6g | Ejercitar el camino de publicacion por GitHub | 0021 | bloqueada | Necesita un PAT de alcance fino sobre `maxhost/dojo-da-luz` con contenido en escritura, cargado en Vercel como `GITHUB_TOKEN`. Sin el, las 4 rutas del editor responden 503 diciendo que falta — el resto del BO (login, panel) funciona igual. |
| 6h | Que el cliente mire el editor en pantalla | 0021 | en curso | Primera pasada hecha: de ahi salieron las specs 0029 y 0030. |
| 6i | Spec 0029 — menu fijo, tarjetas de audiencia y medios en el editor de Home | 0029 | hecho en local | Verificado con las 4 homes construidas byte a byte identicas. Sin desplegar al escribir esto. |
| 6j | Spec 0030 — subir imagenes a R2 desde el BO | 0030 | **hecho** | Verificado el 2026-09-21 contra produccion: el logo subido desde el BO vive en `https://pub-a3e739acf38449bf92d850dfa752a522.r2.dev/medios/e902d14be10a/w1600.webp` y responde `200 image/webp`, 1600x1600, 18 KB, `Cache-Control: immutable`. El arreglo de `R2_JURISDICTION` funciona: el camino completo —elegir archivo, subir a R2, guardar la URL en el JSON, publicar— corre en produccion. Falta comprobar la reutilizacion por hash (subir dos veces el mismo archivo) y la galeria `/admin/medios`. |
| 6k | Comprobar que el BO publica de verdad en produccion | 0021 | **hecho** | Verificado el 2026-09-21 sin proponerselo: el commit `f147c2e` "contenido: se archiva el dojo encarnacao desde el backoffice" aparecio en `origin/main` escrito por el BO en produccion, y rechazo un push local por no-fast-forward. Toca `content/dojos.json`. El camino completo —editar, commitear con `GITHUB_TOKEN`, disparar el deploy— funciona. |
| 6l | Spec 0031 — parcerias editables desde el BO | 0031 | **hecho en lo principal** | Verificado el 2026-09-21 en produccion: "Añadir nuevo" + subir un logo + "Publicar parcerías" escribio el commit `e467102` ("contenido: parcerias desde el backoffice"), Vercel construyo en 20 s y el noveno logo aparece en las cuatro homes publicas (`/`, `/es`, `/fr`, `/en`). Falta todavia: quitar un logo, y el aviso de conflicto con dos pestañas. |
| 6m | Spec 0032 — imagenes de la Home compartidas y subida primero | 0032 | implementada, sin probar en el BO | Las cinco imagenes salieron de los cuatro `home.json` y viven en `content/media.json` (ADR-0028): se suben una vez y valen para los cuatro idiomas. El `alt` y el pie siguen por idioma, con la miniatura al lado para saber que se describe. El campo de imagen ahora ofrece **subir primero** y deja la direccion a mano plegada en un `details` que nace abierto (sin JS sigue siendo un input visible). Las 4 homes construidas quedaron identicas salvo el hash del CSS. |
| 6n | Spec 0033 — un campo por cosa en el editor | 0033 | implementada, sin probar en el BO | Correccion de UX pedida por el cliente: el bloque "Imágenes de la portada" **se borro** y las cinco imagenes volvieron a su seccion, donde **la miniatura es el boton** que abre el selector de archivos; un parceiro volvio a ser solo un logo mas un "quitar" (nombre y escala viajan ocultos). Publicar un idioma escribe `media.json` tambien, solo si alguna imagen cambio. |
| 6o | Rediseñar la interfaz del editor con el cliente | — | **bloqueante, sin empezar** | Tres iteraciones rechazadas (0031, 0032, 0033). El pedido textual: *"un form simple donde tenes inputs de texto que modifican textos, inputs de texto que modifican texto de botones, input de imagen que modifica imagenes"*. **No implementar sin que el cliente apruebe el layout antes** — ver Descartado. Requisito practico: conseguir forma de ver el BO (contraseña, o sesion temporal en `admin_session`), porque hasta ahora se diseño sin ver ni una pantalla. |
| 6p | Spec 0035 — editor de /aulas en el BO | 0035 | implementada, verificada en local | Cuatro pestañas, cinco tablas (cuotas, notas, parrafos, datos de crianças, preguntas) y el layout aprobado por el cliente **antes** de escribir codigo. Portugues manda la estructura (ADR-0030): solo su pestaña tiene "Añadir fila"; publicar PT escribe los cuatro archivos en un commit por la Git Data API. Verificado por HTTP contra el BO corriendo: alta y baja de una cuota propagadas a los cuatro idiomas, marca "sin traducir" en es/fr/en, traducciones de las otras filas intactas. **Ejercitado en produccion el 2026-09-21**: el commit `a73982d` ("contenido: Aulas desde el backoffice (1 archivos)") lo escribio el BO por la Git Data API. |
| 6r | Spec 0036 — editores de Adultos y Crianças con galeria libre y YouTube | 0036 | implementada, verificada en local | Dos pantallas separadas (`/admin/paginas/adultos` y `/criancas`) sobre un formulario comun, con el layout aprobado por el cliente antes de escribir codigo. La galeria dejo de tener seis medios fijos: se añaden y quitan sin limite, cada uno es una foto subida a R2 o un video de YouTube, y el grid publico se adapta (1, 2, 3-4, 5+). El video no le pide nada a YouTube hasta que alguien lo toca, y una galeria sin videos no se lleva **ni una linea** de JavaScript. Portugues siembra las imagenes (ADR-0032): en es/fr/en la foto y el enlace se ven pero no se cambian, y un POST forjado desde esas pestañas queda igual sin efecto (comprobado). Los cinco textos de cabecera y pie pasaron al contenido. Se borro el mp4 de stock de Pexels de los ocho archivos. **Desplegado el 2026-09-21** (`e330802`) y comprobado en las seis paginas publicas. El guardado del BO por la Git Data API quedo comprobado en la fila 6p; falta todavia ver un commit de **cuatro** archivos, que es lo que escribe publicar portugues cuando cambia la estructura. |
| 6s | Spec 0037 — editor de /aikido | 0037 | implementada, verificada en local | Pantalla propia con el layout aprobado antes de escribir codigo. La lista numerada pasa a largo libre —el numero lo pone la pagina por posicion— y el bloque O-Sensei siempre esta, con sus textos y su foto editables. Las dos fotos que vivian dentro de `AikidoView.astro` pasaron al contenido, y el `alt` de la foto de Ueshiba dejo de estar en español en los cuatro idiomas. Se borro el `id` por seccion: era un ancla HTML que no usaba nadie y distinta por idioma. Los parrafos de cada seccion se editan como texto, uno por renglon (ADR-0033), por estar anidados. **Desplegado el 2026-09-21** (`57641b1`) y comprobado en las cuatro paginas publicas. |
| 6t | Spec 0038 — editor de /dojo | 0038 | implementada, verificada en local, **desplegada** (`cce4906`, deployment `dojo-da-aama28v6d`, las 4 paginas publicas comprobadas) | Pantalla propia con el molde ya aprobado. Tres cosas que se veian en `/dojo` y no existian en ningun JSON pasaron al contenido: los cinco textos del borde, las dos fotos grandes y **el equipo docente**, que era un objeto con los cuatro idiomas escritos a mano dentro de `DojoView.astro` mas tres URLs de Wix. Ahora es una lista de largo libre: se crean y se quitan profesores desde portugues, con nombre, titulo, parrafos y foto, y el front la renderiza (con cero profesores la franja no se pinta). El bloque del profesor principal es su propia seccion del editor. "Uma transmissão viva" son tres cajas fijas (ADR-0034): sin "Añadir" ni "Quitar" en ninguna pestaña, texto editable en las cuatro, y el schema las exige en 3. `TablaFilas` gano columnas de tipo `imagen`, que es lo que evito una tercera copia del control de foto por fila. |
| 6u | Spec 0039 — editor de /eventos | 0039 | implementada, verificada en local y **en produccion** (`8953ddb`, deployment `dojo-da-7uhgcm95e`; con sesion temporal, `/admin/paginas/eventos` da 200 con sus cinco bloques, 6 campos de imagen y 1 boton de alta) | La agenda es la primera pagina que **se vacia**: el `.min(3).max(4)` obligaba a inventar un evento para poder borrar otro (ADR-0035). Ahora la lista es de largo libre, se arma en portugues y se traduce, y con cero eventos la pagina no pinta una franja beige vacia sino `emptyText`, editable en los cuatro idiomas. La foto de portada y los cinco textos del borde pasaron al contenido. El `0{index + 1}` que escribia `010` a partir del decimo esta arreglado — dejaba de ser latente justo ahora que la lista puede crecer. Ningun control nuevo: reusa la columna `imagen` de `TablaFilas` que sumo la spec 0038. |
| 6v | Spec 0040 — editor de /outras-artes | 0040 | implementada, verificada en local y **en produccion** (`cbb9ac4`, deployment `dojo-da-fburjdlp9`; las 4 paginas publicas con la portada nueva y las anclas `arte-1..3`, y con sesion temporal `/admin/paginas/outras-artes` da 200 con sus siete bloques) | Cada arte es un bloque del formulario, no una fila de tabla: tiene once campos y tres listas adentro —parrafos, beneficios, horarios— que van como recuadro de texto, una entrada por renglon (ADR-0033). La portada gana foto de fondo y la pagina gana la galeria de Adultos, con los dos botones de alta. Verificado contra el BO corriendo: foto y video subidos desde portugues aparecieron en los cuatro, un POST forjado desde español con otra portada, otra foto de arte, otro `formUrl`, otra foto de galeria y un cuarto arte quedo en 3 artes, 2 medios y las cuatro cosas portuguesas, vaciar beneficios y borrar el profesor dejo de pintarlos, y con la galeria vacia la seccion entera desaparece. De las 44 paginas construidas cambiaron **exactamente las 4 de `/outras-artes`**, y comparadas etiqueta por etiqueta la unica diferencia es la portada nueva y el ancla por posicion: ni un texto cambio. |
| 6w | Spec 0041 — editor de /escolas | 0041 | implementada, verificada en local y **en produccion** (`7af0457`, deployment `dojo-da-k2gbmyrzl`; las 4 paginas con sus 4 fotos y cero iframes, Adultos con 5 medios y `/outras-artes` con 0 —las dos intactas— y con sesion temporal `/admin/paginas/escolas` da 200 con sus cinco bloques) | El mas corto de los siete: portada, bloque de comunidad y galeria. Lo que tenia trabajo era la galeria, que era la unica del sitio que no admitia video y exigia entre 4 y 8 fotos (ADR-0037). Verificado contra el BO corriendo: un video de YouTube añadido en portugues aparecio en los cuatro, un POST forjado desde español con tres fotos distintas, un medio de mas y un parrafo de mas quedo en 5 medios, 2 parrafos y las tres fotos portuguesas, con cinco medios la rejilla destaca el primero y el video sale como enlace con miniatura (**cero `<iframe>`**), con uno pasa a columna unica centrada y con cero la franja desaparece. De las 44 paginas cambiaron **exactamente las 4 de `/escolas`** y solo en la rejilla; las de Adultos, Criancas y `/outras-artes` quedaron intactas pese al cambio de prop en `GaleriaMedios`. |
| 6x | Spec 0042 — editor de /contactos | 0042 | implementada, verificada en local y **en produccion** (`08e21af`, deployment `dojo-da-6oahgvyay`) | La unica pagina sin una sola foto ni una lista de largo libre. Lo que tenia trabajo eran las sedes: `contact.venues` se borro y las tarjetas salen de `getDojos()` (ADR-0038), asi que **Encarnação dejo de publicarse**. Verificado contra el BO corriendo: archivar Lumiar desde el editor de Dojos dejo `/contactos` con una tarjeta y `/aulas` con una sede; publicar en ese estado **conservo sus lineas** (viajan en campos ocultos); reactivarlo devolvio todo. Dos defectos encontrados por verificar y no por leer: el endpoint de archivar **falla en silencio sin el `sha`** (303 con `?fallo=` en la query — la primera lectura de "dos tarjetas" no probaba nada), y el bloque `transport` se reescribia entero en cada diff porque el orden de claves salia del formulario; ahora se ordenan alfabeticamente. De las 44 paginas cambiaron **exactamente las 4 de `/contactos`**. |
| 6q | Sacar Encarnação de los textos en prosa | — | pendiente | El dojo cerro. La estructura ya no lo nombra, la prosa si: en `classes.json` (descripcion SEO, pie, `children.facts[2]`, dos respuestas del Q&A) lo puede arreglar el cliente desde `/admin/paginas/aulas`. `adults.json` y `children.json` ya tienen editor (spec 0036): sus `facts` y su Q&A los puede arreglar el cliente. Queda `contact.json`, sin editor. |
| 7 | Alumnos + emision de factura + PDF a R2 + envio Resend | — | pendiente | Necesita una factura de ejemplo real. Spec sin escribir: el numero 0004 del INDEX es otra cosa. |
| 8 | Redirects 301 de las 34 URLs viejas | — | plan definido | Matriz conceptual documentada. Falta crawl final, Search Console e implementación cuando existan todos los destinos. |
| 9 | Sitemap + robots.txt | — | pendiente | Con el set completo de paginas. |
| 10 | Apuntar `aikido-duran.com` a Vercel | — | pendiente | Hoy resuelve a Wix. Va junto con la tarea 8: sin los 301 no se corta. Necesita accesos de DNS del cliente. |
| 11 | Retratos reales de Ines Martins, Miguel Costa y Sofia Almeida | 0027 | bloqueada | Necesita fotos del cliente. Hoy las tres fichas de `/dojo` muestran escenas de practica de wixstatic, no a la persona que nombran: se sustituye el array `teacherPhotos` sin tocar la composicion. |
| 12 | Logos reales de los parceiros, con transparencia | 0028 | bloqueada | Necesita los originales del cliente. Los 8 de hoy traen fondo blanco incrustado y 3 son fotografias, no marcas. `mix-blend-multiply` tapa el blanco puro pero no las 2 casi blancas. |

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
| 2026-09-19 | Spec 0025 — accesos de Adultos y Crianças en la Home | `astro check` 0/0/0, tests 5/5 y build con 36 páginas; las 4 homes contienen los 2 enlaces localizados y las 2 imágenes, sin scripts ejecutables nuevos; `git diff --check` limpio |
| 2026-09-20 | Spec 0026 + ADR 0021/0022 — Eventos, Escolas e identidad azul | `astro check` 0/0/0 (arreglado `teacher.href` en `DojoView`), `npm test` 5/5 y `npm run build` con 44 `index.html` (36 antes); `/eventos` y `/escolas` en `pt-PT`, `/es/eventos`, `/es/escuelas`, `/fr/evenements` y `/en/schools` con su `lang` correcto; `instagram.com/dojodaluz` responde 200 con `og:title` "Pablo Duran"; `git diff --check` limpio |
| 2026-09-20 | Portugues como idioma de entrada: verificado, sin cambios | Ya lo era en todas las capas: `DEFAULT_LOCALE = 'pt'` y `prefixDefaultLocale: false`, `/` construida como `<html lang="pt-PT">` con titulo portugues, `hreflang="x-default"` a `/`, y `dojo-da-luz.vercel.app/` devuelve 200 en portugues incluso con `Accept-Language: es-ES`. El unico sitio que abre en español es el Wix vivo (`www.aikido-duran.com` sirve `<html lang="es">`): eso se cambia en el panel de Wix, no en este repo |
| 2026-09-20 | Deploy de la spec 0026 a produccion | `git push origin main` → `01f67af`; deployment `dojo-da-q7ckdlc1e` ● Ready en 16s por webhook de GitHub; las 8 rutas nuevas de `dojo-da-luz.vercel.app` devuelven 200 con su `lang` correcto (`/eventos` y `/escolas` en `pt-PT`, `/es/eventos`, `/es/escuelas`, `/fr/evenements`, `/fr/ecoles`, `/en/events`, `/en/schools`); la raiz sigue en portugues con `x-default` a `www.aikido-duran.com`; el CSS servido tiene 5 `#0099ff` y 0 `#9b3025`; Instagram y Oxanium presentes en la home |
| 2026-09-21 | Spec 0027 + ADR-0023 — jerarquia del equipo docente en Dojo | `astro check` 48 archivos 0/0/0, `npm test` 5/5 y `npm run build` con 44 `index.html`; `git diff --check` limpio; `/dojo` pasa de 4 secciones de profesor a 1 sola con bloque protagonista y 3 fichas; anclas `#pablo-duran`, `#inês-martins` (con acento, heredado), `#miguel-costa` y `#sofia-almeida` conservadas |
| 2026-09-21 | Deploy de la spec 0027 a produccion | `git push origin main` → `335976d`; deployment `dojo-da-hn4p4oqhm` ● Ready en 19s por webhook de GitHub, sin incidentes abiertos en vercel-status; `/dojo`, `/es/dojo`, `/fr/dojo` y `/en/dojo` devuelven 200 con `pt-PT`/`es`/`fr`/`en`, un solo retrato `max-h-[42rem]` (antes 4), las 3 fotos `fp_` de las fichas y los 3 `<article>` de instructores |
| 2026-09-21 | Spec 0028 + ADR-0024 — Parcerias en rejilla | `astro check` 48 archivos 0/0/0, `npm test` 5/5 y `npm run build` con 44 `index.html`; las 4 homes pasan de 16 a 8 `<img>` de parceiro, con 0 `aria-hidden`, 0 `bg-white` y 0 bordes en la seccion; `grep partner-carousel src/` vacio; el CSS construido trae `.mix-blend-multiply{mix-blend-mode:multiply}` y las 8 imagenes la llevan; aprobado a ojo por el cliente en `localhost:4321` |
| 2026-09-21 | Los logos de parceiros traen el fondo blanco incrustado | Descargados los 8: los 3 PNG con `hasAlpha: no` (Wix los aplano), los otros 5 son JPEG. Pixeles de borde: 6 en `#ffffff` exacto, 2 en `(247,247,247)` y `(245,244,242)`. Quitar `bg-white` del CSS no alcanza; se neutraliza con `mix-blend-multiply` sobre `#f6f1e8`, que no limpia las dos que no son blanco puro |
| 2026-09-21 | Deploy de la spec 0028 a produccion | `git push origin main` → `3dc5ba9`; deployment `dojo-da-uohuq04cs` ● Ready en 23s por webhook de GitHub; `/`, `/es`, `/fr` y `/en` devuelven 200 y su seccion de parcerias trae 8 `<img>`, 8 `mix-blend-multiply`, 0 `bg-white`, 0 `aria-hidden` y `md:grid-cols-5`; el CSS servido (`Base.CjxXOUpx.css`) tiene `mix-blend-mode:multiply` y 0 ocurrencias de `partner-carousel` |
| 2026-09-21 | Spec 0021 + ADR-0025 — editor de Home y CRUD de dojos en el BO | `astro check` 61 archivos 0/0/0, `npm test` 5/5 y `npm run build` con 44 `index.html` (sin cambios en el sitio publico). Contra `astro dev` con sesion real: `/admin/paginas/home` pinta 4 formularios de 51 campos sin un `id` repetido; guardar sin tocar nada no escribe; editar `hero.tagline` en pt da un diff de 2 lineas y no toca los otros 3 idiomas; `seo.title` vacio → 422 nombrando el campo; un `resumen` de 6 caracteres → 422 nombrando `resumen.N`; `sha` viejo → 409 sin pisar el cambio ajeno; alta con `hasta` < `desde` → 422; slug repetido → 422; alta de `alvalade` → aparece en las 4 homes construidas; archivarlo → sale de las 4 y sigue en el listado del BO; editar el telefono de Benfica no toca sus horarios ni los otros dojos; sin cookie las 5 rutas → 302 con `X-Robots-Tag` |
| 2026-09-21 | Un `GITHUB_TOKEN` vencido en el shell dejaba todo el BO en 401 | El backend de publicacion se elegia por la presencia del token, y en `astro dev` esa variable la aporta el shell — el mismo token vencido que ya rompia `git push`. Arreglado en el codigo, no en una nota: lo decide `import.meta.env.DEV` (ADR-0025). Con token valido habria publicado contra el repo real desde una sesion de desarrollo |
| 2026-09-21 | El orden de claves del JSON lo fija zod, no el archivo | `safeParse` devuelve un objeto nuevo en el orden en que el schema declara los campos: `homeSchema` pone `resumen` segundo y los 4 `home.json` lo tenian ultimo. El primer guardado movia 6 lineas. Los 5 archivos de contenido normalizados al orden canonico, datos identicos verificados clave por clave ignorando orden |
| 2026-09-21 | Deploy de la spec 0021 a produccion | `git push origin main` → `702f5c3`; deployment `dojo-da-eb5h1e44m` ● Ready en 20s por webhook, sin incidentes en vercel-status. En `dojo-da-luz.vercel.app`: `/`, `/es`, `/fr`, `/en` y `/api/health` en 200 (`{"ok":true,"db":"up"}`); sin cookie, `/admin`, `/admin/paginas/home`, `/admin/dojos` y `/admin/dojos/nuevo` → 302 a `/admin/entrar` con `X-Robots-Tag`; con sesion, `/admin` → 200 y las 4 rutas del editor → **503 "Falta GITHUB_TOKEN"**, que es lo correcto hasta que se cargue el PAT |
| 2026-09-21 | Migraciones: nada pendiente para la 0021 | Las 6 tablas de `0001_init.sql` y `0002_admin.sql` ya estaban aplicadas en Neon (`admin`, `admin_login_attempt`, `admin_session`, `alumno`, `factura`, `serie`). El contenido vive en el repo, no en la DB (ADR-0002): el editor no necesita tablas |
| 2026-09-21 | Spec 0029 + ADR-0026 — frontera del editor de Home | `astro check` 62 archivos 0/0/0, `npm test` 5/5, build con 44 `index.html`. Las 4 homes construidas quedan byte a byte identicas tras migrar 11 campos nuevos. El formulario pasa de 51 a 52 campos, con 0 `nav[...]` y 5 campos de imagen por idioma. Guardar conserva los 4 enlaces del menu; cambiar la foto de la tarjeta de adultos no toca `/aulas/adultos`; una URL invalida da 422; `dojo.photo` y el poster del hero son independientes |
| 2026-09-21 | El CSS publico dependia de lo que se escribiera en `docs/` | Tailwind v4 sin `@source` escanea el proyecto entero, `.md` incluidos: la palabra "invisible" en un ADR agrego `.invisible{visibility:hidden}` al CSS servido a los visitantes. Arreglado en el origen con `@import 'tailwindcss' source(none)` + `@source '../**/*.{astro,ts}'`. El CSS baja de 28805 a 28173 bytes; de las 305 clases usadas por las 44 paginas no se pierde ninguna |
| 2026-09-21 | Spec 0030 — subida a R2, lo que si quedo verificado | `astro check` 0/0/0, `npm test` 9/9 y build con 44 rutas. La firma SigV4 da la firma esperada al byte contra los vectores publicos de AWS (`get-vanilla` y `get-vanilla-query-order-key-case`). Por HTTP contra el endpoint: PDF renombrado a `.jpg` → 422 leyendo los bytes con `sharp`, vacio → 422, 11 MB → 422, 9000 px → 422, sin cookie → 302. La funcion con `sharp` pesa **23 MB** (limite de Vercel: 250 MB). El dominio publico del bucket responde 404 de R2, o sea que esta activo |
| 2026-09-21 | El token de R2 no tiene permiso sobre el bucket | Las 3 operaciones dan `403 AccessDenied` contra `f42a4ec1d9145b1d6f9e043d2c3e262e.r2.cloudflarestorage.com/dojo-da-luz-dev`. El codigo de error es el dato: R2 devuelve `SignatureDoesNotMatch` si la firma esta mal y `InvalidAccessKeyId` si la clave no existe, asi que firma y clave son correctas y lo que falta es el permiso del token |
| 2026-09-21 | CORS no interviene en la subida a R2, y no se configura | Es lo primero que se sospecha ante un 403 y es un callejon sin salida. El `PUT` sale de la funcion de Vercel, servidor contra servidor: CORS lo aplica el navegador y ahi no hay ninguno. Y las imagenes se cargan con `<img src>`, que no necesita CORS en ningun navegador. Solo haria falta si algun dia se sube directo desde el navegador con URL prefirmada |
| 2026-09-21 | `git checkout -- <directorio>` pisa trabajo ajeno: ahora esta vetado | El agente corrio `git checkout -- content/` para deshacer una prueba en `content/pt/home.json` y de paso reverso la normalizacion de `content/dojos.json`, de la misma sesion y sin commitear. Fix estructural: hook PreToolUse `.claude/hooks/git-restore-amplio.sh`, que bloquea `git checkout --` y `git restore` cuando el destino es un directorio y deja pasar el archivo concreto. Probado con 4 casos que bloquean y 5 que pasan |
| 2026-09-21 | Un vector de prueba con el hash transcripto de memoria | La prueba de SigV4 traia tres vectores de AWS y uno fallaba: el valor esperado estaba mal, el codigo estaba bien. Se diagnostico codigo sano. Sustituido por la propiedad comprobable (dos valores que solo difieren en espacios dan la misma firma) y anotado en CLAUDE.md |
| 2026-09-21 | Spec 0043 + ADR-0039 — editor de `/professor-pablo-duran` | `astro check` 114 archivos 0/0/0, `npm test` 39/39 y build con 44 rutas. Contra el BO corriendo: la pantalla con 9 bloques × 4 idiomas, 1 campo de imagen editable y 5 botones "Añadir fila" sólo en portugués; un séptimo hito creado en PT aparecio en los cuatro archivos y quedo marcado "Sin traducir" en los otros tres; traducirlo en español cambio **solo** `content/es/teacher.json` (2 lineas); un POST forjado desde español con un octavo hito y otra foto quedo en 7 hitos y con la foto portuguesa; formulario vacio → 422 nombrando los campos; sin cookie → 302 con `X-Robots-Tag`. Comparacion del HTML construido contra `HEAD` con el hash del CSS neutralizado: **44 paginas, 0 distintas**, antes y despues de borrar el hito de prueba |
| 2026-09-21 | ADR-0040 — "Percurso" estaba escrito y no se leia | `.section-title` fija `color: #211f1c` y la seccion es `bg-[#27231f]`: contraste ~1:1. Tres de las cuatro secciones oscuras del sitio lo compensaban a mano con `text-white`; esta no. Arreglado en el CSS y no en ese `<h2>`: `.text-white .section-title { color: inherit }`, misma capa `components` y mas especificidad. **Verificado con captura de Chrome headless** de `/professor-pablo-duran`: en la franja oscura el titulo se lee en blanco. El HTML de las 44 paginas no cambia; el unico archivo distinto es el CSS |

## Descartado (y por que)

Los caminos descartados importan: sin registro, se reintentan.

| Que | Por que no |
|---|---|
| **Bloque "Imágenes de la portada" al final del editor (spec 0032)** | Resolvia un problema real —una foto no se traduce y el editor publica un idioma por POST, asi que estaba cuatro veces— pero lo resolvia en la pantalla equivocada: para cambiar la foto de "04 · O dojo" habia que salir de la seccion, bajar al final, adivinar cual de cinco era y volver. El cliente pregunto "¿que es eso? ¿para que?". **Una caja que necesita un parrafo explicando por que existe ya perdio.** El modelo de datos compartido (`content/media.json`) **si sirve y se queda**; lo que se borro es la seccion (ADR-0029). |
| **Nombre y ampliacion por cada logo de parceiro (spec 0031)** | El nombre era el texto alternativo y la ampliacion existia por un logo con mucho margen en el archivo. Las dos razones son ciertas y ninguna justifica dos campos de texto por logo en la pantalla del cliente: *"un logo solo deberia ser una imagen"*. Los datos siguen en el JSON y viajan ocultos con la fila. |
| **Campo de imagen que pide una URL (specs 0029–0030)** | Un `input type="url"` a ancho completo con el selector de archivo abajo y mas chico. El cliente no tiene de donde sacar una direccion — es el problema que abrio la spec 0030. Y hasta el arreglo de la jurisdiccion EU, el boton de subir existia pero fallaba, lo cual enseña a ignorarlo. |
| **Bloque "Etiquetas del menú" en el editor de /aulas (spec 0035)** | Editaba `chrome.nav`, un campo que **ninguna de las diez vistas lee**: todas arman su menu con `siteNav(locale)` desde `NAV_LABELS`. Tres de sus cinco `href` ni figuraban en el HTML construido. Estaba muerto en `home.json` y `classes.json` desde el scaffold y yo asumi que se renderizaba porque estaba en el JSON. Lo encontro el cliente preguntando "¿que menu, el navbar o el footer?". Se borro el campo entero: las 44 paginas quedaron identicas byte a byte. **El menu no se edita desde ningun lado y esta bien asi** (ADR-0026): son las ocho paginas del sitio. |
| **Diseñar UI sin que el cliente vea el layout antes** | El error de fondo de las tres filas anteriores, y la razon de que la sesion del 2026-09-21 terminara con el cliente diciendo "olvidate". El ciclo fue siempre el mismo: proponer una pantalla, implementarla entera, desplegarla, y enterarse ahi de que no era. **Ningun agente de esta sesion pudo ver una sola pantalla del backoffice** —hace falta contraseña— asi que cada iteracion fue un diseño a ciegas presentado como terminado. Lo que corresponde: aprobar el layout primero, implementar despues. |
| Carrusel animado en Parcerias (spec 0026) | Mostraba 3 o 4 de 8 parceiros a la vez y obligaba a esperar el bucle para verlos todos; duplicaba los `<li>` en el HTML con `aria-hidden` y pedia su propio bloque `prefers-reduced-motion`. Sustituido por rejilla estatica en la spec 0028 (ADR-0024). |
| Recuadro blanco con borde detras de cada logo de parceiro | Ocho cajas compitiendo con los logos sobre el fondo `#f6f1e8`. Y no era lo que producia el blanco visible: eso lo traen los archivos. No reponerlo para disimular assets malos — la respuesta son los logos originales (fila 12). |
| Seis variantes por imagen (AVIF + WebP × 3 anchos), spec 0030 original | El contenido guarda `photo` como **una** URL y el render usa `<img src>`: no hay `<picture>` ni `srcset` en ningun lado del sitio. Cinco de las seis no las leeria nadie — andamiaje. Se genera una sola WebP de 1600 px y se conserva el original como negativo. Vuelve a tener sentido el dia que el render sepa leer `srcset`, y ese dia no habra que pedirle al cliente que resuba nada. |
| Configurar CORS en el bucket de R2 | No interviene: el `PUT` sale de la funcion de Vercel (servidor contra servidor, sin navegador que aplique CORS) y las imagenes se cargan con `<img src>`, que no lo necesita. Configurarlo no arregla el `AccessDenied` —eso es permiso del token— y seria configurar algo que nada usa. Haria falta solo si algun dia se sube directo desde el navegador con URL prefirmada. |
| Cuatro secciones de profesor a pantalla completa en `/dojo` (spec 0026) | Cuatro scrolls para cuatro biografias de dos parrafos, con el mismo retrato repetido cuatro veces y Pablo Duran indistinguible del resto. Sustituido por la jerarquia de la spec 0027 (ADR-0023). |
