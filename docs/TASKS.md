# TASKS

**Estado actual del proyecto. Este es el punto de retorno.**

Si una sesion se cae, se cierra o se compacta, se vuelve aca — no al chat. Hay un hook
`Stop` que bloquea el fin del turno si se toco codigo y este archivo quedo viejo.

Regla: **marcar `hecho` solo con verificacion real** — tests que pasan, comando corrido,
cosa vista en pantalla. No "deberia andar".

## Octava sesion (2026-09-26) — boton "Editar" en /admin/dojos

**Pedido:** "podemos crear y archivar dojos, pero no podemos editarlos". El formulario de
edicion **ya existia** desde la spec 0021 (`702f5c3`, 2026-09-21): `/admin/dojos/[slug].astro`
reusa `FormularioDojo.astro` con `nuevo={false}` y funciona igual que el alta. El problema
no era el codigo, era que **no habia ningun boton que lo dijera** — la unica forma de llegar
era clickear el nombre del dojo en el listado, sin ningun afordance visual (mismo patron que
`/admin/formularios`, que tiene el mismo gap).

**Evidencia de que esto ya rompio algo real:** `git log -- content/dojos.json` muestra que el
2026-09-24 16:48 se creo (alta, no edicion) un dojo con slug `1-`, direccion real de Benfica
(Rua Claudio Nunes 59A), telefono y horario reales, y **2 minutos despues** (16:50) se archivo.
Todo indica que alguien intento completar los datos de Benfica (que hoy tiene
`direccion.calle: null`), no encontro como editar, creo un duplicado por error y lo archivo al
darse cuenta. Esos datos reales quedan hoy archivados y sin usar en `content/dojos.json`
(slug `1-`). **Se le preguntó al cliente si volcarlos a `benfica` y pidió dejarlo como esta**
— no tocar contenido esta sesion.

**Fix**: `src/pages/admin/dojos/index.astro` — boton "Editar" agregado junto a
Archivar/Reactivar, mismo estilo que ya usa el resto del listado (`border border-[#d7cec0]
bg-white px-3 py-1 text-sm`). No se toco `/admin/formularios`, que tiene el mismo gap — no fue
lo que se pidio esta sesion.

**Capitalizacion "O dojo"**: se pidio de nuevo revisar que diga "O dojo" (mayuscula) y no
"o dojo". Verificado en el codigo (`src/lib/i18n.ts` `NAV_LABELS`, `src/layouts/Admin.astro`)
**y en produccion** (`curl https://dojo-da-luz.vercel.app/dojo` devuelve
`<a href="/dojo">O dojo</a>`): ya estaba bien en los dos menus antes de esta sesion, no hizo
falta ningun cambio.

**Gate**: `npm test` 103/103, `npm run build` 44 rutas, sin cambios en ninguna pagina publica
(el unico archivo tocado es del BO).

**Falta**: nada pendiente de esta sesion. Si en algun momento se decide limpiar el dojo `1-`
archivado, los datos reales estan ahi (direccion, telefono, horario de Benfica) para volcarlos
a mano o a pedido.

### Segunda entrega de la octava sesion — "Cabecera" sale de los editores (ADR-0050, spec 0055)

**Pedido**: el cliente pregunto que editaba la seccion "Cabecera" (presente en los once
editores de pagina) y, al ver que solo tocaba tres textos de accesibilidad/marca que nunca
cambiaban entre paginas, pidio quitarla de todos los editores y mudar la bajada del logo a
`/admin/ajustes`, debajo de donde se cargan el logo y el favicon.

**Verificado antes de tocar codigo**: comparando los 44 `content/*.json`, `menuLabel` y
`skipLink` eran identicos en las once paginas de cada idioma —nunca editados, viajaban
repetidos sin motivo, mismo patron que ya resolvio el pie de pagina (ADR-0042)—. `caption`
casi tambien, salvo un typo real: `home.json` en portugues decia "Aikikai · Lisboa" en vez
de "Aikido · Lisboa" como las otras diez paginas.

**Implementado**: `menuLabel` y `skipLink` pasan a constantes por idioma en `i18n.ts`
(`MENU_LABEL`, `SKIP_LINK`, mismo criterio que `NAV_ARIA`) — ya no son campos, `Base.astro`
los calcula solo de `locale`. `caption` pasa a `content/site.json` (`marca.caption`, un
campo por idioma, mismo patron que `marca.pie`) y se edita en `/admin/ajustes` bajo el
favicon. `chromeSchema` se borra de `schemas.ts`, el campo `chrome` sale de los 44
`content/*.json`, y la seccion "Cabecera" (fieldset + entrada de navegacion) se borra de los
once `Formulario*.astro`. El typo de Home se resuelve al valor mayoritario, "Aikido".

**Gate**: `npm test` 103/103, `npm run build` 44 rutas. Comparacion character-level
(`difflib`) del HTML contra el build de antes de este cambio: **una sola diferencia en las
44 paginas**, `kai` → `do` en la Home portuguesa (el fix del typo) — las otras 43, byte a
byte iguales.

**Falta**: verificar contra el BO corriendo que `/admin/ajustes` muestra los 4 campos nuevos
bajo el favicon y que ningun editor de pagina muestra mas "Cabecera" — esta sesion no tuvo
`.env` local ni acceso a Neon para levantar `scripts/sesion-temporal.mjs`. Spec 0055 queda
`cerrada`, no `implementada`, hasta que alguien lo confirme viendo la pantalla.

**Nota aparte, no de esta tarea**: `src/lib/schemas.ts` tiene 345 lineas, por encima del
limite de 300 que enforcea el hook `file-size` (ya estaba en 364 antes de esta sesion, que
lo bajo a 345 al borrar `chromeSchema` pero no lo suficiente). Pendiente dividirlo — no se
hizo en esta sesion porque no era parte de lo pedido y tocar de mas un archivo que once specs
distintas siguen extendiendo es mas riesgo que beneficio a mitad de una tarea.

---

## Handoff — cierre de la septima sesion (2026-09-25)

**Once commits pusheados a `main`:** `7afd06b`, `6e0fccc`, `50a36fc`, `a85ce85`,
`4c5fc6e`, `3590289`, `c6c14e8`, `11a844b`, `9b64517`, `2f1929f` (del BO), `939220a`.
El BO tambien publico por su cuenta tres veces (`942e45f`, `ddf4df1`, `ba5fdce`) sin que
nada se pisara — dos rebases limpios durante la sesion.

**Que se pidio y que se entrego, en orden:**

1. **422 al subir video en Home** → diagnosticado como spec 0047 nunca implementada (no
   "un bug", una feature fantasma) → implementada entera: subida prefirmada a R2 para el
   video (`CampoVideo.astro`, `firmarVideo()`), CORS configurado por el cliente. **Verificado
   en produccion**: el cliente subio un video real y publico (`942e45f`).
2. **Publicar Home rompia con `classesHero: Invalid URL`** → bug preexistente de 4 dias
   (spec 0035 nunca actualizo `FormularioHome.astro`) → arreglado con el hidden que
   faltaba. **Verificado**: el cliente confirmo que publicar Home ya no rompe.
3. **"Unexpected token" al subir una imagen grande en cualquier galeria** → mismo defecto
   documentado en ADR-0044 y nunca arreglado → subida prefirmada tambien para imagenes
   >4 MB (`firmarImagen()`), y toda respuesta se lee con `leerJsonSeguro()` (nunca deja
   pasar una excepcion de parseo). **Verificado por el cliente**: "funcionando".
