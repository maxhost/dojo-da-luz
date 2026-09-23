import { createHash } from 'node:crypto'
import { Resend } from 'resend'
import { sql } from './db.ts'
import { env, type Config } from './formularios-envio.ts'

/**
 * Lo unico del envio que toca el mundo: las variables de entorno, el freno por IP en Neon y
 * Resend (ADR-0046). Esta aparte de `formularios-envio.ts` para que la validacion de una
 * respuesta se pueda probar sin base de datos ni red.
 */

/** Cuantos envios acepta una misma conexion por hora. */
const LIMITE = 5
const VENTANA = '1 hour'

/**
 * La IP no se guarda: se guarda sha256(sal + ip). Leer la tabla no dice quien escribio,
 * solo cuantas veces escribio el mismo de antes.
 */
export function hashDeIp(ip: string): string {
  return createHash('sha256').update(`${env('FORM_IP_SALT')}:${ip}`).digest('hex')
}

/** La IP del visitante detras de Vercel. Sin cabecera, todos comparten el mismo cubo. */
export function ipDe(request: Request): string {
  const reenviada = request.headers.get('x-forwarded-for') ?? ''
  return reenviada.split(',')[0]!.trim() || request.headers.get('x-real-ip') || 'desconocida'
}

/**
 * Cuenta y anota. Si la base no responde **no se frena el envio**: el freno es contra el
 * abuso, no contra el visitante, y un Neon caido no puede dejar al dojo sin inscripciones.
 */
export async function frenoDeEnvios(ip: string, formId: string): Promise<boolean> {
  try {
    const db = sql()
    const filas = (await db`
      select count(*)::int as envios
      from form_rate_limit
      where ip_sha256 = ${hashDeIp(ip)}
        and ocurrio_en > now() - interval '1 hour'
    `) as { envios: number }[]

    if ((filas[0]?.envios ?? 0) >= LIMITE) return false

    await db`
      insert into form_rate_limit (ip_sha256, form_id) values (${hashDeIp(ip)}, ${formId})
    `
    await db`delete from form_rate_limit where ocurrio_en < now() - interval '1 day'`
    return true
  } catch {
    return true
  }
}

export type Enviado = { ok: true } | { ok: false; detalle: string }

export async function enviarCorreo(args: {
  config: Config
  subject: string
  text: string
  html: string
  replyTo: string | null
}): Promise<Enviado> {
  const { config, subject, text, html, replyTo } = args

  try {
    // El e-mail del visitante va como `replyTo`, nunca como `from`: el remitente es un
    // dominio verificado del dojo (ADR-0046).
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: [config.to],
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    })

    return error ? { ok: false, detalle: error.message } : { ok: true }
  } catch (error) {
    return { ok: false, detalle: error instanceof Error ? error.message : String(error) }
  }
}

/** La ventana declarada, para que el aviso del backoffice no la repita a mano. */
export const FRENO = { limite: LIMITE, ventana: VENTANA }
