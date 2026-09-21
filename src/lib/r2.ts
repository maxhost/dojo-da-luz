import { createHash, createHmac } from 'node:crypto'

/**
 * Cliente minimo de R2 por su API S3 (spec 0030). Firma SigV4 a mano con `node:crypto`:
 * `@aws-sdk/client-s3` son varios MB de dependencia para hacer un PUT, y el tamaño de la
 * funcion importa porque ahi tambien vive `sharp`.
 *
 * Solo lo que el backoffice necesita: comprobar si un objeto existe, subirlo, y listar lo
 * subido. Nada de borrar (spec 0030: no entra).
 */

const REGION = 'auto'
const SERVICIO = 's3'

function env(nombre: string): string {
  return process.env[nombre] ?? (import.meta.env[nombre] as string | undefined) ?? ''
}

export type ConfigR2 = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl: string
  /** Jurisdiccion del bucket: '' (ninguna), 'eu' o 'fedramp'. Cambia el host, que va firmado. */
  jurisdiccion: string
}

/** Devuelve la config o el nombre de lo que falta: nunca a medias. */
export function configR2(): ConfigR2 | { falta: string[] } {
  const claves = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
  ] as const

  const falta = claves.filter((c) => !env(c))
  if (falta.length > 0) return { falta: [...falta] }

  return {
    accountId: env('R2_ACCOUNT_ID'),
    accessKeyId: env('R2_ACCESS_KEY_ID'),
    secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    bucket: env('R2_BUCKET'),
    publicUrl: env('R2_PUBLIC_URL').replace(/\/+$/, ''),
    // Opcional: un bucket sin jurisdiccion no la lleva en el host. No se valida contra una
    // lista porque Cloudflare puede sumar jurisdicciones sin que este codigo se entere.
    jurisdiccion: env('R2_JURISDICTION').trim().toLowerCase().replace(/^\.|\.$/g, ''),
  }
}

const sha256 = (dato: string | Buffer) => createHash('sha256').update(dato).digest('hex')
const hmac = (clave: Buffer, dato: string) => createHmac('sha256', clave).update(dato).digest()