4. **Fotos de `/dojo` y `/professor-pablo-duran` cortaban la cara** → diagnosticado
   bajando las fotos reales y simulando el recorte con `sips` (no adivinado por CSS):
   portrait forzado en caja horizontal, recorte centrado deja afuera la mitad superior →
   `object-top` en las tres imagenes de `/dojo` y en `/professor`. **Verificado por el
   cliente**: "funcionando".
5. **"Toca todos" (auditoria completa)** → se revisaron Adultos/Crianças/Home/Escolas
   /Outras Artes y **no estaban rotas** (ya venian precortadas o el recorte actual ya
   mostraba la cara completa) — no se tocaron a proposito.
6. **`/eventos` con el mismo problema, pero son flyers, no retratos** → un punto focal
   (spec 0052, luego extendido en 0053) elige que se pierde, no evita perder algo → el
   cliente probo el mecanismo en produccion igual (foco de Praga `"37% 4%"` propagado a
   los 4 idiomas) y confirmo que funciona **como mecanismo**, pero pidio una garantia mas
   fuerte: **"necesito una solucion real... si se recortan queda informacion fuera del
   recorte."** Solucion final (ADR-0049, spec 0054): `/eventos` **no recorta nunca** — la
   imagen se muestra a su tamaño natural (`class="w-full"`, sin caja fija, sin
   `object-cover`). `photoFoco` se saco entero del camino de eventos.
7. **"Otros profesores" de `/dojo` tambien pidio el punto focal** (spec 0053, a diferencia
   de eventos: aca **si** hay un sujeto recortable, y `object-top` sigue siendo el default,
   el foco es la excepcion) → implementado, y **verificado en produccion por el cliente y
   por el propio BO**: los 5 profesores con foco elegido, propagado igual en los 4 idiomas
   (`2f1929f`). El cliente lo confirmo textual: *"el foco en dojo quedo perfecto."*
8. **Consulta sobre alternativas a Resend** (sin implementar, solo para decidir): se
   evaluo `nodemailer`+Gmail SMTP y `FormSubmit.co`. Este ultimo se descarto tras
   verificar con busqueda real —no de memoria— que **multiples proveedores de seguridad
   independientes lo marcan como phishing/malicioso** y hay reportes de soporte
   inexistente. El cliente decidio **quedarse con Resend**, que ya esta construido
   (spec 0050).
9. **Mistake→rule de esta sesion**: el mismo bug —un import relativo en `src/lib/*.ts`
   sin `.ts`, que rompe bajo `node --test` pero no bajo Vite/Astro— aparecio **tres veces**
   (`r2.ts`, `eventos-edicion.ts`, `pagina-dojo-edicion.ts`), cada vez recien al agregar el
   primer test que importaba ese archivo directo. Convertido en hook nuevo,
   `.claude/hooks/import-extension.sh` (PostToolUse sobre `src/lib/*.ts` y
   `src/pages/*.ts`): falla al escribir el import, no sesiones despues.

**Gate final de la sesion**: `npm test` **103/103**, `npm run build` **44 rutas**,
comparaciones contra `HEAD` con hash del CSS neutralizado en cada cambio visual —
siempre exactamente las paginas esperadas, ninguna de mas. `astro check` **sigue sin
correr en esta maquina** (OOM preexistente, confirmado que no lo causa nada de esta
sesion — ver "Gotcha del entorno" abajo).

**Falta, sin verificar (esta sesion no tuvo acceso a Neon/BO/Vercel directo):**

1. Mirar las 4 tarjetas de `/eventos` en produccion con la imagen completa (punto 6):
   confirmar que se ven bien con alturas distintas entre si — la mas vertical
   (1080×1920, Costa de Caparica) va a ser la fila mas alta — y que el texto de cada fila
   sigue centrado contra su imagen. Cuando este confirmado, spec 0054 pasa de `cerrada` a
   `implementada` en el INDEX.
2. Confirmar si `RESEND_API_KEY`, `FORM_FROM_EMAIL` y `FORM_TO_EMAIL` ya estan cargadas en
   Vercel (quedo preguntado, sin respuesta al cierre de la sesion) — si no, es lo unico
   que falta para que `/admin/formularios` mande correos de verdad.

**Gotcha del entorno — leer antes de tocar nada:**

- **Esta sesion se movio de `/Volumes/NAS/claude-workspace/dojo-da-luz` a
  `~/Documents/claude-workspace/dojo-da-luz`** a mitad de camino: el mount SMB al NAS
  (`unraid.ogas.ar`) se cayo, con `ls` y `git status` tirando `Operation timed out`. Todo
  el trabajo real de esta sesion —instalar dependencias, correr tests, buildear, comparar
  HTML— paso en la copia local. **El path de NAS quedo con cambios sin commitear
  vencidos** (versiones viejas de `media.json`, `TASKS.md`, `package.json`,
  `HomeView.astro`, `FormularioHome.astro` — todas superadas por lo que ya esta en
  `origin/main`) y con `node_modules` roto a medias. **No se toco**, por el riesgo de un
  `git reset --hard` sobre un mount que seguia respondiendo lento al cierre de la sesion.
  Antes de trabajar ahi de nuevo: confirmar que el mount responde normal, y sincronizarlo
  con `git fetch && git reset --hard origin/main` (los cambios locales ahi son
  descartables) o seguir usando la copia local directamente.
- `npm run typecheck` (`astro check`) revienta con `FATAL ERROR: Reached heap limit` en
  esta maquina, con o sin `--max-old-space-size=8192`. Confirmado con `git stash` +
  build viejo que **no lo causa ningun cambio de esta sesion** — es preexistente. Sigue
  pendiente correrlo en un entorno sano.

**Retomar con:** *"Leer docs/TASKS.md. Falta (a) confirmar visualmente las 4 tarjetas de
`/eventos` en produccion y pasar la spec 0054 a implementada, y (b) confirmar si las
credenciales de Resend ya estan en Vercel."*

---

### Detalle completo de la sesion (por si hace falta el por que exacto de cada decision)

**Octavo — el punto focal no alcanzaba para `/eventos`, y se saco: la foto se ve entera,
sin recortar nunca (ADR-0049, spec 0054).** El cliente probo la spec 0053 (caja
`aspect-[4/5]`, menos recorte) y pidio algo mas fuerte: *"necesito una solucion real...
si se recortan queda informacion fuera del recorte"*. Tenia razon — un punto focal elige
**que** se pierde, no evita perder algo, y un flyer con titulo arriba y logos abajo no
tiene un solo rectangulo que los contenga a los dos. La solucion: `EventsView.astro`
pierde la caja fija y `object-cover` — el `<img>` queda en `class="w-full"`, se muestra a
su tamaño natural, nunca se recorta. `photoFoco` se saco de **todo** el camino de eventos
(schema, edicion, traduccion, editor, los 4 `content/*/events.json` — incluido el
`"37% 4%"` que el cliente ya habia elegido para Praga, que ya no tenia sentido) y se borro
`eventos-edicion.test.ts`, que probaba exactamente ese campo.

**`/dojo` no se toco: el foco de "Otros profesores" queda exactamente como en la spec
0053** — ahi si hay un sujeto (una cara) con un default razonable (`object-top`), y el
cliente ya confirmo que "quedo perfecto". La diferencia entre las dos paginas es de
contenido, no tecnica: ADR-0049 lo deja escrito para la proxima vez que alguien dude por
que una pagina usa foco y la otra no.

Gate: `npm test` **103/103** (108 menos los 5 de `photoFoco` en eventos, borrados con el
campo), `npm run build` 44 rutas, comparacion contra `HEAD`: exactamente las 4 paginas de
`/eventos` cambian, ninguna otra se mueve.

**Falta, no verificado todavia (sin acceso a Neon/BO desde esta sesion):**

