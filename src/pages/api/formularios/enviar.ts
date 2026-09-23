import type { APIRoute } from 'astro'
import { getFormulario } from '../../../lib/formularios'
import { componerEmail, configDeCorreo, validarEnvio } from '../../../lib/formularios-envio'
import { enviarCorreo, frenoDeEnvios, ipDe } from '../../../lib/formularios-correo'
import { isLocale } from '../../../lib/i18n'

export const prerender = false

/**
 * El unico camino por el que una respuesta llega al dojo (spec 0050).
 *
 * Nada de lo que manda el navegador describe el formulario: llega un `formId` y el servidor
 * carga la definicion publicada, valida contra ella y compone el correo con sus propios
 * labels. Los detalles de por que algo se rechazo **no viajan al cliente**: son para el log.
 */

const json = (cuerpo: unknown, status: number) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

export const POST: APIRoute = async ({ request }) => {
  const config = configDeCorreo()
  // Sin configuracion no se finge exito: la UI explica que no se puede enviar.
  if (!config) return json({ ok: false, motivo: 'sin-configuracion' }, 503)

  let cuerpo: Record<string, unknown>
  try {
    cuerpo = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ ok: false, motivo: 'peticion-invalida' }, 400)
  }

  // Honeypot: un campo que ninguna persona ve y ningun teclado llena.
  if (String(cuerpo.website ?? '') !== '') return json({ ok: true }, 200)

  const formId = String(cuerpo.formId ?? '')
  const locale = String(cuerpo.locale ?? '')
  const formulario = getFormulario(formId)

  if (!formulario || formulario.estado !== 'activo' || !isLocale(locale)) {
    return json({ ok: false, motivo: 'formulario-desconocido' }, 404)
  }

  const validado = validarEnvio(formulario, cuerpo.values)
  if (!validado.ok) {
    console.warn(`formulario ${formId}: respuesta rechazada — ${validado.motivo}`)
    return json({ ok: false, motivo: 'respuesta-invalida' }, 422)
  }

  if (!(await frenoDeEnvios(ipDe(request), formId))) {
    return json({ ok: false, motivo: 'demasiados-envios' }, 429)
  }

  const correo = componerEmail({
    formulario,
    locale,
    source: String(cuerpo.source ?? '').slice(0, 200),
    lineas: validado.lineas,
  })

  const enviado = await enviarCorreo({ config, ...correo, replyTo: validado.replyTo })
  if (!enviado.ok) {
    console.error(`formulario ${formId}: Resend fallo — ${enviado.detalle}`)
    return json({ ok: false, motivo: 'no-se-pudo-enviar' }, 502)
  }

  return json({ ok: true }, 200)
}
