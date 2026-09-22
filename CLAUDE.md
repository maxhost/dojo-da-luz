# CLAUDE.md

> Instalado por GlaDOS (plantilla del arnes v1). Es tuyo: editalo con el uso —
> cada error observado del agente deberia volverse una linea aca o un hook (mistake→rule).

Directrices del proyecto. Se cargan siempre y cuestan tokens en cada request — aca va
solo lo que cambia una decision. Lo derivable del codigo no va: leelo del arbol.

- **`docs/INDEX.md`** — mapa de ADRs y specs. **Empeza aca**, no leas todo.
- **`docs/TASKS.md`** — estado actual. El punto de retorno si esta sesion se cae.
- `.claude/settings.json` — lo que esta enforced (hooks + permisos).

## Flujo de trabajo

1. **Leer `docs/TASKS.md` antes de empezar.** Es el estado real, no lo que diga el chat.
2. **Ninguna tarea toca codigo sin su spec cerrada** (`docs/specs/`, plantilla en
   `TEMPLATE.md`). La subespecificacion es el gatillo medido del exito fingido: en tareas
   resolubles y bien definidas el reward hacking cae a 0%; en tareas vagas, ~50%.
3. **Toda decision de diseño genera un ADR** (`docs/adr/`) con fecha y `resumen` de una
   linea en el frontmatter. El resumen es lo que se lee sin abrir el archivo.
4. **Agregar la fila a `docs/INDEX.md` en el mismo commit.** Un indice viejo es peor que
   ninguno.
5. **Actualizar `docs/TASKS.md` al terminar.** Hay un hook `Stop` que lo exige si quedo
   viejo respecto del codigo tocado.
6. **Marcar `hecho` solo con verificacion real** — test que pasa, comando corrido, cosa
   vista en pantalla. Nunca "deberia andar".

## Estado

**Lo que tiene que sobrevivir va a un archivo, no a la conversacion.** La compactacion
borra lo que vive solo en el chat; el disco se re-lee. Un plan que es un mensaje no es
un plan.

**Handoff SIEMPRE seguido de `/clear`.** El handoff baja el estado a disco pero NO libera
la ventana de contexto. Orden sagrado: handoff PRIMERO (a disco), clear DESPUES. Nunca
compact: comprime con perdida.

## Verificacion

**Ninguna afirmacion de exito vale sin una señal que el modelo no genero** — tests,
typecheck, exit code. La auto-revision sin oraculo es negativa neta.

**Mistake→rule:** cada error observado del agente se convierte en un fix estructural
permanente — un hook si se chequea con un comando, una linea aca si es advisory. Nunca
la misma correccion dos veces a mano.

**El estado de la infra se lee con el CLI del proveedor, no con su MCP.** El 2026-09-18
`mcp__vercel__list_projects` devolvio 3 de 8 proyectos y de ahi salio la conclusion falsa
"no existe proyecto Vercel". `vercel project ls` los lista todos. Un listado vacio o corto
de un MCP no prueba ausencia: confirmalo con el CLI antes de afirmar que algo no existe.

**Un problema visual con una imagen se diagnostica en el archivo, no en el CSS.** El
2026-09-21 quitar `bg-white` de Parcerias no quito el blanco: lo traen los ocho logos
incrustado — los PNG salen de Wix con `hasAlpha: no` y el resto son JPEG. Todo el media del
sitio es salida de `static.wixstatic.com`, aplanada y sin alfa. Antes de tocar CSS por un
fondo, un borde o un recorte, bajate el archivo y mirale los pixeles (`sips -g hasAlpha`,
pixeles de borde). Que el CSS este limpio no prueba que la pagina se vea limpia.

**Un valor esperado en un test sale de una fuente, no de la memoria.** El 2026-09-21 la
prueba de la firma SigV4 traia tres vectores de AWS y uno fallaba: el hash esperado estaba
mal transcripto, no el codigo. Media hora en diagnosticar codigo sano. Si el valor no se
puede copiar de una fuente consultable, no es un vector: es una invencion. Escribi en su
lugar la propiedad que se puede comprobar sola (dos entradas equivalentes dan la misma
salida) y deci que no es un vector.