1. Mirar las 4 tarjetas de `/eventos` en produccion con la imagen completa: confirmar que
   se ven bien con alturas distintas entre si (la mas vertical, 1080×1920, va a ser la
   fila mas alta) y que el texto de cada fila sigue centrado contra su imagen.
2. En "04 · Otros profesores" de `/dojo` (spec 0053, todavia sin verificar en el BO): elegir
   un foco para algun profesor, publicar, confirmar que se ve en los cuatro idiomas.
3. Cuando esto este verificado, pasar las filas de las specs 0053 y 0054 en el INDEX de
   `cerrada` a `implementada`.

---

**Bloque anterior de esta sesion (0052/0053), sin tocar — el detalle de que se cambio y
por que sigue siendo valido para `/dojo`:**

**Septimo — spec 0052 verificada en produccion por el cliente, y spec 0053: el foco se
extiende a "Otros profesores" de `/dojo`, y `/eventos` cambia de proporcion.**

El cliente eligio el foco de la foto rota de Praga (`5238ffe4bf0a`) el mismo, en
produccion: `content/*/events.json` llego con `photoFoco: "37% 4%"` **propagado
identico en los cuatro idiomas** (commit `ba5fdce`, del BO). Es la primera confirmacion
real, no de esta sesion, de que la spec 0052 funciona de punta a punta. **La spec 0052 pasa
de `cerrada` a `implementada` en el INDEX.**

De ahi el cliente pidio dos cosas mas, bajadas como spec **0053** (implementada en el
momento, sin esperar a que se escribiera antes — el codigo salio primero por la velocidad
que pidio la sesion, la spec quedo como registro):

1. **El foco tambien en "04 · Otros profesores" de `/dojo`.** A diferencia de `/eventos`,
   aca vacio **no** significa centrado: `DojoView.astro` mantiene `object-top` como base
   (el default que ya funciona para retratos) y el `style` con `photoFoco` solo lo
   sobreescribe cuando alguien elige uno. Los 5 profesores migraron con `photoFoco: ""` —
   **0 paginas de `/dojo` cambiaron** en la comparacion contra `HEAD`.
2. **`/eventos` pasa de `aspect-[4/3]` a `aspect-[4/5]`.** Medido: las fotos de eventos son
   verticales (0,56 a 0,75 de relacion) y la caja horizontal descartaba 44-47 % del alto
   **antes** de que el foco eligiera que mostrar. Simulado con `sips` contra la foto real
   de Praga con su foco ya puesto (`37% 4%`): con la caja nueva se ve el titulo, la cara
   completa **y** los logos del pie — ninguno entraba con la caja vieja. Las 4 paginas de
   `/eventos` cambiaron en la comparacion (esperado, es el cambio); `/dojo` no se movio.

`CampoFoco.astro` gano un prop `aspecto?: '4/3' | '4/5'` (clases literales por Tailwind,
nunca un template dinamico) para que la vista previa del editor no mienta la proporcion.

En el camino aparecio, **por tercera vez**, el mismo bug latente de `r2.ts`/`medios.ts`:
`pagina-dojo-edicion.ts` importaba sus vecinos sin `.ts`. Arreglado igual que las dos
veces anteriores. Sigue pendiente el chequeo automatico que lo agarre solo.

Gate: `npm test` **108/108**, `npm run build` 44 rutas, comparacion contra `HEAD` con el
hash del CSS neutralizado: exactamente las 4 paginas de `/eventos` cambian, 0 de `/dojo`.

*(El punto 2 de este parrafo —la caja `aspect-[4/5]`— quedo superado por el bloque de
arriba: `/eventos` ya no recorta en absoluto. El "Falta" vigente es el de arriba.)*

**Hallazgos previos de esta sesion, resumen** (detalle completo mas abajo en este mismo
bloque, sin tocar):

**Quinto hallazgo — auditoria de recorte de imagenes en todo el sitio, a pedido del
cliente ("toca todos para asegurarte de que las imagenes siempre se vean bien").** Se bajo
y se simulo el recorte real (`sips`, no solo CSS) de cada foto en riesgo. Resultado, **no
es un fix uniforme**:

- **`TeacherView.astro` (Pablo Durán, `/professor-pablo-duran`) arreglado** con
  `object-top`: mismo archivo que `leadTeacher.photo` en `/dojo`, mismo problema. Las 44
  paginas comparadas: exactamente las 4 de `/professor-pablo-duran` cambian.
- **`AudienceView.astro` (Adultos/Crianças), `OtherArtsView.astro`, `SchoolsView.astro`,
  `HomeView.astro` — revisadas y NO tocadas.** Las fotos de Home y Escolas ya vienen
  precortadas por Wix con una relacion de aspecto que coincide con su caja (ej.
  `teacherPhoto` es `w_900,h_1200` = 3:4, exacto contra `aspect-[3/4]`); la de Crianças,
  simulada, ya muestra la cara completa con el recorte centrado actual. Tocarlas no
  arregla nada que este roto.
- **`EventsView.astro` (las tarjetas de eventos) — NO tocado, y esto es lo importante:**
  las fotos no son retratos, son **flyers promocionales diseñados** con texto y logos en
  cualquier posicion del cuadro. Se simularon los 4 recortes reales: el de
  `5238ffe4bf0a` (Franck Noël, Praga) **esta roto hoy** —el recorte centrado deja solo el
  cuello, sin cara— y `object-top` lo arregla. Pero el mismo `object-top` en
  `585a41b36921` (Franck Noël, Lisboa) **rompe uno que hoy esta bien**: el recorte
  centrado muestra su retrato completo, y arriba solo queda el titulo en blanco. Un CSS
  no puede acertar los dos a la vez porque cada flyer pone la foto en un lugar distinto
  del diseño. **Bajado a spec**: ADR-0048 (decision: punto focal, no recorte real) y
  spec **0052** (`docs/specs/0052-foco-de-imagen-en-eventos.md`), cerrada, **sin
  implementar todavia**. Acotada a las fotos de `/eventos` a proposito — el resto del
  sitio ya se audito y no lo necesita.

**Cuarto hallazgo — las fotos de `/dojo` (portada, Pablo Durán y las 5 fichas del equipo)
cortaban la cara.** Diagnosticado bajando las fotos reales y simulando el recorte con
`sips` (no solo leyendo el CSS): son archivos verticales subidos por el BO
(996×1235 tipico) metidos en cajas horizontales (`aspect-[4/3]`) con `object-cover` sin
`object-position` — eso deja visible solo el 50% central del alto, y la cara, que en un
retrato esta arriba, queda afuera. Arreglado con `object-top` en las tres imagenes
(`4c5fc6e`). Las 44 paginas comparadas contra `HEAD`: **exactamente las 4 de `/dojo`
cambian**, 7 apariciones de `object-top` cada una, ninguna otra se mueve.

**Tercer hallazgo — "Unexpected token" al cambiar una imagen grande en cualquier galeria
(ej. `/admin/paginas/criancas`), bug preexistente documentado en ADR-0044 y nunca
arreglado.** `CampoImagen.astro` hace `res.json()` sobre la respuesta de
`/admin/medios/subir`; Vercel corta el cuerpo de la funcion en 4,5 MB y devuelve el `413`
**en texto plano**, asi que `JSON.parse` revienta con "Unexpected token" y eso es lo unico
que veia el cliente — nunca "el archivo es muy grande". Pasaba con "algunas imagenes" (las
de mas de ~4,5 MB, tipico de una foto de movil) y no con todas. Arreglado con el mismo
mecanismo que ya existia para el video: `firmarImagen()` en `medios.ts` (mismo `firmar()`
prefirmado, sin `sharp` — el archivo se sirve tal cual, sin resize a WebP, que es el
trade-off que el ADR-0044 ya habia aceptado), `CampoImagen.astro` sube prefirmado cuando el
archivo pasa los 4 MB, y las dos respuestas (`subir` y `firmar`) se leen con
`leerJsonSeguro()` (nuevo, en `src/lib/subida-navegador.ts`) que nunca deja pasar la
excepcion de un cuerpo no-JSON. `CampoVideo.astro` se paso al mismo modulo compartido, sin
cambio de comportamiento.

