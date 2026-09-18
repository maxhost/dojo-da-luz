import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'

/**
 * Hash de contraseña con scrypt (ADR-0015).
 *
 * scrypt viene en el runtime: argon2 y bcrypt traen binarios nativos que complican el
 * bundle serverless para ganar poco con un solo usuario.
 */

const N = 32_768 // 2^15
const R = 8
const P = 1
const KEYLEN = 64
// 128 * N * r = 33.5 MB, por encima del maxmem por defecto de node (32 MB).
const MAXMEM = 96 * 1024 * 1024

function derivar(
  password: string,
  salt: Buffer,
  keylen: number,
  params: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(
      password.normalize('NFKC'),
      salt,
      keylen,
      { ...params, maxmem: MAXMEM },
      (error, key) => (error ? reject(error) : resolve(key)),
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derivar(password, salt, KEYLEN, { N, r: R, p: P })
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$')
}

/**
 * Nunca lanza: una contraseña mal guardada es `false`, no un 500 que le dice al atacante
 * que ese email existe.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const partes = stored.split('$')
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false

  const [, n, r, p, saltB64, hashB64] = partes as [string, string, string, string, string, string]
  const params = { N: Number(n), r: Number(r), p: Number(p) }
  if (!Number.isFinite(params.N) || !Number.isFinite(params.r) || !Number.isFinite(params.p)) {
    return false
  }

  const esperado = Buffer.from(hashB64, 'base64')
  if (esperado.length === 0) return false

  try {
    const key = await derivar(password, Buffer.from(saltB64, 'base64'), esperado.length, params)
    return key.length === esperado.length && timingSafeEqual(key, esperado)
  } catch {
    return false
  }
}

/** Token opaco para cookies de sesion. 32 bytes de entropia. */
export function newToken(): string {
  return randomBytes(32).toString('base64url')
}

export function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
