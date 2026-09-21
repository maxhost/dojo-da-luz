/**
 * Portugues es el dueño de la estructura (ADR-0030).
 *
 * El editor publica un idioma por vez. Con listas de largo libre eso deja derivar los
 * cuatro archivos —ocho cuotas en portugues, siete en frances— sin que nada falle: cada
 * archivo es valido por separado, asi que ninguna validacion puede ver el problema.
 *
 * La salida es que el alta y la baja de filas solo ocurren en portugues y se propagan a
 * los otros tres. Aca vive esa propagacion, sin nada de Astro, para poder probarla sola.
 */

/** Ruta con puntos hasta una lista dentro del JSON. `pricing.items`, `qa.items`. */
export type RutaLista = string

/** Las cinco listas de `/aulas` cuyo largo lo decide el portugues (spec 0035). */
export const LISTAS_AULAS: readonly RutaLista[] = [
  'pricing.items',
  'pricing.notes',
  'children.paragraphs',
  'children.facts',
  'qa.items',
]

type Obj = Record<string, unknown>

function leerRuta(raiz: unknown, ruta: RutaLista): unknown {
  return ruta.split('.').reduce<unknown>((actual, clave) => {
    return actual && typeof actual === 'object' ? (actual as Obj)[clave] : undefined
  }, raiz)
}

function escribirRuta(raiz: Obj, ruta: RutaLista, valor: unknown): void {
  const claves = ruta.split('.')
  const ultima = claves.pop()!
  const destino = claves.reduce<Obj>((actual, clave) => actual[clave] as Obj, raiz)
  destino[ultima] = valor
}

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T
}

/**
 * Alinea las listas de `otro` con las de `pt`, **por posicion**:
 *
 * - PT tiene mas filas → las que faltan se copian de PT tal cual, para traducir despues.
 * - PT tiene menos → las sobrantes de `otro` se descartan.
 * - Misma cantidad → `otro` queda intacto. Traducir no es asunto de esta funcion.
 *
 * Todo lo que no es una de las listas declaradas se deja como esta.
 *
 * **Por posicion y no por identidad**: reordenar filas en PT desalinea las traducciones.
 * Es el costo aceptado en el ADR-0030 — un id por fila seria un campo mas en la pantalla
 * del cliente que no significa nada para el, que es el error que corrigio el ADR-0029.
 */
export function propagarEstructura<T>(pt: unknown, otro: T, listas: readonly RutaLista[]): T {
  const resultado = clonar(otro) as unknown as Obj

  for (const ruta of listas) {
    const filasPt = leerRuta(pt, ruta)
    const filasOtro = leerRuta(resultado, ruta)
    if (!Array.isArray(filasPt) || !Array.isArray(filasOtro)) continue

    escribirRuta(
      resultado,
      ruta,
      filasPt.map((filaPt, i) => (i < filasOtro.length ? filasOtro[i] : clonar(filaPt))),
    )
  }

  return resultado as unknown as T
}

/**
 * Una fila cuyo texto es todavia identico al portugues. Es la unica señal de que queda
 * trabajo: un archivo con texto portugues adentro es perfectamente valido y no lo
 * delata nada mas.
 *
 * En la pestaña portuguesa siempre da `false`: comparar el portugues consigo mismo diria
 * que todo esta sin traducir.
 */
export function sinTraducir(filaPt: unknown, filaOtro: unknown): boolean {
  return JSON.stringify(filaPt) === JSON.stringify(filaOtro)
}

/** Las filas sin traducir de una lista, por indice. Lo que el BO usa para pintar la marca. */
export function indicesSinTraducir(pt: unknown, otro: unknown, ruta: RutaLista): number[] {
  const filasPt = leerRuta(pt, ruta)
  const filasOtro = leerRuta(otro, ruta)
  if (!Array.isArray(filasPt) || !Array.isArray(filasOtro)) return []

  return filasPt.flatMap((filaPt, i) => (sinTraducir(filaPt, filasOtro[i]) ? [i] : []))
}