**Segundo hallazgo — bug preexistente, no causado por la 0047:** publicar cualquier idioma
de Home rompia con `media.classesHero: Invalid URL`. La spec 0035 (2026-09-21) agrego
`classesHero` a `mediaSchema` como obligatorio, pero `FormularioHome.astro` nunca lo llevo
como campo — ni editable ni oculto —, a diferencia de `FormularioAulas.astro` que si pasa
los otros cinco campos que no le pertenecen. Como `media.json` se publica entero y el
schema exige las seis claves, Home venia rompiendo su propio publish hace **4 dias** sin
que nadie lo notara, porque nadie habia intentado publicar Home hasta hoy —se probo
tratando de guardar el video nuevo—. Arreglado agregando el hidden que faltaba (`6e0fccc`),
con un test de regresion que lee `FormularioHome.astro` como texto y exige cada clave de
`CLAVES_MEDIA`.

**Primer hallazgo/entrega — subida de `.mp4` a R2 para el video de la portada (spec 0047)**,
pedida por el cliente al ver un **422** en "Subir vídeo" del editor.

**Patron que se repite en los tres hallazgos:** ninguno lo encontro leyendo codigo, los
tres salieron de probar el editor de verdad. La sesion entera fue reactiva —arreglar lo que
el cliente pisaba— y eso esta bien, pero **falta la pasada proactiva**: grepear
`CLAVES_MEDIA`/`mediaSchema` contra cada `Formulario*.astro` para ver si hay un cuarto gap
sin que alguien lo pise primero.

**El working tree vive en `/Volumes/NAS/...` (SMB a `unraid.ogas.ar`) y el mount se cayo a
mitad de sesion** — `ls` y hasta `git status` tiraban `Operation timed out`. Se siguio
trabajando en la copia local `~/Documents/claude-workspace/dojo-da-luz` (mismo repo, mismo
`origin/main`, sincronizada). **Ojo la proxima sesion: hay que decidir cual de las dos
carpetas es la real** — probablemente conviene dejar de usar el mount de red para este
proyecto, o entender por que existen las dos.

**Diagnostico primero (lo que se le contesto al cliente antes de tocar codigo):** el 422 no
era un bug puntual. La spec 0047 estaba `cerrada` en el INDEX pero **nada de su alcance
estaba implementado** — sin `CampoVideo.astro`, sin `firmar.ts`, sin ningun campo de video
en ningun schema. El unico control de portada era `media.heroPoster`, una imagen, y
`subirImagen()` (que usa `sharp`) rechazaba cualquier `.mp4` con "No es una imagen que se
pueda leer." — un 422 correcto para el campo que existia, no el campo que el cliente
buscaba.

**Implementado en esta sesion:**

- `src/lib/r2.ts` → `presignarPut()`: SigV4 firmado por query string (URL prefirmada), no
  por cabecera. No hay vector publico de AWS para esta variante — se probo por propiedad
  (mismo input → misma firma; otro secreto o `content-type` → firma distinta), siguiendo la
  regla del proyecto de no inventar un vector de test.
- `src/lib/medios.ts` → `firmarVideo()`: valida `content-type` exacto (`video/mp4`), tamaño
  (32 MB), forma del hash (sha256 hex); si el objeto ya existe en R2 (mismo hash = mismo
  archivo) no reemite PUT, solo la URL.
- `src/pages/admin/medios/firmar.ts` — endpoint nuevo: solo metadatos en el cuerpo, nunca
  el archivo; protegido por el guard de sesion del middleware existente, sin tocarlo.
- `src/components/admin/CampoVideo.astro` — nuevo: hashea el archivo con `crypto.subtle` en
  el navegador, pide la firma, sube con `XMLHttpRequest` (progreso real), y tiene "Quitar
  vídeo" porque vacio es un estado valido (la portada se ve solo con el poster).
- **Desvio deliberado de la spec escrita**: la 0047 preveia `hero.video` en
  `content/*/home.json` (por idioma). Se implemento como `heroVideo` en `content/media.json`
  (compartido, `mediaSchema`) al lado de `heroPoster` en su lugar — es donde ya vive la
  imagen que lo acompaña (ADR-0028) y evita el estado "cambiado en 3 de 4 idiomas" que un
  video no deberia poder tener, igual que una foto. `mediaDesdeForm` y el passthrough de
  `FormularioAulas` no se tocaron: son genericos sobre `CLAVES_MEDIA`. **Esto no tiene su
  propio ADR todavia** — queda para el handoff.
- `content/media.json`: `heroVideo` migrado con la URL de Pexels que hoy esta hardcodeada
  en `HomeView.astro` — cero cambio visual hasta que el cliente suba la suya.
- `HomeView.astro`: la constante `HERO_VIDEO` se borro; con `heroVideo` vacio la portada
  pinta el poster como `<img>`, nunca un `<video>` sin fuente.
- Tests nuevos/editados: `r2.test.ts` (propiedades de `presignarPut`), `medios.test.ts`
  (la validacion de `firmarVideo` que corre sin credenciales — igual criterio que
  `subirImagen`), `media.test.ts` (`heroVideo` vacio es valido, invalido si no es URL).
- `scripts/configurar-cors-r2.mjs` + `npm run r2:cors` — nuevo. **Sin CORS en el bucket el
  `PUT` del navegador no puede pasar**, es el paso que ADR-0044 dejo anotado como pendiente.
  **No se corrio**: pide credenciales reales de R2 de produccion, que esta sesion no tiene
  y no deberia usar sin que el cliente lo confirme.

**Gate corrido en la copia local (disco, no NAS) — verificacion real, no supuesta:**

- `npm test`: **96/96** verde (subieron de 85: 4 de `presignarPut`, 5 de `firmarVideo`, 2 de
  `heroVideo` en `media.test.ts`). En el camino aparecio y se arreglo un bug latente
  preexistente: `r2.ts` leia `import.meta.env` sin `?.`, y eso revienta con `TypeError`
  fuera de Vite — nunca se habia notado porque ningun test anterior llamaba `configR2()`
  directo. `medios.test.ts` fue el primero. Arreglado con un optional chaining, una linea.
- `npm run build`: **44 rutas**, sin errores. La Home construida trae el mismo video de
  Pexels que antes (`urlPublica` = `content/media.json.heroVideo` migrado) — cero cambio
  visual, confirmado leyendo el HTML generado.
- **Comparacion contra `HEAD`** (`git stash` + build viejo vs. build nuevo, hash del CSS
  neutralizado con `sed`): **44 paginas, 0 diferencias.**
- `astro check` (`npm run typecheck`) **no corre en esta maquina**: revienta con
  `FATAL ERROR: Reached heap limit` (hasta con 8 GB de heap). **Se confirmo que es
  preexistente y no lo causo este trabajo**: revierte con `git stash` + mueve los archivos
  nuevos afuera → mismo OOM contra el codigo de `HEAD` sin tocar. Es un problema de esta
  maquina/entorno, no del codigo. Queda pendiente correrlo en un entorno sano (o en CI)
  antes de confiar en el typecheck.

**Falta, en orden:**

1. Correr `npm run r2:cors` (o pegar el JSON a mano en el dashboard de Cloudflare) contra
   R2 de produccion — lo tiene que hacer el cliente, esta sesion no tiene esas credenciales.
