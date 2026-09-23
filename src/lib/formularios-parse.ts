import { randomUUID } from 'node:crypto'
import { texto } from './forms.ts'
import { LOCALES, type Locale } from './i18n.ts'
import { esSeleccion, PRESENTACIONES, type Campo, type Formulario, type Tipo } from './formularios.ts'

/**
 * `FormData` del editor de formularios → el objeto que valida `formularioSchema`.
 *
 * Vive aparte de la publicacion porque es lo unico que se puede probar solo: la
 * propagacion del portugues a los otros tres idiomas (ADR-0046) ocurre **dentro de un
 * mismo archivo**, campo por campo, y no se parece a la de las paginas —donde el archivo
 * de cada idioma es otro y las listas se alinean por posicion (ADR-0030)—.
 *
 * Los nombres del formulario son:
 *
 *   nombre, estado, submitLabel, successMessage
 *   fields[i].{id,type,required,quitar,orden,label,help,presentation}
 *   options[i][j].{id,label,quitar,orden}
 *
 * `id` vacio = elemento nuevo: el id lo pone el servidor y no se muestra nunca.
 */

const CAMPO = /^fields\[(\d+)\]\.(.+)$/
const OPCION = /^options\[(\d+)\]\[(\d+)\]\.(.+)$/

type Valores = Map<string, string>

/** Un id tecnico nuevo. Corto, estable y opaco: no significa nada y no se edita. */
export function nuevoId(prefijo: string): string {
  return `${prefijo}-${randomUUID().slice(0, 8)}`
}

function recoger(form: FormData, re: RegExp): Map<string, Valores> {
  const filas = new Map<string, Valores>()

  for (const [clave, valor] of form.entries()) {
    const m = re.exec(clave)
    if (!m) continue

    const indices = m.slice(1, -1).join('.')
    const campo = m.at(-1)!
    const fila = filas.get(indices) ?? new Map<string, string>()
    if (!fila.has(campo)) fila.set(campo, String(valor).trim())
    filas.set(indices, fila)
  }

  return filas
}

function orden(fila: Valores, porDefecto: number): number {
  const n = Number(fila.get('orden'))
  return Number.isFinite(n) ? n : porDefecto
}

/**
 * Quitar es explicito: una fila **que existe** y se vacia es un error que se ve, no una que
 * desaparece en silencio.
 *
 * La excepcion es la fila de mas que el editor pinta siempre al final para poder agregar sin
 * JavaScript: sin id y sin texto, nunca se lleno, y no publicarla no pierde nada.
 */
function viva(fila: Valores): boolean {
  if (fila.get('quitar') === 'si') return false
  return Boolean(fila.get('id') || fila.get('label'))
}

/**
 * El texto localizado de un elemento. El idioma que se esta editando sale del formulario;
 * los otros tres del elemento publicado, y si es nuevo nacen con el portugues — que es lo
 * que el editor marca «Sin traducir» hasta que alguien lo escriba.
 */
function localizado(
  valor: string,
  locale: Locale,
  publicado: Record<Locale, string> | undefined,
): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, l === locale ? valor : (publicado?.[l] ?? valor)]),
  ) as Record<Locale, string>
}

function ayuda(
  valor: string,
  locale: Locale,
  publicado: Record<Locale, string | null> | undefined,
): Record<Locale, string | null> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, l === locale ? valor || null : (publicado?.[l] ?? (valor || null))]),
  ) as Record<Locale, string | null>
}

/**
 * La presentacion se limpia segun el tipo (ADR-0046): cambiar un campo de seleccion a texto
 * en la pantalla no puede dejarle opciones colgadas en el archivo. El servidor lo hace
 * aunque la UI no confirme nada.
 */
function presentacionDe(tipo: Tipo, pedida: string): Campo['presentation'] {
  if (!esSeleccion(tipo)) return null
  const validas = PRESENTACIONES[tipo]
  return (validas.includes(pedida) ? pedida : validas[0]) as Campo['presentation']
}

