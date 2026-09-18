import { strict as assert } from 'node:assert'
import test from 'node:test'
import { hashPassword, newToken, tokenHash, verifyPassword } from './auth.ts'

test('la contraseña correcta verifica', async () => {
  const hash = await hashPassword('correcta-horse-battery')
  assert.equal(await verifyPassword('correcta-horse-battery', hash), true)
})

test('la contraseña incorrecta no verifica', async () => {
  const hash = await hashPassword('correcta-horse-battery')
  assert.equal(await verifyPassword('correcta-horse-batterx', hash), false)
  assert.equal(await verifyPassword('', hash), false)
})

test('dos hashes de la misma contraseña son distintos', async () => {
  const [a, b] = await Promise.all([hashPassword('misma'), hashPassword('misma')])
  assert.notEqual(a, b)
  assert.equal(await verifyPassword('misma', a), true)
  assert.equal(await verifyPassword('misma', b), true)
})

test('un hash corrupto devuelve false y no lanza', async () => {
  for (const roto of ['', 'nada', 'scrypt$1$2$3', 'bcrypt$32768$8$1$AA==$AA==', 'scrypt$x$y$z$AA==$AA==']) {
    assert.equal(await verifyPassword('lo-que-sea', roto), false)
  }
})

test('los tokens son unicos y su hash es estable', () => {
  const a = newToken()
  assert.notEqual(a, newToken())
  assert.equal(tokenHash(a), tokenHash(a))
  assert.equal(tokenHash(a).length, 64)
  assert.notEqual(tokenHash(a), a)
})
