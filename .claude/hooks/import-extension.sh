#!/usr/bin/env bash
# PostToolUse (Write|Edit) — avisa si un import relativo en src/lib o src/pages no lleva
# extension.
#
# Mistake→rule (sesion del 2026-09-25): paso tres veces —r2.ts, eventos-edicion.ts,
# pagina-dojo-edicion.ts— el mismo bug. Vite/Astro resuelve `from './schemas'` sin
# extension, pero `node --test` (que es como corre `npm test`) no tiene bundler y
# revienta con ERR_MODULE_NOT_FOUND. El error no aparecia al escribir el archivo: aparecia
# recien cuando alguien agregaba el PRIMER test que lo importa directo, muchas sesiones
# despues. Se corta antes, al momento de escribir el import.

set -uo pipefail

input=$(cat)
f=$(printf '%s' "$input" | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try{const j=JSON.parse(s);process.stdout.write(j.tool_input?.file_path??"")}catch{}
  })' 2>/dev/null)

[ -n "$f" ] && [ -f "$f" ] || exit 0
case "$f" in *.test.ts) exit 0 ;; esac
case "$f" in
  src/lib/*.ts) ;;
  src/pages/*.ts) ;;
  *) exit 0 ;;
esac

# Imports relativos ('./x' o '../x') sin extension reconocida al final.
malos=$(grep -nE "from ['\"]\.\.?/[^'\"]*['\"]" "$f" 2>/dev/null \
  | grep -vE "\.(ts|json|js|mjs|cjs|css)['\"]" || true)

if [ -n "$malos" ]; then
  {
    printf '%s tiene un import relativo sin extension:\n' "$f"
    printf '%s\n' "$malos"
    printf '\n"node --test" no lo resuelve sin bundler (Vite/Astro si). Agregale ".ts" a cada uno.\n'
  } >&2
  exit 2
fi
exit 0