2. Confirmar que publicar Home (cualquier idioma) ya no rompe con `classesHero` — probarlo
   en produccion con `6e0fccc` desplegado. Este era el bloqueante inmediato que corto la
   prueba del video.
3. Contra el BO corriendo (`scripts/sesion-temporal.mjs`, o produccion): subir un `.mp4`
   real; repetir el mismo archivo y confirmar `requierePut:false` (dedupe por hash); un
   archivo que no es `.mp4` rechazado antes de la red; uno de mas de 32 MB rechazado con el
   tamaño en el mensaje; "Quitar vídeo" deja la portada solo con el poster tras publicar.
4. Desplegar y comprobar la Home publica con el video nuevo reproduciendo.
5. Escribir el ADR del desvio de la 0047 (media.json compartido en vez de home.json por
   idioma) y la fila en el INDEX. La fila de la spec 0047 en el INDEX sigue en `cerrada`: no
   pasa a `implementada` hasta que el paso 3 este comprobado contra el BO corriendo.
6. Correr `astro check` en un entorno que no reviente por memoria, para tener esa señal.
7. El mistake→rule del hallazgo de `classesHero` (nota arriba): decidir si conviene un
   chequeo automatico (test o hook) que revise que todo campo de `CLAVES_MEDIA` viaje en
   todos los formularios que publican `media.json`, no solo confiar en leer el codigo.

**Commiteado y pusheado**: `7afd06b` en `main` (`git fetch` antes del push confirmo que
`origin/main` seguia en `10fe13c`, sin nada nuevo del BO — push directo, sin rebase). El
usuario pidio saltar la verificacion completa por velocidad; el gate de arriba se corrio
igual porque ya estaba en curso cuando lo pidio, asi que el push no fue a ciegas.

---

Ultima actualizacion anterior: 2026-09-22, sexta sesion — spec **0051** commiteada: `/outras-artes`
deja los Google Forms externos y pasa a `formId`, el archivado de un formulario en uso se
bloquea (ADR-0047) y el modal publico se ajusta a movil. Gate verde: `astro check` **0/0/0**
(142 archivos), `npm test` **85/85**, `npm run build` 44 rutas. Desplegada en `cf140e9`
(deployment `dojo-da-9nlbvzj2f` ● Ready en 15 s) y comprobada en produccion: `/outras-artes`
en **200** con los **tres** botones de modal y los tres formularios propios pintados
(`name="nome"` × 3), sin ningun `<iframe>`. **La parte del backoffice —el 409 del archivado
y la propagacion del `formId`— no esta verificada contra el BO corriendo** — fila 13.

**Retomar con:** *"Leer docs/TASKS.md y la spec 0051. Falta (a) verificar la 0051 contra el
BO corriendo —archivado bloqueado, propagacion del formId de la Home en un commit, POST
forjado desde español— y (b) cargar `RESEND_API_KEY`, `FORM_FROM_EMAIL` y `FORM_TO_EMAIL`
en Vercel para probar un envio real de punta a punta."* La migracion `0003` ya esta aplicada
en Neon. La 0049 quedó supersedida. A la 0045 solo le falta el dominio, que depende del DNS
del cliente (fila 10).

**Ojo con el contenido:** los tres botones de `/outras-artes` abren hoy el **unico**
formulario que existe, «Aula experimental de Aikido», aunque digan «Aula experimental de Tai
Chi». Y Shiatsu, que antes llevaba a `/contactos`, ahora abre ese mismo modal. Es una
decision de contenido del cliente, no un defecto del codigo — fila 14.

Esta sesion, nueve entregas y un plan — con las dos ultimas entregas **no queda ninguna
pagina de contenido sin editor ni nada del borde sin pantalla**:

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
   headless: el titulo se lee en blanco. Desplegada en `9b17abf` (deployment
   `dojo-da-1e1irlnpr`, Ready en 15 s) y comprobada en produccion: las cuatro rutas de
   `/professor-*` en 200, la captura de la pagina publica con "Percurso" en blanco sobre la
   franja oscura, y `/admin/paginas/professor` sin cookie → 302 con `X-Robots-Tag`.

9. **Spec 0044** — la pantalla `/admin/ajustes` (ADR-0041, ADR-0042). La primera que **no
   es una pagina**: es lo que se repite en las 44. Trae el logo y el favicon —que antes no
   existian: el logo era un `<span>` con 合気 y favicon no habia ninguno—, el **color de
   acento**, el telefono, el email, la direccion, las dos URLs de redes y **las lineas del
   pie**.
   - **El acento era un hex escrito 74 veces** y tenia **tres** derivados (`#b3e5ff`,
     `#006eb8`, `#d6f0ff`/`#cceeff`): ahora es un token del tema y los tres se calculan con
     `color-mix`, con los porcentajes **medidos** contra los hex viejos. Cambiar el color del
     sitio entero es un campo. El BO se queda azul a proposito.
   - **El pie estaba escrito 44 veces** (`chrome.footerNote`, once archivos × cuatro
     idiomas). Se borro de los once schemas, de los 44 archivos y de las diez pantallas
     —cada editor perdio dos campos— y ahora se escribe una vez. **Encarnação se puede sacar
     del pie del sitio entero escribiendo una linea**, que era la fila abierta de la 0042.
   - **El telefono y el email del pie eran inventados** (`+351 000 000 000`,
     `ola@dojodaluz.example`) y estaban en produccion: quedan **vacios**, y vacio no se
     pinta. Los reales los carga el cliente.
   - Verificado con **capturas de las 44 paginas comparadas pixel a pixel**: 23 solo cambian
     el tono claro (5/255 en un canal), 21 ademas bajan 4 px el segundo renglon del pie
     —dos valores distintos para el mismo bloque, unificados—, **cero inesperadas**. Y con el
     BO corriendo: el acento en herrumbre movio los tres tonos en la pagina y ninguno quedo
     azul, el logo reemplazo el circulo dejando el nombre, vaciar Facebook saco el icono de
     las tres posiciones, el telefono y el email aparecieron en el pie **y** en el JSON-LD, y
     sacar Encarnação del pie portugues cambio las once paginas de una publicacion.
   - Desplegada en `f932acc` (deployment `dojo-da-mtxc37cw5`, Ready en 18 s) y comprobada
     en produccion: las siete rutas miradas en 200 con `html:root{--color-acento:#0099ff}`,
     el pie con su nota, **cero `tel:` y cero `ola@dojodaluz.example`**, los tres iconos de
     Facebook, y `/admin/ajustes` sin cookie → 302 con `X-Robots-Tag`.
   - **La subida de 256 px quedo verificada contra R2 en produccion**: un PNG de 1024 px
     subido con `variante=icono` quedo en `medios/<hash>/w256.webp`, el dominio publico lo
     sirve en 200 y medido con `sharp` da **256x256**; el mismo archivo sin variante fue a
     `w1600.webp` — dos claves, ninguna pisa a la otra.

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
de editores esta cerrado, y con la spec 0044 tambien lo esta el borde: **Ajustes** cubre el
logo, el favicon, el color, el contacto, las redes y el pie.

### Spec 0050 — formularios reutilizables (corte del 2026-09-22, quinta sesion)

Implementada entera menos la prueba de envio real, que espera las credenciales. **Sin
commit y sin desplegar.**

**La entidad y su edicion**

- `content/forms.json` con *Aula experimental de Aikido*: 8 campos, 9 horarios, los cuatro
  idiomas sembrados desde el portugues.
- `src/lib/formularios.ts` — schema y lectura validada **en el build**; catalogo cerrado de
  tipos y presentacion obligada a corresponder al tipo (ADR-0046).
