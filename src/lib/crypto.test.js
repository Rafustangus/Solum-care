import { describe, expect, it } from 'vitest'
import {
  generateId,
  generateNumericCode,
  hashPassword,
  sha256Hex,
  verifyPassword
} from './crypto'

describe('identificadores', () => {
  it('genera IDs con prefijo y únicos', () => {
    const first = generateId('client')
    const second = generateId('client')
    expect(first.startsWith('client_')).toBe(true)
    expect(first).not.toBe(second)
  })

  it('genera códigos numéricos de 6 dígitos', () => {
    const code = generateNumericCode(6)
    expect(code).toMatch(/^\d{6}$/)
  })
})

describe('hashes', () => {
  it('calcula SHA-256 estable', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('verifica contraseñas con PBKDF2', async () => {
    const { hash, salt, iterations } = await hashPassword('Solum2026!', undefined, 1000)
    const user = { passwordHash: hash, passwordSalt: salt, iterations }
    expect(await verifyPassword('Solum2026!', user)).toBe(true)
    expect(await verifyPassword('incorrecta', user)).toBe(false)
    expect(await verifyPassword('Solum2026!', {})).toBe(false)
  })
})