function opcionesDe(
  form: FormData,
  indice: string,
  locale: Locale,
  publicadas: Map<string, Campo['options'][number]>,
): Campo['options'] {
  return [...recoger(form, OPCION)]
    .filter(([clave]) => clave.split('.')[0] === indice)
    .map(([clave, fila], i) => ({ pos: orden(fila, i), clave, fila }))
    .sort((a, b) => a.pos - b.pos || a.clave.localeCompare(b.clave))
    .filter(({ fila }) => viva(fila))
    .map(({ fila }) => {
      const id = fila.get('id') || ''
      const previa = publicadas.get(id)
      return {
        id: id || nuevoId('o'),
        label: localizado(fila.get('label') ?? '', locale, previa?.label),
      }
    })
}

function campoDesdeFila(
  form: FormData,
  indice: string,
  fila: Valores,
  locale: Locale,
  publicado: Campo | undefined,
): Campo {
  const tipo = (fila.get('type') ?? 'text') as Tipo
  const opciones = new Map((publicado?.options ?? []).map((o) => [o.id, o]))

  return {
    id: fila.get('id') || nuevoId('c'),
    type: tipo,
    required: fila.get('required') === 'si',
    label: localizado(fila.get('label') ?? '', locale, publicado?.label),
    help: ayuda(fila.get('help') ?? '', locale, publicado?.help),
    presentation: presentacionDe(tipo, fila.get('presentation') ?? ''),
    options: esSeleccion(tipo) ? opcionesDe(form, indice, locale, opciones) : [],
  }
}

/**
 * Portugues manda la estructura: el alta, la baja, el orden, el tipo y la obligatoriedad
 * solo salen de esta pestaña. Los otros tres idiomas conservan lo que ya tenian traducido.
 */
function desdePortugues(form: FormData, publicado: Formulario | null, idNuevo: string): unknown {
  const previos = new Map((publicado?.fields ?? []).map((c) => [c.id, c]))

  const fields = [...recoger(form, CAMPO)]
    .map(([clave, fila], i) => ({ pos: orden(fila, i), clave, fila }))
    .sort((a, b) => a.pos - b.pos || a.clave.localeCompare(b.clave))
    .filter(({ fila }) => viva(fila))
    .map(({ clave, fila }) => campoDesdeFila(form, clave, fila, 'pt', previos.get(fila.get('id') || '')))

  return {
    id: publicado?.id ?? idNuevo,
    nombre: texto(form, 'nombre'),
    estado: texto(form, 'estado') === 'archivado' ? 'archivado' : 'activo',
    submitLabel: localizado(texto(form, 'submitLabel'), 'pt', publicado?.submitLabel),
    successMessage: localizado(texto(form, 'successMessage'), 'pt', publicado?.successMessage),
    fields,
  }
}

/**
 * Traducir: la estructura es la publicada y **solo** cambian los textos de este idioma. Por
 * esta puerta no entra ni un campo de mas ni un tipo distinto, aunque el POST venga tocado:
 * los campos que el formulario manda y no existen se ignoran.
 */
function desdeTraduccion(form: FormData, locale: Locale, publicado: Formulario): unknown {
  const enviados = new Map(
    [...recoger(form, CAMPO).values()].map((fila) => [fila.get('id') ?? '', fila]),
  )
  const opciones = [...recoger(form, OPCION).values()]
  const porOpcion = new Map(opciones.map((fila) => [fila.get('id') ?? '', fila]))

  return {
    ...publicado,
    submitLabel: localizado(texto(form, 'submitLabel'), locale, publicado.submitLabel),
    successMessage: localizado(texto(form, 'successMessage'), locale, publicado.successMessage),
    fields: publicado.fields.map((campo) => {
      const fila = enviados.get(campo.id)

      return {
        ...campo,
        // Un campo que el formulario no mando se deja como esta: traducir es reemplazar lo
        // que llego, no vaciar lo que no llego.
        label: fila ? localizado(fila.get('label') ?? '', locale, campo.label) : campo.label,
        help: fila ? ayuda(fila.get('help') ?? '', locale, campo.help) : campo.help,
        options: campo.options.map((opcion) => {
          const suya = porOpcion.get(opcion.id)
          return suya
            ? { ...opcion, label: localizado(suya.get('label') ?? '', locale, opcion.label) }
            : opcion
        }),
      }
    }),
  }
}

export function formularioDesdeForm(
  form: FormData,
  locale: Locale,
  publicado: Formulario | null,
  idNuevo = '',
): unknown {
  return locale === 'pt'
    ? desdePortugues(form, publicado, idNuevo)
    : publicado === null
      ? null
      : desdeTraduccion(form, locale, publicado)
}
