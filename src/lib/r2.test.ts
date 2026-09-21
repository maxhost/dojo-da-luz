import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { firmar } from './r2.ts'

/**
 * La firma SigV4 es la pieza que no se puede verificar contra R2 sin credenciales, y las
 * credenciales viven solo en Vercel (spec 0030). Se verifica contra los vectores de prueba
 * publicos de AWS —`aws-sig-v4-test-suite`—, que traen la firma esperada ya calculada.
 *
 * Si esto pasa, un 403 de R2 es un problema de permisos o de configuracion, no de la firma.
 */

const CLAVE = 'AKIDEXAMPLE'
const SECRETO = 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
const FECHA = new Date('2015-08-30T12:36:00Z')
const VACIO = createHash('sha256').update('').digest('hex')

const firmaDe = (headers: Record<string, string>) =>
  /Signature=([0-9a-f]+)/.exec(headers.authorization!)![1]

test('get-vanilla: el vector mas simple de la suite de AWS', () => {
  const headers = firmar({
    method: 'GET',
    host: 'example.amazonaws.com',
    ruta: '/',
    cuerpoSha: VACIO,
    accessKeyId: CLAVE,
    secretAccessKey: SECRETO,
    fecha: FECHA,
    region: 'us-east-1',
    servicio: 'service',
  })

  assert.equal(
    firmaDe(headers),
    '5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31',
  )
})

test('get-vanilla-query-order-key-case: la query se ordena antes de firmar', () => {
  const headers = firmar({
    method: 'GET',
    host: 'example.amazonaws.com',
    ruta: '/',
    // A proposito en orden inverso: la firma solo sale si el codigo los ordena.
    query: { Param2: 'value2', Param1: 'value1' },
    cuerpoSha: VACIO,
    accessKeyId: CLAVE,
    secretAccessKey: SECRETO,
    fecha: FECHA,
    region: 'us-east-1',
    servicio: 'service',
  })

  assert.equal(
    firmaDe(headers),
    'b97d918cfa904a5beff61c982a1b6f458b799221646efd99d3219ec94cdf2500',
  )
})

/**
 * Este no es un vector de la suite: es la propiedad que la suite comprueba. SigV4 recorta
 * los extremos y colapsa los espacios internos del valor de cada cabecera antes de firmar,
 * asi que dos valores que solo difieren en espacios tienen que dar la misma firma.
 */
test('el valor de una cabecera se normaliza antes de firmar', () => {
  const base = {
    method: 'GET',
    host: 'example.amazonaws.com',
    ruta: '/',
    cuerpoSha: VACIO,
    accessKeyId: CLAVE,
    secretAccessKey: SECRETO,
    fecha: FECHA,
    region: 'us-east-1',
    servicio: 'service',
  } as const

  const firmaCon = (valor: string) =>
    firmaDe(firmar({ ...base, headers: { 'my-header1': valor } }))

  assert.equal(firmaCon('  value1  '), firmaCon('value1'))
  assert.equal(firmaCon('a  b'), firmaCon('a b'))
  assert.notEqual(firmaCon('value1'), firmaCon('value2'))
})

test('la cabecera Authorization nombra las cabeceras firmadas y el scope', () => {
  const headers = firmar({
    method: 'PUT',
    host: 'cuenta.r2.cloudflarestorage.com',
    ruta: '/bucket/medios/abc/w1600.webp',
    cuerpoSha: VACIO,
    headers: { 'content-type': 'image/webp', 'x-amz-content-sha256': VACIO },
    accessKeyId: CLAVE,
    secretAccessKey: SECRETO,
    fecha: FECHA,
    region: 'auto',
    servicio: 's3',
  })

  assert.match(headers.authorization!, /Credential=AKIDEXAMPLE\/20150830\/auto\/s3\/aws4_request/)
  assert.match(
    headers.authorization!,
    /SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date/,
  )
  assert.equal(headers['x-amz-date'], '20150830T123600Z')
})
