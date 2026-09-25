import { test } from 'node:test'
import assert from 'node:assert/strict'
import { firmarVideo } from './medios.ts'

/**
 * `firmarVideo` (spec 0047) valida el tipo, el tamaño y el hash **antes** de hablar con R2,
 * asi que esa parte se prueba sin credenciales — igual que `subirImagen` valida el formato
 * con `sharp` antes de subir. Lo que pasa despues (R2_* configurado, la firma en si) solo
 * se verifica contra R2 en produccion.
 */

const HASH = 'a'.repeat(64)

test('rechaza un tipo que no sea video/mp4', async () => {
  const r = await firmarVideo({ contentType: 'video/webm', tamano: 1024, hash: HASH })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.motivo, /\.mp4/)
})

test('rechaza un archivo vacio', async () => {
  const r = await firmarVideo({ contentType: 'video/mp4', tamano: 0, hash: HASH })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.motivo, /vacío/)
})

test('rechaza un archivo de mas de 32 MB', async () => {
  const r = await firmarVideo({ contentType: 'video/mp4', tamano: 33 * 1024 * 1024, hash: HASH })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.motivo, /32 MB/)
})

test('rechaza un hash que no tiene forma de sha256 hex', async () => {
  const r = await firmarVideo({ contentType: 'video/mp4', tamano: 1024, hash: 'no-es-un-hash' })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.motivo, /hash/)
})

test('con metadatos validos, sin R2 configurado, el error dice que falta R2', async () => {
  const r = await firmarVideo({ contentType: 'video/mp4', tamano: 1024, hash: HASH })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.motivo, /Falta configurar R2/)
})