**El endpoint de un proveedor se copia de su consola, no se deriva de un id.** El
2026-09-21 la subida a R2 dio `403` y despues `404 NoSuchBucket` contra un bucket que
existia: el codigo armaba `<cuenta>.r2.cloudflarestorage.com` a partir del account id, pero
el bucket estaba creado con jurisdiccion EU y vive en `<cuenta>.eu.r2.cloudflarestorage.com`.
Como el host va firmado en SigV4, ninguna variable de entorno podia arreglarlo. Antes de
mandar a revisar permisos o claves, **lee el codigo de error**: dice que capa fallo
—firma, clave, permiso o host— y dos de esas cuatro no se arreglan configurando.

**Una pantalla no se diseña a ciegas: se aprueba el layout antes de implementarlo.** El
2026-09-21 hubo tres iteraciones seguidas de la interfaz del backoffice —specs 0031, 0032 y
0033— rechazadas por el cliente, y la sesion termino con "olvidate". El ciclo fue siempre el
mismo: proponer una pantalla, implementarla entera, desplegarla, y recien ahi enterarse de
que no era. Agravante: **nadie del lado del agente pudo ver una sola pantalla del BO** (hace
falta contraseña), asi que cada entrega fue una hipotesis presentada como terminada. Si la
tarea es de UI y no se puede ver el resultado, **el entregable de la primera vuelta no es
codigo**: es el layout campo por campo para que el usuario lo apruebe o lo corrija. El
codigo va despues. Un `astro check` en verde no dice nada sobre si la pantalla se entiende.

**Que un campo exista en el JSON no prueba que la pagina lo use.** El 2026-09-21 el editor
de `/aulas` salio a produccion con un bloque "Etiquetas del menu" que editaba `chrome.nav`,
un campo que **ninguna de las diez vistas lee** —todas arman su menu con `siteNav(locale)`—
y que estaba muerto en `home.json` y `classes.json` desde el scaffold. Tres de sus cinco
`href` ni figuraban en el HTML. Lo encontro el cliente preguntando "¿que menu, el navbar o
el footer?". Antes de poner un campo en un formulario del BO, **buscar quien lo renderiza**
(`grep` del nombre en `src/`). Que valide contra el schema solo prueba que el archivo esta
bien formado, no que alguien lo pinte. Un formulario que no hace nada es peor que no
tenerlo: el cliente escribe, publica y no pasa nada.

**Para probar que algo se borro sin romper nada, compara el HTML construido.**
`git worktree add /tmp/antes HEAD`, construir ahi, y comparar pagina por pagina. Es una señal
que el modelo no genero, a diferencia de releer el diff y convencerse.
**Neutraliza antes el hash del CSS**: cualquier clase de Tailwind nueva cambia el nombre del
bundle y con el, el hash de las 44 paginas — el 2026-09-21 la comparacion dijo "cambiaron
todas" y la unica diferencia real en las 36 intactas era `Base.<hash>.css`. Con
`sed 's|Base\.[A-Za-z0-9_-]*\.css|Base.CSS|g'` antes del `shasum`, quedaron exactamente las
8 paginas que la spec decia que iban a cambiar.

**El keyring de macOS tapa el token que le pasas a `git push`.** El 2026-09-21 dos intentos
con un PAT valido fallaron con "Invalid username or token": `credential.helper=osxkeychain`
esta configurado en `~/.gitconfig` **y** en el de Xcode, corre primero y contesta con una
credencial vieja. Agregar un helper con `-c` no alcanza: hay que **resetear la lista** con
`-c credential.helper=` vacio antes de sumar el propio. Y antes de culpar al token,
verificalo: `curl -H "Authorization: token <t>" https://api.github.com/user`.

