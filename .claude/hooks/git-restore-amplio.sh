#!/usr/bin/env bash
# PreToolUse (Bash) — veta `git checkout --` y `git restore` sobre un DIRECTORIO.
#
# Por que existe: el 2026-09-21 el agente corrio `git checkout -- content/` para
# deshacer un cambio de prueba en `content/pt/home.json`, y de paso reverso la
# normalizacion de `content/dojos.json` — trabajo de la misma sesion, no
# commiteado, que no tenia nada que ver. El error no se vio hasta dos pasos
# despues.
#
# El problema no es el comando: es el alcance. Restaurar un archivo concreto es
# seguro; restaurar un arbol entero pisa todo lo que haya sin commitear ahi
# dentro, y quien lo escribe casi nunca esta pensando en eso.
#
# PreToolUse porque es el unico veto real: PostToolUse ya llega tarde, el
# working tree ya se perdio.
#
# Alternativas que el agente si puede usar:
#   git checkout -- content/pt/home.json      # un archivo, explicito
#   cp /tmp/instantanea.json content/x.json   # instantanea propia

set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try{const j=JSON.parse(s);process.stdout.write(j.tool_input?.command??"")}catch{}
  })' 2>/dev/null)

[ -n "$cmd" ] || exit 0

# Solo miran los `git checkout --` / `git restore` que traen rutas.
case "$cmd" in
  *"git checkout --"*|*"git restore "*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

# Recorta desde el verbo y descarta banderas: quedan las rutas.
rutas=$(printf '%s' "$cmd" \
  | sed -E 's/.*git (checkout --|restore)//' \
  | tr '|;&' '\n' | head -1 \
  | tr ' ' '\n' | grep -v '^-' | grep -v '^$')

for r in $rutas; do
  r="${r%\"}"; r="${r#\"}"; r="${r%\'}"; r="${r#\'}"
  if [ "$r" = "." ] || [ -d "$r" ]; then
    printf 'Bloqueado: `git checkout/restore` sobre el directorio "%s".\n' "$r" >&2
    printf 'Eso pisa TODO lo que no este commiteado ahi dentro, no solo lo que quisiste deshacer.\n' >&2
    printf 'Nombra el archivo concreto, o restaura desde una instantanea tuya en /tmp.\n' >&2
    exit 2
  fi
done

exit 0
