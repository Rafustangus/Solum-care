const encoder = new TextEncoder()

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto no está disponible en este entorno.')
  }
  return globalThis.crypto
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex) {
  const pairs = String(hex).match(/.{1,2}/g) || []
  return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)))
}

export function randomHex(byteLength = 16) {
  const crypto = getCrypto()
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

export function generateId(prefix = 'id') {
  const crypto = getCrypto()
  if (typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${randomHex(12)}`
}

export function generateUuid() {
  const crypto = getCrypto()
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytesToHex(bytes)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function generateNumericCode(length = 6) {
  const crypto = getCrypto()
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => String(value % 10)).join('')
}

export async function sha256Hex(value) {
  const crypto = getCrypto()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(String(value)))
  return bytesToHex(new Uint8Array(digest))
}

export async function hashPassword(password, salt = randomHex(16), iterations = 150000) {
  const crypto = getCrypto()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(salt),
      iterations,
      hash: 'SHA-256'
    },
    key,
    256
  )
  return {
    hash: bytesToHex(new Uint8Array(bits)),
    salt,
    iterations
  }
}

export async function verifyPassword(password, user) {
  if (!user?.passwordHash || !user?.passwordSalt) return false
  const { hash } = await hashPassword(
    password,
    user.passwordSalt,
    Number(user.iterations) || 150000
  )
  return hash === user.passwordHash
}
