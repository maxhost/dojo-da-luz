import { textoDe, type Campo, type Formulario } from './formularios.ts'
import { LOCALE_NAME, type Locale } from './i18n.ts'

/**
 * Una respuesta que llega del navegador, validada contra la definicion **publicada**
 * (spec 0050). Nada de lo que manda el cliente describe el formulario: los labels, los
 * tipos y las opciones salen del archivo, y lo que no coincide se rechaza.
 *
 * Es una funcion pura a proposito —sin Neon, sin Resend, sin `Request`— para poder probar
 * el rechazo de un campo manipulado sin levantar nada.
 */

const MAX_TEXTO = 500
const MAX_PARRAFO = 4000
const MAX_TOTAL = 10_000
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

export type Linea = { label: string; valor: string }

export type Config = { apiKey: string; from: string; to: string }

export function env(nombre: string): string {
  return process.env[nombre] ?? (import.meta.env[nombre] as string | undefined) ?? ''
}

/**
 * Sin las tres variables no se envia y **no se finge exito**: el boton queda deshabilitado
 * y el endpoint contesta 503. Un formulario que dice "enviado" sin enviar es peor que uno
 * que no existe.
 *
 * Vive aca y no junto a Resend porque lo pregunta tambien el formulario publico, que se
 * pinta en el build y no puede arrastrar el SDK ni el cliente de Neon al sitio estatico.
 */
export function configDeCorreo(): Config | null {
  const apiKey = env('RESEND_API_KEY')
  const from = env('FORM_FROM_EMAIL')
  const to = env('FORM_TO_EMAIL')

  return apiKey && from && to ? { apiKey, from, to } : null
}

export type Validado =
  | { ok: true; lineas: Linea[]; replyTo: string | null }
  | { ok: false; motivo: string }

function invalido(campo: Campo, detalle: string): Validado {
  return { ok: false, motivo: `${campo.id}: ${detalle}` }
}

/** El label que lee quien recibe el correo: siempre el portugues, sea cual sea el visitante. */
function etiqueta(campo: Campo): string {
  return textoDe(campo.label, 'pt')
}

function textoDeOpcion(campo: Campo, id: string): string | null {
  const opcion = campo.options.find((o) => o.id === id)
  return opcion ? textoDe(opcion.label, 'pt') : null
}

function validarSeleccionMultiple(campo: Campo, valor: unknown): Validado {
  const ids = Array.isArray(valor) ? valor : valor === undefined || valor === '' ? [] : [valor]
  if (!ids.every((v) => typeof v === 'string')) return invalido(campo, 'valor de tipo incorrecto')

  if (ids.length === 0) {
    return campo.required
      ? invalido(campo, 'campo obligatorio')
      : { ok: true, lineas: [], replyTo: null }
  }

  const etiquetas = (ids as string[]).map((id) => textoDeOpcion(campo, id))
  if (etiquetas.some((e) => e === null)) return invalido(campo, 'opcion inexistente')
  if (new Set(ids as string[]).size !== ids.length) return invalido(campo, 'opcion repetida')

  return { ok: true, lineas: [{ label: etiqueta(campo), valor: etiquetas.join(', ') }], replyTo: null }
}

function validarCampo(campo: Campo, bruto: unknown): Validado {
  if (campo.type === 'multipleChoice') return validarSeleccionMultiple(campo, bruto)

  if (Array.isArray(bruto)) return invalido(campo, 'valor de tipo incorrecto')
  if (bruto !== undefined && typeof bruto !== 'string') {
    return invalido(campo, 'valor de tipo incorrecto')
  }

  const valor = (bruto ?? '').trim()

  if (!valor) {
    return campo.required
      ? invalido(campo, 'campo obligatorio')
      : { ok: true, lineas: [], replyTo: null }
  }

  const maximo = campo.type === 'textarea' ? MAX_PARRAFO : MAX_TEXTO
  if (valor.length > maximo) return invalido(campo, 'texto demasiado largo')

  if (campo.type === 'singleChoice') {
    const label = textoDeOpcion(campo, valor)
    if (label === null) return invalido(campo, 'opcion inexistente')
    return { ok: true, lineas: [{ label: etiqueta(campo), valor: label }], replyTo: null }
  }

  if (campo.type === 'email' && !EMAIL.test(valor)) return invalido(campo, 'e-mail invalido')

  if (campo.type === 'number' && !Number.isFinite(Number(valor.replace(',', '.')))) {
    return invalido(campo, 'numero invalido')
  }

  if (campo.type === 'date') {
    const fecha = new Date(valor)
    if (!FECHA.test(valor) || Number.isNaN(fecha.getTime())) return invalido(campo, 'fecha invalida')
  }

  return {
    ok: true,
    lineas: [{ label: etiqueta(campo), valor }],
    replyTo: campo.type === 'email' ? valor : null,
  }
}

/**
 * La respuesta entera. Un campo que el formulario no declara es un rechazo, no un campo que
 * se ignora: si llego, alguien lo puso, y el correo lo compone el servidor con su propia
 * definicion.
 */
export function validarEnvio(formulario: Formulario, values: unknown): Validado {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return { ok: false, motivo: 'respuesta mal formada' }
  }

  const enviados = values as Record<string, unknown>
  const conocidos = new Set(formulario.fields.map((c) => c.id))

  for (const clave of Object.keys(enviados)) {
    if (!conocidos.has(clave)) return { ok: false, motivo: `campo desconocido: ${clave}` }
  }

  const lineas: Linea[] = []
  let replyTo: string | null = null

  for (const campo of formulario.fields) {
    const resultado = validarCampo(campo, enviados[campo.id])
    if (!resultado.ok) return resultado

    lineas.push(...resultado.lineas)
    replyTo ??= resultado.replyTo
  }

  const total = lineas.reduce((suma, l) => suma + l.label.length + l.valor.length, 0)
  if (total > MAX_TOTAL) return { ok: false, motivo: 'respuesta demasiado larga' }

  return { ok: true, lineas, replyTo }
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * El correo que recibe el dojo. Los labels van en portugues y el idioma del visitante va
 * escrito: es lo que dice en que lengua conviene contestarle.
 */
export function componerEmail(args: {
  formulario: Formulario
  locale: Locale
  source: string
  lineas: Linea[]
}): { subject: string; text: string; html: string } {
  const { formulario, locale, source, lineas } = args

  const cabecera = [
    `Formulário: ${formulario.nombre}`,
    `Idioma do visitante: ${LOCALE_NAME[locale]}`,
    source ? `Página: ${source}` : null,
  ].filter((l): l is string => l !== null)

  const cuerpo = lineas.map((l) => `${l.label}: ${l.valor}`)

  return {
    subject: `${formulario.nombre} — nova resposta`,
    text: [...cabecera, '', ...cuerpo].join('\n'),
    html: [
      ...cabecera.map((l) => `<p style="margin:0;color:#625c55">${escapar(l)}</p>`),
      '<hr style="margin:16px 0;border:0;border-top:1px solid #d7cec0" />',
      ...lineas.map(
        (l) =>
          `<p style="margin:0 0 12px"><strong>${escapar(l.label)}</strong><br />${escapar(
            l.valor,
          ).replace(/\n/g, '<br />')}</p>`,
      ),
    ].join('\n'),
  }
}
