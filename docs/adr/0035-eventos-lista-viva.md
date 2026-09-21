---
adr: 0035
fecha: 2026-09-21
estado: aceptada
resumen: La lista de /eventos deja de tener entre tres y cuatro tarjetas fijas: es de largo libre, se arma en portugues, y con cero eventos la pagina dice que no hay ninguno en vez de mostrar una franja vacia. Supersede el minimo de la spec 0026.
---

# 0035 — Eventos es una lista viva, y el vacio es un estado

## Contexto

`/eventos` nacio en la spec 0026 con cuatro tarjetas y un schema que exige **entre 3 y 4**
(`items: z.array(...).min(3).max(4)`). Las cuatro son de relleno: las cuatro dicen *"Data a
confirmar"*, y el ADR-0022 ya lo dejo escrito — *"Eventos sin fechas reales es una pagina
vacia de valor"*.

Una agenda tiene una propiedad que ninguna otra pagina del sitio tiene: **se vacia**. Un
seminario pasa y hay que sacarlo. El schema actual lo prohibe: para borrar el tercero hay
que inventar uno. Y al reves, un año con seis encuentros no entra.

## Decision

**La lista es de largo libre y el vacio es un estado con texto propio.**

- `items` pierde el minimo y el maximo. Se añaden y se quitan eventos desde la pestaña
  portuguesa (ADR-0030); la foto la siembra portugues a los cuatro idiomas (ADR-0032).
- **Con cero eventos la lista no se pinta.** En su lugar va una linea —`emptyText`, editable
  y traducible— que dice que no hay eventos proximos. No es un mensaje del sistema: es
  contenido, y por eso lo escribe el cliente en cada idioma.
- La alternancia izquierda/derecha se mantiene y sale de la posicion: el evento impar lleva
  la foto a la derecha. Con uno solo o con siete funciona igual.
- El numero de cada evento se pinta con dos digitos por posicion. El `0{index + 1}` que hay
  escrito hoy dice `010` a partir del decimo — el mismo defecto que se corrigio en
  `/aikido`, y aca deja de ser latente en cuanto la lista pueda crecer.

## Consecuencias

- Supersede el `.min(3).max(4)` de la spec 0026. El build deja de exigir tres eventos
  inventados.
- **Una pagina sin eventos sigue siendo una pagina valida**, con su hero y su linea. Es
  mejor que una franja beige vacia y que una agenda con cuatro entradas falsas.
- `emptyText` es obligatorio aunque no se vea casi nunca: un campo que solo existe cuando
  hace falta es un campo que nadie escribio el dia que hizo falta.
- Las cuatro tarjetas de relleno **se conservan**: borrarlas es una decision de contenido
  del cliente, y ahora la puede tomar el con dos clics.