- `formularios-parse.ts` — `FormData` → formulario. Portugues manda la estructura; es/fr/en
  solo traducen. Ids estables: reordenar no desalinea traducciones.
- `formularios-edicion.ts` — alta, edicion, archivado, `sha`, commit y
  `referenciasPorFormulario()` (una lectura de los cuatro `content/pt/*.json`, no cuatro por
  fila del listado).
- `formularios-envio.ts` y `formularios-correo.ts` — validacion de la respuesta contra la
  definicion publicada, composicion del correo con los labels **del servidor**, freno por IP
  hasheada y Resend (SDK `resend` 6.28.1).

**Las pantallas**

- `/admin/formularios` (listado con estado, nº de campos y en que paginas se usa),
  `/nuevo`, `/[id]` con las cuatro pestañas de idioma y `/[id]/archivar`.
- `EditorCamposFormulario.astro`: **el orden se cambia con flechas** —mueven la tarjeta y
  reescriben el `orden`; se publica al guardar, una flecha no commitea— y se agrega
  llenando la tarjeta vacia del final, sin JavaScript.
- Entrada **Formularios** en el sidebar, bajo Gestión.
- Selector por nombre (`CampoFormulario.astro`) en Home, Aulas, Adultos y Crianças; guarda
  el id. En Aulas, Adultos y Crianças solo se elige en portugues y se siembra a los otros
  tres; en Home va en las cuatro pestañas, porque Home no propaga nada.

**El sitio publico**

- `FormularioPublico.astro` pintado desde la definicion, con los cuatro estados; `FormModal`
  lo usa y un `formId` inexistente **rompe el build**.
- `formId` reemplaza a `formUrl` en los 16 archivos de Home/Aulas/Adultos/Crianças.
- `POST /api/formularios/enviar` con honeypot, rate limit y 503 sin configuracion.

**Verificado, no supuesto** — gate verde (`astro check` 0/0/0 en 141 archivos, `npm test`
85/85, build 44 rutas) y, contra `astro dev` con una sesion temporal:

- `/aulas` pinta el formulario propio con su `select` de 9 horarios y el honeypot, y **cero**
  rastro de Google Forms; el endpoint sin las tres variables responde **503** y el boton
  queda deshabilitado — no hay falso exito.
- El editor: 4 paneles de idioma, 33 tarjetas de campo (8 + la vacia en PT, 8 en cada
  traduccion), 16 flechas de campo y 22 de opcion **solo** en portugues, y 24 marcas «Sin
  traducir» (8 campos × 3 idiomas).
- Reordenar desde PT movio `idade` delante de `nome` en el archivo; la tarjeta vacia y la
  opcion vacia **no** se publicaron (8 campos, 9 opciones).
- Traducir en español cambio **solo** `label.es` de ese campo; pt/fr/en intactos.
- Un POST forjado desde frances con un campo de mas y `estado=archivado` termino en **200
  "no habia cambios"**: ni el campo ni el estado entraron.
- Alta sin nombre ni campos → **422**; alta completa → **303** a `contacto-de-prueba`, con
  ids generados y el español sembrado del portugues.
- Archivado: `303` con `?ok=` (leido en el `Location`, no supuesto) y el selector de Aulas
  quedo con **una** opcion, mientras es/fr/en siguen llevando el id en un campo oculto.
- `db/migrations/0003_form_rate_limit.sql` **aplicada en Neon** con `npm run db:migrate`:
  la tabla tiene sus cuatro columnas y sus tres indices, y 0 filas.

**Desplegado el 2026-09-22:** `dcfc62a` en `main` —la 0050 junto con el rediseño
mobile-first del BO, que venia sin commitear— y deployment `dojo-da-rj0mj5r06` ● Ready en
19 s. En `dojo-da-luz.vercel.app`: las seis rutas probadas en 200; `/aulas`, `/es/clases`,
`/fr/cours` y `/en/classes` con **un** `select` de horarios, el honeypot y **cero**
`docs.google.com/forms` ni `forms.gle`; el endpoint sin credenciales → **503**; el aviso de
envio no disponible sale en los cuatro idiomas; `/admin/formularios`, `/nuevo` y la ficha
sin cookie → 302 a `/admin/entrar`.

**Falta:**

1. Cargar `RESEND_API_KEY`, `FORM_FROM_EMAIL` (dominio verificado) y `FORM_TO_EMAIL` en
   Vercel, y probar un envio real de punta a punta. Hasta entonces el boton se ve
   deshabilitado tambien en produccion — que es lo correcto, no un defecto.
2. Decidido y **no** hecho: `/contactos` sigue con su formulario fijo y el boton
   deshabilitado, fuera de la entidad.
3. `trial.directLabel` y el `directLabel` de Adultos/Crianças quedaron **sin uso** —eran el
   enlace para abrir el formulario externo aparte—. Se dejan para no ampliar el diff.

### Plan histórico de la auditoría del 2026-09-21

El recorrido de editores esta cerrado. Lo que queda salio de una **auditoria del sitio
publico** hecha el 2026-09-21 en las dos direcciones —del codigo al HTML y del HTML al
contenido, sobre las 44 paginas construidas— para responder una pregunta del cliente: si
edita todo desde el BO, *¿queda todo bien para SEO y GEO?*

La respuesta medida: **todo el texto si** —no hay un solo `seo.title`, parrafo, respuesta de
FAQ ni `alt` que venga del codigo— pero hay seis cosas que editar no arregla. De ahi salen
estas specs, **todas cerradas menos la ultima, y ninguna implementada**:

| Spec | Que | Disjunta | Bloqueada por |
|---|---|---|---|
| ~~**0045**~~ | Los 301 de las 38 URLs del Wix, `sitemap.xml` y el dominio | si | **hecha salvo el dominio**, que espera el DNS del cliente (fila 10) |
| **0046** | `og:image` e identidad del JSON-LD en Ajustes | no (con 0047) | — |
| **0047** | Subida prefirmada a R2 + el video de la portada | no (con 0046) | — |
| ~~**0048**~~ | Los dos `aria-label` traducidos y los acentos de los idiomas | si | **hecha** |
| ~~**0049**~~ | El cierre de la Home al modal de contacto | si | supersedida por 0050; la decisión ya está cerrada |
| **0050** | Formularios reutilizables, traducibles y Resend | no | cerrada; credenciales solo bloquean la prueba real |

**Orden vigente:** consolidar el working tree actual → **0050**. La 0049 ya no debe
implementarse como contrato independiente.

**Tres hallazgos de la auditoria que hay que tener a mano:**

1. **Vercel corta el cuerpo de una funcion en 4,5 MB.** Medido contra produccion con un PNG
   de 5,8 MB: `413 FUNCTION_PAYLOAD_TOO_LARGE`, antes de que corra una linea nuestra. El
   campo de imagen **anuncia 10 MB** y ademas muestra un error de JavaScript en vez de un
   mensaje, porque hace `res.json()` sobre una respuesta de texto plano. Es un defecto vivo,
   no solo un obstaculo para el video (ADR-0044, spec 0047).
2. **El sitemap del Wix miente por omision.** Lista 34 URLs y hay **tres paginas vivas mas**
   —`/contactospt`, `/atualidadept`, `/enseignant-fr`— que responden 200 y no figuran. Por
   eso el export de Search Console del cliente es parte del gate y no un extra
   (`docs/design/10-inventario-wix.md`).
3. **El host canonico es `www`, y esta medido**: el Wix hace `301` del apex a `www`. No es
   una preferencia, es conservar donde esta la autoridad (ADR-0043).

**Lo que el cliente confirmo en esta sesion:**

