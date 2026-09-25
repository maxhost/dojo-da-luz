// Configura el CORS del bucket de R2 para permitir el `PUT` prefirmado que hace el
// navegador al subir el video de la portada (spec 0047, ADR-0044). Sin esto, R2 rechaza
// el `PUT` antes de que corra una linea de nuestro codigo y el error se ve en la consola
// del navegador, no en el servidor.
//
//   node --env-file=.env scripts/configurar-cors-r2.mjs [origen...]
//
// Sin argumentos, autoriza localhost:4321 (dev) y dojo-da-luz.vercel.app (produccion de
// hoy). El dia del cambio de dominio (ADR-0043) hay que correrlo de nuevo con
// https://www.aikido-duran.com sumado a la lista — el CORS no se hereda de una corrida a
// la otra, cada corrida reemplaza la configuracion entera del bucket.
//
// El token de R2 necesita permiso de administracion del bucket (no solo lectura/escritura
// de objetos): un token "Object Read & Write" puede no alcanzar para esto y R2 responde
// AccessDenied. Si eso pasa, es la consola de Cloudflare (R2 → el bucket → Settings → CORS
// Policy) con el mismo XML que este script imprime antes de mandarlo.

import { createHash } from 'node:crypto'
import { configR2, endpoint, firmar } from '../src/lib/r2.ts'

function abortar(mensaje) {
  console.error(`configurar-cors-r2: ${mensaje}`)
  process.exit(1)
}

const cfg = configR2()
if ('falta' in cfg) abortar(`falta configurar ${cfg.falta.join(', ')}`)

const origenes =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ['http://localhost:4321', 'https://dojo-da-luz.vercel.app']

const cuerpo =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<CORSConfiguration>\n' +
  origenes
    .map(
      (origen) =>
        '  <CORSRule>\n' +
        `    <AllowedOrigin>${origen}</AllowedOrigin>\n` +
        '    <AllowedMethod>PUT</AllowedMethod>\n' +
        '    <AllowedHeader>content-type</AllowedHeader>\n' +
        '    <MaxAgeSeconds>3000</MaxAgeSeconds>\n' +
        '  </CORSRule>',
    )
    .join('\n') +
  '\n</CORSConfiguration>\n'

console.log('Enviando esta configuracion de CORS:\n')
console.log(cuerpo)

const host = endpoint(cfg)
const cuerpoBuf = Buffer.from(cuerpo, 'utf8')
const cuerpoSha = createHash('sha256').update(cuerpoBuf).digest('hex')

const headers = firmar({
  method: 'PUT',
  host,
  ruta: `/${cfg.bucket}`,
  query: { cors: '' },
  cuerpoSha,
  headers: { 'x-amz-content-sha256': cuerpoSha, 'content-type': 'application/xml' },
  accessKeyId: cfg.accessKeyId,
  secretAccessKey: cfg.secretAccessKey,
  fecha: new Date(),
})

const res = await fetch(`https://${host}/${cfg.bucket}?cors=`, {
  method: 'PUT',
  headers,
  body: cuerpoBuf,
})

if (!res.ok) {
  const texto = await res.text().catch(() => '')
  abortar(`R2 respondio ${res.status}: ${texto || '(sin cuerpo)'}`)
}

console.log(`\nListo. CORS del bucket ${cfg.bucket} actualizado para: ${origenes.join(', ')}`)
