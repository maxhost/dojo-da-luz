#!/usr/bin/env bash
# PostToolUse (Write|Edit) — un componente publico no puede traer un azul escrito.
#
# El acento del sitio es un token del tema y sus tres tonos se calculan con
# `color-mix` (ADR-0041): `bg-acento`, `text-acento`, `text-acento-claro`,
# `text-acento-oscuro`, `text-acento-tenue`.
#
# Por que existe este hook: el 2026-09-21, al migrar los 74 hex a tokens, la
# primera pasada encontro TRES tonos porque busque los tres que ya conocia.
# El cuarto —`#d6f0ff`/`#cceeff`, los antetitulos SOBRE el acento— aparecio
# recien al enumerar todos los hex del sitio y filtrar por una propiedad
# (azul > rojo). Con un acento herrumbre habrian quedado celestes sobre naranja,
# y no lo ve ningun typecheck ni ninguna captura del estado actual: el defecto
# aparece el dia que el cliente cambia el color.
#
# La regla es la propiedad, no la lista: cualquier hex con el canal azul mas de
# 20 por encima del rojo, en un componente del sitio publico, es un tono de la
# marca escrito a mano.
#
# NO aplica a `src/components/admin/` ni a `src/pages/admin/`: el backoffice se
# queda azul a proposito (ADR-0041). Ni a `global.css`, que es donde el token
# se define.

set -uo pipefail

input=$(cat)
f=$(printf '%s' "$input" | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try{const j=JSON.parse(s);process.stdout.write(j.tool_input?.file_path??"")}catch{}
  })' 2>/dev/null)

[ -n "$f" ] && [ -f "$f" ] || exit 0

case "$f" in
  */src/components/admin/*|*/src/pages/admin/*) exit 0 ;;
  */src/components/*.astro|*/src/layouts/*.astro) ;;
  *) exit 0 ;;
esac

hallados=$(grep -oE '#[0-9a-fA-F]{6}' "$f" | sort -u | while read -r hex; do
  r=$((16#${hex:1:2}))
  b=$((16#${hex:5:2}))
  if [ "$b" -gt "$((r + 20))" ]; then printf '%s ' "$hex"; fi
done)

if [ -n "$hallados" ]; then
  printf '%s trae un tono de la marca escrito a mano: %s\n' "$f" "$hallados" >&2
  printf 'Usar los tokens del tema (bg-acento, text-acento, text-acento-claro,\n' >&2
  printf 'text-acento-oscuro, text-acento-tenue). ADR-0041: el acento es un campo\n' >&2
  printf 'del backoffice y un hex escrito no lo sigue cuando el cliente lo cambia.\n' >&2
  exit 2
fi
exit 0