- Las **ocho etiquetas del menu** se quedan en `i18n.ts`. No se convierten en contenido.
- **"Dojo da Luz"** es marca y se queda en el codigo.
- El **DNS** lo configura el cliente con el dueño del dominio "en unos dias".
- El **cierre de la Home** abre el formulario de contacto en un modal **mobile first**.
- El host canonico queda a criterio tecnico → medido → `www`.

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
| 6y | Spec 0050 — formularios reutilizables y Resend | 0050 | **cerrada, lista para implementar** | ADR-0046. Formularios globales por `formId`, estructura creada en portugués y traducida por pestañas, campos de catálogo cerrado, opciones manuales sin límite ni vínculo con Dojos. Codex prepara la UI; Claude Code conecta entidad, CRUD, propagación, endpoint, rate limit y Resend. Requiere `RESEND_API_KEY`, `FORM_FROM_EMAIL` y `FORM_TO_EMAIL` para verificar envío real, no para desarrollar con mocks. |
| 6q | Sacar Encarnação de los textos en prosa | — | pendiente | El dojo cerro. La estructura ya no lo nombra, la prosa si: en `classes.json` (descripcion SEO, pie, `children.facts[2]`, dos respuestas del Q&A) lo puede arreglar el cliente desde `/admin/paginas/aulas`. `adults.json` y `children.json` ya tienen editor (spec 0036): sus `facts` y su Q&A los puede arreglar el cliente. Queda `contact.json`, sin editor. |
| 7 | Alumnos + emision de factura + PDF a R2 + envio Resend | — | pendiente | Necesita una factura de ejemplo real. Spec sin escribir: el numero 0004 del INDEX es otra cosa. |
| 8 | Redirects 301 de las 38 URLs viejas | 0045 | **hecho** | 36 reglas en `src/lib/redirects.ts`, consumidas por `astro.config.mjs` y traducidas por el adapter a `301` de plataforma. Las 36 probadas por HTTP: `301` con `Location` exacto, un solo salto, destino `200`. `/no-existe` y `/videos` dan 404: sin comodines. 14 pruebas en `redirects.test.ts`. Falta el export de Search Console del cliente para cerrar el inventario. |
| 9 | Sitemap + robots.txt | 0045 | **hecho** | `src/pages/sitemap.xml.ts` genera 44 `<loc>` de `PAGES × LOCALES` con `hreflang` reciproco y `x-default`; sus 44 URLs son **exactamente** los 44 `canonical` del HTML construido y ninguna es un origen redirigido. `robots.txt` con su linea `Sitemap:`. ADR-0045. |
| 10 | Apuntar `aikido-duran.com` a Vercel | 0045 | pendiente | **Lo unico que falta de la 0045.** Los 301 ya estan desplegables, asi que el orden del ADR-0043 se cumple. `vercel domains ls` (2026-09-21): el dominio **no esta** en la cuenta; agregarlo es un cambio en la cuenta del cliente y no se hizo sin pedirlo. Despues del DNS: repetir las 36 reglas contra `www.aikido-duran.com`, comprobar apex→www y http→https, y enviar el sitemap a Search Console. |
| 11 | Retratos reales de Ines Martins, Miguel Costa y Sofia Almeida | 0027 | bloqueada | Necesita fotos del cliente. Hoy las tres fichas de `/dojo` muestran escenas de practica de wixstatic, no a la persona que nombran: se sustituye el array `teacherPhotos` sin tocar la composicion. |
| 12 | Logos reales de los parceiros, con transparencia | 0028 | bloqueada | Necesita los originales del cliente. Los 8 de hoy traen fondo blanco incrustado y 3 son fotografias, no marcas. `mix-blend-multiply` tapa el blanco puro pero no las 2 casi blancas. |
| 13 | Verificar la spec 0051 contra el backoffice corriendo | 0051 | **proximo** | Lo unico que le falta a la 0051; el gate esta verde pero ninguna pantalla se vio. Comprobar: (a) «Archivar» deshabilitado en el formulario en uso y **409** —no `303` a `?ok=`— en el POST forjado, con el archivo intacto en disco; (b) cambiar el formulario de la Home en portugues deja los cuatro `home.json` con el mismo `formId` en **un** commit; (c) un POST forjado desde español no cambia el `formId` de Home ni de Outras artes; (d) los tres botones de `/outras-artes` abren el modal en el idioma de la pagina. |
| 14 | Que formulario abre cada arte de `/outras-artes` | 0051 | bloqueada | Necesita la decision del cliente. Hoy Shiatsu, Iaido y Tai Chi apuntan los tres a «Aula experimental de Aikido» porque es el unico formulario que existe. Si Shiatsu debe volver a llevar a `/contactos`, hace falta `formId` opcional. |
| 15 | Borrar `directLabel` y la rama `<iframe>` de `FormModal` | — | pendiente | Andamiaje sin uso desde la 0050/0051: ninguna pagina pasa ya `url`, y `directLabel` sigue en el schema y en cuatro editores del BO sin que nadie lo pinte —un campo que el cliente escribe y no hace nada—. Toca `schemas.ts`, `FormModal.astro` y `content/*/{classes,adults,children,other-arts}.json`. Verificar comparando el HTML construido contra `HEAD` (neutralizar el hash del CSS). |

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
| 2026-09-21 | Deploy de la spec 0043 a produccion | `git push origin main` → `9b17abf`; deployment `dojo-da-1e1irlnpr` ● Ready en 15 s por webhook. Las cuatro rutas de `/professor-*` en 200; captura de Chrome headless de `dojo-da-luz.vercel.app/professor-pablo-duran`: en la franja `#27231f` el titulo "Percurso" se lee en blanco; `/admin/paginas/professor` sin cookie → 302 a `/admin/entrar` con `X-Robots-Tag` |
| 2026-09-21 | Spec 0044 + ADR-0041/0042 — la pantalla de ajustes del sitio | `astro check` 119 archivos 0/0/0, `npm test` 39/39, build 44 rutas. **Capturas de las 44 paginas antes/despues comparadas pixel a pixel**: 23 solo con el tono claro corrido 5/255 en un canal, 21 ademas con el segundo renglon del pie 4 px mas abajo (eran dos valores distintos para el mismo bloque, unificados), **0 inesperadas**. Contra el BO corriendo: la pantalla con sus cuatro bloques, dos campos de imagen de 256 px, un selector de color y cuatro areas de pie; sin cambios → "no habia cambios"; hex invalido → 422 nombrando el campo; `sha` viejo → 409; acento `#b34700` → los cuatro tonos siguieron al color (`#b34700`, `#e8c8b3`, `#813300`) y **cero pixeles de los tres azules viejos**, con el BO todavia azul; logo puesto → `<img>` en lugar del circulo con el nombre intacto; Facebook vacio → 0 iconos en las tres posiciones y Instagram en 3; telefono y email → en el pie y en el JSON-LD (un solo bloque, parseable, con `telephone`, `email` y `sameAs`); Encarnação fuera del pie portugues → las once paginas portuguesas en una publicacion |
| 2026-09-21 | La captura de la Home no es determinista: es el video del hero | La comparacion pixel a pixel daba 864.704 pixeles distintos en las cuatro homes. **Capturando la misma pagina dos veces del mismo build** salio el mismo numero: el `<video>` del hero cae en un frame distinto cada vez. Sin ese control, el diff se habria leido como una regresion del cambio de colores. La banda `y 100–787` de las homes queda excluida y anotada, no explicada |
| 2026-09-21 | El acento tenia tres derivados, no dos | La primera pasada cambio `#0099ff`, `#b3e5ff` y `#006eb8`. Repasando **todos** los hex del sitio publico con `b > r + 20` aparecieron cuatro mas —`#d6f0ff` ×3 y `#cceeff`— usados en antetitulos **sobre** el acento. Con un acento herrumbre habrian quedado celestes sobre fondo naranja, y ningun typecheck lo ve. Buscar la clase de casos y no los casos que ya conocia es lo que lo encontro |
| 2026-09-21 | Deploy de la spec 0044 y la variante de 256 px contra R2 | `git push origin main` → `f932acc`; deployment `dojo-da-mtxc37cw5` ● Ready en 18 s. En produccion: `/`, `/dojo`, `/es`, `/fr`, `/en`, `/professor-pablo-duran` y `/contactos` en 200, todas con `html:root{--color-acento:#0099ff}`, la nota del pie, **0** `tel:` y **0** menciones al email de relleno, y 3 iconos de Facebook; `/admin/ajustes` sin cookie → 302 con `X-Robots-Tag`. Con sesion temporal contra produccion, un PNG de 1024x1024: `variante=icono` → `medios/5c12a7681bf3/w256.webp` (204 bytes), servido 200 como `image/webp` y medido con `sharp` en **256x256**; sin variante → `w1600.webp` (1952 bytes), clave distinta. Quedan los 3 objetos de la prueba en el bucket, sin referencias |
| 2026-09-21 | Auditoria del sitio publico: que es editable y que esta hardcodeado | Dos pasadas sobre las 44 paginas construidas: del codigo al HTML (literales en plantillas, atributos y frontmatter de los 13 componentes publicos) y del HTML al contenido (`title`, `meta`, `og`, JSON-LD, `alt`, `aria-label` y nodos de texto cruzados contra **todos** los valores de `content/`, incluidas las uniones de listas). Resultado: **ni un** `seo.title`, `seo.description`, parrafo, respuesta de FAQ, `alt` ni linea de pie sale del codigo. Lo que si: el `ORG` del JSON-LD, el video del hero, `og:image` (no existe), las 8 etiquetas del menu, los 2 `aria-label`, los nombres de idioma sin acento, el `mailto:EMAIL-PENDENTE` y la marca |
| 2026-09-21 | Crawl del Wix: 34 del sitemap, 3 fuera de el, 1 PDF | `robots.txt` no declara `Sitemap:`; `/sitemap.xml` → `/pages-sitemap.xml` → 34 URLs, **todas 200**, todas con `lastmod 2026-09-13` y **todas con `<html lang="es">`** (incluidas las portuguesas). Probadas a mano las rutas del doc 09: `/contactospt` ("Onde estamos"), `/atualidadept` ("Actualidade") y `/enseignant-fr` ("Pablo Durán") responden 200 y **no estan en el sitemap**; `/professeur-fr` da 404. El PDF de `/fr/aikido` sigue vivo: 6,7 MB. Catorce rutas plausibles mas, todas 404 |
| 2026-09-21 | El host canonico del dominio real, medido | `http://aikido-duran.com` → 301 a `https://aikido-duran.com` → 301 a `https://www.aikido-duran.com` → 200. El Wix consolida en **`www`**, que es lo que ya dice `astro.config.mjs`. Y los 44 `canonical` apuntan hoy a URLs que **dan 404** en ese dominio: comprobado en `/aulas`, `/dojo` y `/professor-pablo-duran` |
| 2026-09-21 | mistake→rule: el hook `acento-escrito.sh` | La primera pasada de la spec 0044 migro **tres** tonos del acento porque busque los tres que conocia; el cuarto aparecio al enumerar todos los hex y filtrar por una propiedad (`b > r + 20`). Ahora lo chequea un hook `PostToolUse` sobre `src/components/*.astro` y `src/layouts/*.astro`, que excluye el BO (se queda azul por el ADR-0041) y `global.css` (define el token). Probado con tres casos: componente publico limpio pasa, formulario del BO pasa, componente publico con `#b3e5ff` **falla con exit 2** |
| 2026-09-21 | mistake→rule: el piso de ruido de una comparacion | Las cuatro homes daban 864.704 pixeles distintos y parecia una regresion del cambio de colores; era el video del hero, que cae en otro fotograma por captura. Se detecto capturando **el mismo build dos veces**. Es advisory —no se chequea con un comando— asi que fue a `CLAUDE.md` |
| 2026-09-21 | Spec 0048 — los dos `aria-label` traducidos y los idiomas con acento | `astro check` 0/0/0, 39/39, build 44 rutas. En el HTML construido: **0** `aria-label="Idioma"` en las 11 paginas inglesas y las 11 francesas (dicen `Language` y `Langue`), 44 `Idioma` que son las 22 portuguesas y 22 españolas, y **0** apariciones de `Portugues` sin acento. Con el BO corriendo y una sesion temporal, `/admin/paginas/dojo` muestra `Português`, `Español`, `Français` e `English` y ninguna sin acento |
| 2026-09-21 | El diff de las 44 paginas se leyo carácter a carácter, no pagina a pagina | Las 44 salieron "distintas" (el navbar esta en todas) y eso no dice nada. Comparadas con `difflib` a nivel de carácter, el cambio entero son **nueve segmentos**: `e→ê`, `n→ñ` y `c→ç` ×242 cada uno, y los seis pedazos de `Idioma→Langue/Language` y `Principal→Principale/Main` ×22. **Cero** diferencias fuera de la spec. Mas informativo que la comparacion pixel a pixel que pedia la spec, y sin el ruido del video del hero |
| 2026-09-21 | Spec 0045 — 36 redirects `301`, `sitemap.xml` y la linea `Sitemap:` | `astro check` 0/0/0 (122 archivos), **53/53** (14 pruebas nuevas), build 44 rutas + `sitemap.xml`. Las 36 reglas verificadas **dos veces**: simulando el router sobre `.vercel/output/config.json` (36/36 exactas, ninguna vuelve a redirigir, los 36 destinos existen en disco) y **por HTTP** contra el servidor (36/36 dan `301` con `Location` exacto y el destino da `200` sin redirigir). `/no-existe`, `/videos` y `/galeria` → 404: no hay comodines. El sitemap: 44 `<loc>` unicas, los cuatro `hreflang` + `x-default` en cada una, ninguna es un origen redirigido, las 44 dan 200, y el conjunto es **identico** a los 44 `canonical` del HTML construido |
| 2026-09-21 | El test encontro dos saltos donde la matriz decia uno | `/enlaces-es` y `/links-fr` estaban escritos `/es/#parcerias` y `/fr/#parcerias` —copiados bien del documento 10—, y con `trailingSlash: 'never'` el adapter agrega un `308` de `/es/` a `/es`: dos saltos por cada backlink. Lo encontro `redirects.test.ts` antes del primer build, no la relectura. Y `#quotas` resulto estar traducido (`#cuotas`, `#tarifs`, `#fees`), al contrario de lo que decia el inventario: medido en el HTML. Las dos cosas, corregidas en el doc 10 y en el ADR-0045 |
| 2026-09-22 | Deploy de las specs 0045 y 0048, verificado en produccion | `git push origin main` → `b73235b`; deployment `dojo-da-ff32fle09` ● Ready en 16 s. Contra `dojo-da-luz.vercel.app`: las **36 reglas** dan `301` con `Location` exacto y su destino `200` —36/36, cero fallos—, y `/no-existe`, `/videos` y `/galeria` dan 404. `/sitemap.xml` responde 200 como `application/xml` con **44 `<loc>`**; `robots.txt` termina en su linea `Sitemap:`. Los `aria-label`: `Main`/`Language` en ingles, `Principale`/`Langue` en frances, `Principal`/`Idioma` en portugues y español; `Português`, `Español` y `Français` con acento |

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
