import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hashPassword, sha256Hex } from '../lib/crypto'
import { STORAGE_KEYS } from './storage'
import {
  activateAccount,
  clearAuthData,
  inviteUser,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  restoreSession
} from './authLocal'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear()
  }
}

async function makeUser(overrides = {}) {
  const { hash, salt, iterations } = await hashPassword('Solum2026!', undefined, 1000)
  const inviteCodeHash = await sha256Hex('123456')
  return {
    id: 'user-1',
    name: 'Lucía Ferrer',
    email: 'lucia@example.com',
    role: 'client',
    studioId: 'studio-1',
    clientId: 'client-1',
    assignedArtistId: 'artist-1',
    status: 'active',
    passwordHash: hash,
    passwordSalt: salt,
    iterations,
    inviteCodeHash,
    inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    resetCodeHash: null,
    resetExpiresAt: null,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    ...overrides
  }
}

let local
let session
let activeUser

beforeEach(async () => {
  local = memoryStorage()
  session = memoryStorage()
  vi.stubGlobal('localStorage', local)
  vi.stubGlobal('sessionStorage', session)
  activeUser = await makeUser()
  local.setItem(STORAGE_KEYS.users, JSON.stringify([activeUser]))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('login y sesión', () => {
  it('acepta credenciales normalizadas y no expone secretos', async () => {
    const user = await login('  LUCIA@example.com ', 'Solum2026!', true)
    expect(user).toMatchObject({ id: 'user-1', email: 'lucia@example.com', role: 'client' })
    expect(user.passwordHash).toBeUndefined()
    expect(user.inviteCodeHash).toBeUndefined()

    const stored = JSON.parse(local.getItem(STORAGE_KEYS.session))
    expect(stored.remember).toBe(true)
    expect(new Date(stored.expiresAt).getTime() - Date.now()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000)
  })

  it('guarda la sesión sin recordarme solo en sessionStorage', async () => {
    await login('lucia@example.com', 'Solum2026!', false)
    const stored = JSON.parse(session.getItem(STORAGE_KEYS.session))
    expect(stored.remember).toBe(false)
    expect(new Date(stored.expiresAt).getTime() - Date.now()).toBeLessThan(13 * 60 * 60 * 1000)
    expect(local.getItem(STORAGE_KEYS.session)).toBeNull()
  })

  it('bloquea la cuenta tras cinco intentos fallidos', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(login('lucia@example.com', 'incorrecta')).rejects.toThrow(/incorrectos/)
    }
    await expect(login('lucia@example.com', 'Solum2026!')).rejects.toThrow(/Demasiados intentos/)
  })

  it('restaura la sesión activa y descarta una caducada', async () => {
    await login('lucia@example.com', 'Solum2026!', true)
    expect((await restoreSession()).id).toBe('user-1')

    local.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ userId: 'user-1', expiresAt: '2020-01-01T00:00:00.000Z' })
    )
    expect(await restoreSession()).toBeNull()
    expect(local.getItem(STORAGE_KEYS.session)).toBeNull()
  })

  it('cierra la sesión en ambos almacenes', async () => {
    await login('lucia@example.com', 'Solum2026!', true)
    logout()
    expect(local.getItem(STORAGE_KEYS.session)).toBeNull()
    expect(session.getItem(STORAGE_KEYS.session)).toBeNull()
  })
})

describe('invitación y activación', () => {
  it('rechaza cuentas de tatuador', async () => {
    await expect(
      inviteUser({ name: 'Nico', email: 'nico@example.com', role: 'artist', studioId: 'studio-1' })
    ).rejects.toThrow(/administración/)
  })

  it('crea una invitación de cliente y la activa con su código', async () => {
    const { user, code } = await inviteUser({
      name: 'Nueva Cliente',
      email: 'NUEVA@example.com',
      role: 'client',
      studioId: 'studio-1'
    })
    expect(code).toMatch(/^\d{6}$/)
    expect(user.status).toBe('invited')
    expect(user.email).toBe('nueva@example.com')
    expect(JSON.stringify(user)).not.toContain('inviteCodeHash')

    const wrongCode = code === '000000' ? '111111' : '000000'
    await expect(activateAccount(user.email, wrongCode, 'Nueva2026!')).rejects.toThrow(/correcto/)

    const active = await activateAccount(user.email, code, 'Nueva2026!')
    expect(active.status).toBe('active')
    expect(JSON.parse(local.getItem(STORAGE_KEYS.session)).userId).toBe(active.id)
  })

  it('rechaza activar una invitación de tatuador', async () => {
    const artist = await makeUser({
      id: 'artist-2',
      email: 'nico@example.com',
      role: 'artist',
      status: 'invited'
    })
    local.setItem(STORAGE_KEYS.users, JSON.stringify([activeUser, artist]))
    await expect(activateAccount(artist.email, '123456', 'Nueva2026!')).rejects.toThrow(
      /administración/
    )
  })

  it('rechaza una invitación caducada', async () => {
    const invited = await makeUser({
      id: 'user-2',
      email: 'alba@example.com',
      status: 'invited',
      inviteExpiresAt: '2020-01-01T00:00:00.000Z'
    })
    local.setItem(STORAGE_KEYS.users, JSON.stringify([activeUser, invited]))
    await expect(activateAccount(invited.email, '123456', 'Nueva2026!')).rejects.toThrow(
      /caducado/
    )
  })
})

describe('recuperación de contraseña', () => {
  it('permite entrar con la nueva contraseña', async () => {
    const { code } = await requestPasswordReset('lucia@example.com')
    expect(code).toMatch(/^\d{6}$/)
    expect(await resetPassword('lucia@example.com', code, 'Nueva2026!')).toBe(true)

    await expect(login('lucia@example.com', 'Solum2026!')).rejects.toThrow(/incorrectos/)
    await expect(login('lucia@example.com', 'Nueva2026!')).resolves.toMatchObject({ id: 'user-1' })
  })

  it('rechaza un código incorrecto', async () => {
    await requestPasswordReset('lucia@example.com')
    await expect(resetPassword('lucia@example.com', '000000', 'Nueva2026!')).rejects.toThrow(
      /correcto|nuevo código/
    )
  })
})

describe('limpieza de datos', () => {
  it('elimina usuarios y sesión', async () => {
    await login('lucia@example.com', 'Solum2026!', true)
    clearAuthData()
    expect(local.getItem(STORAGE_KEYS.users)).toBeNull()
    expect(local.getItem(STORAGE_KEYS.session)).toBeNull()
    expect(session.getItem(STORAGE_KEYS.session)).toBeNull()
  })
})