/** Cada segmento del path va codificado, pero las barras no. */
function codificarRuta(ruta: string): string {
  return ruta
    .split('/')
    .map((s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
    .join('/')
}

/**
 * Firma SigV4. Firma exactamente las cabeceras que se le pasan, mas `host` y `x-amz-date`:
 * nada implicito. `x-amz-content-sha256` la pone quien llama —S3 la exige, los vectores de
 * prueba de AWS no la usan—, y de eso depende que la firma sea comparable con ellos.
 *
 * Se exporta porque es la parte que no se puede verificar contra R2 sin credenciales.
 */
export function firmar(args: {
  method: string
  host: string
  ruta: string
  query?: Record<string, string>
  cuerpoSha: string
  headers?: Record<string, string>
  accessKeyId: string
  secretAccessKey: string
  fecha: Date
  region?: string
  servicio?: string
}): Record<string, string> {
  const region = args.region ?? REGION
  const servicio = args.servicio ?? SERVICIO

  const amzDate = args.fecha.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dia = amzDate.slice(0, 8)

  const headers: Record<string, string> = {
    ...(args.headers ?? {}),
    host: args.host,
    'x-amz-date': amzDate,
  }

  const ordenados = Object.entries(headers)
    .map(([k, v]) => [k.toLowerCase(), String(v).trim().replace(/\s+/g, ' ')] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  const canonicalHeaders = ordenados.map(([k, v]) => `${k}:${v}\n`).join('')
  const signedHeaders = ordenados.map(([k]) => k).join(';')

  const canonicalQuery = Object.entries(args.query ?? {})
    .map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  const canonicalRequest = [
    args.method,
    codificarRuta(args.ruta),
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    args.cuerpoSha,
  ].join('\n')

  const scope = `${dia}/${region}/${servicio}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n')

  let clave = hmac(Buffer.from(`AWS4${args.secretAccessKey}`, 'utf8'), dia)
  for (const parte of [region, servicio, 'aws4_request']) clave = hmac(clave, parte)
  const firma = createHmac('sha256', clave).update(stringToSign).digest('hex')

  return {
    ...headers,
    authorization:
      `AWS4-HMAC-SHA256 Credential=${args.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${firma}`,
  }
}

/**
 * Un bucket creado con jurisdiccion (EU, FedRAMP) NO se alcanza por el host generico: ahi
 * no existe y R2 responde `NoSuchBucket`. Y como el host entra en el string firmado de
 * SigV4, esto no se puede arreglar desde fuera del codigo.
 */
export function endpoint(cfg: ConfigR2): string {
  const j = cfg.jurisdiccion ? `${cfg.jurisdiccion}.` : ''
  return `${cfg.accountId}.${j}r2.cloudflarestorage.com`
}

async function pedir(
  cfg: ConfigR2,
  args: { method: string; ruta: string; query?: Record<string, string>; cuerpo?: Buffer; headers?: Record<string, string> },
): Promise<Response> {
  const host = endpoint(cfg)
  const cuerpoSha = sha256(args.cuerpo ?? '')

  const headers = firmar({
    method: args.method,
    host,
    ruta: args.ruta,
    query: args.query,
    cuerpoSha,
    headers: { ...args.headers, 'x-amz-content-sha256': cuerpoSha },
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    fecha: new Date(),
  })

  const qs = new URLSearchParams(args.query ?? {}).toString()
  return fetch(`https://${host}${codificarRuta(args.ruta)}${qs ? `?${qs}` : ''}`, {
    method: args.method,
    headers,
    // `Buffer` es un `Uint8Array`, pero los tipos de `fetch` no lo aceptan directamente.
    body: args.cuerpo ? new Uint8Array(args.cuerpo) : undefined,
  })
}

/** Extrae el `<Code>` de la respuesta de error de S3, que es lo que dice qué pasó. */
async function detalle(res: Response, cfg: ConfigR2, que: string): Promise<string> {
  const cuerpo = await res.text().catch(() => '')
  const codigo = /<Code>([^<]+)<\/Code>/.exec(cuerpo)?.[1] ?? ''
  const pista =
    codigo === 'AccessDenied'
      ? ' — la firma se validó pero el token no tiene permiso: revisá que sea un token de R2 ' +
        'con acceso de lectura y escritura a este bucket'
      : codigo === 'SignatureDoesNotMatch'
        ? ' — revisá R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY'
        : codigo === 'NoSuchBucket'
          ? ' — el bucket no existe en esta cuenta por este endpoint: revisá R2_BUCKET, ' +
            'R2_ACCOUNT_ID y, si el bucket se creó con jurisdicción, R2_JURISDICTION'
          : ''

  return `R2 ${res.status}${codigo ? ` (${codigo})` : ''} al ${que} en ${endpoint(cfg)}/${cfg.bucket}${pista}`
}

/**
 * Solo es una optimizacion para no reprocesar lo ya subido. Un 403 no se trata como fallo:
 * sin permiso de lectura no se puede saber si existe, y el PUT —que es idempotente, porque
 * la clave sale del hash del contenido— dira la verdad con un error util.
 */
export async function existe(cfg: ConfigR2, clave: string): Promise<boolean> {
  const res = await pedir(cfg, { method: 'HEAD', ruta: `/${cfg.bucket}/${clave}` })
  if (res.status === 200) return true
  if (res.status === 404 || res.status === 403) return false
  throw new Error(await detalle(res, cfg, `comprobar ${clave}`))
}

export async function subir(
  cfg: ConfigR2,
  args: { clave: string; cuerpo: Buffer; contentType: string },
): Promise<void> {
  const res = await pedir(cfg, {
    method: 'PUT',
    ruta: `/${cfg.bucket}/${args.clave}`,
    cuerpo: args.cuerpo,
    headers: {
      'content-type': args.contentType,
      // La clave sale del hash del contenido: el objeto nunca cambia bajo la misma URL.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })

  if (!res.ok) throw new Error(await detalle(res, cfg, `subir ${args.clave}`))
}

export type Objeto = { clave: string; tamano: number; fecha: string }

/** Lista un prefijo. Una pagina alcanza: el volumen de este sitio son decenas de objetos. */
export async function listar(cfg: ConfigR2, prefijo: string): Promise<Objeto[]> {
  const res = await pedir(cfg, {
    method: 'GET',
    ruta: `/${cfg.bucket}`,
    query: { 'list-type': '2', prefix: prefijo, 'max-keys': '200' },
  })

  if (!res.ok) throw new Error(await detalle(res, cfg, 'listar'))

  const xml = await res.text()
  return [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((m) => {
    const campo = (n: string) => new RegExp(`<${n}>([\\s\\S]*?)</${n}>`).exec(m[1]!)?.[1] ?? ''
    return { clave: campo('Key'), tamano: Number(campo('Size')), fecha: campo('LastModified') }
  })
}

export function urlPublica(cfg: ConfigR2, clave: string): string {
  return `${cfg.publicUrl}/${clave}`
}