El 2026-09-21 volvio a pasar con un agravante: **los dos tokens del entorno estaban
muertos** —el `GITHUB_TOKEN` de `.env` y el `GH_TOKEN` del perfil, los dos 401— y el unico
vivo era el del keyring de `gh`, que `GH_TOKEN` tapaba por ser la cuenta activa. La receta
que funciono:
`GH_TOKEN= GITHUB_TOKEN= bash -c 'T=$(gh auth token) && git -c credential.helper= -c credential.helper="!f(){ echo username=x-access-token; echo \"password=$T\"; };f" push origin main'`.
`gh auth status` es lo primero que hay que mirar: dice cual credencial esta viva y cual esta
ganando.

**Antes de `git push`, traete lo que el backoffice haya commiteado.** El BO publica
commiteando a `main` desde produccion (ADR-0025): el remoto se mueve **sin que nadie del
lado del agente haga nada**. El 2026-09-21 pasó dos veces — la segunda, un push valido
rebotó con "non-fast-forward" y el commit que estorbaba era `a73982d`, *"contenido: Aulas
desde el backoffice"*, escrito por el cliente probando el editor. No es un conflicto: es el
producto funcionando. `git fetch origin main && git rebase origin/main` y listo; el rebase
es limpio porque el BO solo toca `content/`.

**Contar un atributo con `grep -o` en el HTML de produccion cuenta tambien el script.** El
2026-09-21 la comprobacion del editor de `/eventos` en produccion dio *11 campos de imagen y
2 botones de alta* donde en local daban 6 y 1: Astro **inlinea los scripts chicos** en el
build, asi que `'[data-campo-imagen]'` y `'[data-anadir]'` aparecen tambien dentro del
`<script>`, y el dev server no —los sirve como archivo aparte. No era un defecto. Conta el
atributo con el `=` (`data-campo-imagen=`) o el texto visible del boton, no el selector.

**Un `303` del backoffice no prueba que haya pasado algo: lee la query del `Location`.** El
2026-09-21 la comprobacion de que archivar un dojo saca su tarjeta de `/contactos` dio
"dos tarjetas" y casi se publica como verificada: el POST a `/admin/dojos/<slug>/archivar`
**no archivo nada** porque le faltaba el `sha`, y ese endpoint contesta igual `303` —pero a
`?fallo=...` en vez de `?ok=...`—. Un redirect es el camino feliz y el infeliz a la vez.
Mira `%{redirect_url}` con `curl -o /dev/null -w`, o comproba el archivo en disco, antes de
dar por hecho el efecto.

**Despues de publicar desde el BO local, la primera peticion a la pagina publica puede
traer el contenido viejo.** El 2026-09-21 paso dos veces —`/eventos` y `/outras-artes`
dijeron "10 tarjetas" y "5 medios" con el archivo ya vacio en disco— porque `astro dev`
sirve el modulo de contenido cacheado hasta que rehace el grafo. No es un defecto del
editor: es el dev server. Comproba **primero el archivo en `content/`** y, si vas a mirar el
HTML, pedilo en un bucle hasta que coincida (`for i in 1 2 3; do curl …; done`) en vez de
concluir con la primera respuesta.

**Una comparacion de capturas necesita su piso de ruido antes de leerse.** El 2026-09-21 la
verificacion de la spec 0044 comparo las 44 paginas pixel a pixel y las cuatro homes daban
**864.704 pixeles distintos**: parecia que el cambio de colores habia roto la portada.
Capturando **dos veces el mismo build** salio el mismo numero — es el `<video>` del hero, que
cae en un fotograma distinto en cada captura. La regla general: cuando el oraculo es una
medicion, **medi primero cuanto se mueve sola** y recien despues leé la diferencia. Sin ese
control se reporta una regresion que no existe, o peor, se "arregla".

**Las reglas verificables van en hooks, no aca.** Los hooks corren fuera del contexto,
cuestan cero tokens y son deterministas; este archivo es advisory. Si una regla se puede
chequear con un comando, es un hook — no la escribas aca tambien.

## Codigo

- Si un archivo supera el limite de tamaño (hook `file-size`): dividir, no extender.
- No editar ni borrar tests para que el gate pase: un test rojo se arregla o se discute.
- Nada de andamiaje sin su tarea: codigo que no se usa hoy va con su fila en
  `docs/TASKS.md` que lo va a consumir, o se borra.
