import {
  generateId,
  generateNumericCode,
  hashPassword,
  sha256Hex,
  verifyPassword
} from '../lib/crypto'
import { normalizeEmail, isValidEmail, isValidPassword } from '../lib/validation'
import { SEED_USERS } from './seed'
import {
  STORAGE_KEYS,
  clearSession,
  readJSON,
  readSessionJSON,
  removeItem,
  writeJSON,
  writeSessionJSON
} from './storage'

const SESSION_DAYS = 30
const SESSION_HOURS = 12

function sanitizeUser(user) {
  if (!user) return null
  const {
    passwordHash,
    passwordSalt,
    iterations,
    inviteCodeHash,
    inviteExpiresAt,
    resetCodeHash,
    resetExpiresAt,
    ...safe
  } = user
  return safe
}

export function getStoredUsers() {
  return readJSON(STORAGE_KEYS.users, [])
}

function saveUsers(users) {
  return writeJSON(STORAGE_KEYS.users, users)
}

export async function ensureAuthSeed() {
  const existing = getStoredUsers()
  if (existing.length) return existing

  const seeded = await Promise.all(
    SEED_USERS.map(async (user) => {
      const { hash, salt, iterations } = await hashPassword(user.password)
      const { password, ...rest } = user
      return {
        ...rest,
        passwordHash: hash,
        passwordSalt: salt,
        iterations,
        failedAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      }
    })
  )

  saveUsers(seeded)
  return seeded
}

function createSession(user, remember = true) {
  const now = new Date()
  const expiresAt = new Date(
    now.getTime() + (remember ? SESSION_DAYS * 24 : SESSION_HOURS) * 60 * 60 * 1000
  ).toISOString()
  const session = {
    userId: user.id,
    remember,
    createdAt: now.toISOString(),
    expiresAt
  }

  if (remember) {
    writeJSON(STORAGE_KEYS.session, session)
    try {
      sessionStorage.removeItem(STORAGE_KEYS.session)
    } catch {
      // noop
    }
  } else {
    writeSessionJSON(STORAGE_KEYS.session, session)
    try {
      localStorage.removeItem(STORAGE_KEYS.session)
    } catch {
      // noop
    }
  }
}

function getSession() {
  return readJSON(STORAGE_KEYS.session, null) || readSessionJSON(STORAGE_KEYS.session, null)
}

export async function restoreSession() {
  const session = getSession()
  if (!session) return null

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    clearSession()
    return null
  }

  const users = await ensureAuthSeed()
  const user = users.find((candidate) => candidate.id === session.userId)
  if (!user || user.status !== 'active') {
    clearSession()
    return null
  }

  return sanitizeUser(user)
}

export async function login(email, password, remember = true) {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) {
    throw new Error('Introduce un email válido.')
  }
  if (!password) {
    throw new Error('Introduce tu contraseña.')
  }

  const users = await ensureAuthSeed()
  const index = users.findIndex((user) => normalizeEmail(user.email) === normalized)
  if (index < 0) {
    throw new Error('Email o contraseña incorrectos.')
  }

  const user = users[index]
  if (user.status !== 'active') {
    throw new Error('Tu cuenta aún no está activada. Revisa tu invitación.')
  }

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    throw new Error('Demasiados intentos. Espera un momento e inténtalo de nuevo.')
  }

  const valid = await verifyPassword(password, user)
  if (!valid) {
    const failedAttempts = (user.failedAttempts || 0) + 1
    users[index] = {
      ...user,
      failedAttempts,
      lockedUntil:
        failedAttempts >= 5 ? new Date(Date.now() + 30 * 1000).toISOString() : null
    }
    saveUsers(users)
    throw new Error('Email o contraseña incorrectos.')
  }

  users[index] = {
    ...user,
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date().toISOString()
  }
  saveUsers(users)
  createSession(user, remember)
  return sanitizeUser(users[index])
}

export function logout() {
  clearSession()
}

export async function inviteUser({
  name,
  email,
  role,
  studioId,
  clientId = null,
  assignedArtistId = null
}) {
  if (role !== 'client') {
    throw new Error('Las cuentas de tatuador se crean desde administración.')
  }

  const normalized = normalizeEmail(email)
  if (!name || !String(name).trim()) throw new Error('Introduce el nombre.')
  if (!isValidEmail(normalized)) throw new Error('Introduce un email válido.')

  const users = await ensureAuthSeed()
  if (users.some((user) => normalizeEmail(user.email) === normalized)) {
    throw new Error('Ya existe una cuenta con ese email.')
  }

  const code = generateNumericCode(6)
  const inviteCodeHash = await sha256Hex(code)
  const user = {
    id: generateId(role === 'artist' ? 'artist' : 'client'),
    name: String(name).trim(),
    email: normalized,
    role,
    studioId,
    clientId,
    assignedArtistId,
    status: 'invited',
    inviteCodeHash,
    inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  }

  users.push(user)
  saveUsers(users)
  return { user: sanitizeUser(user), code }
}

export async function activateAccount(email, code, password) {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) throw new Error('Introduce un email válido.')
  if (!/^\d{6}$/.test(String(code || '').trim())) {
    throw new Error('El código debe tener 6 dígitos.')
  }
  if (!isValidPassword(password)) {
    throw new Error('La contraseña debe tener 8 caracteres, una letra y un número.')
  }

  const users = await ensureAuthSeed()
  const index = users.findIndex((user) => normalizeEmail(user.email) === normalized)
  if (index < 0) throw new Error('No encontramos una invitación con ese email.')

  const user = users[index]
  if (user.role !== 'client') {
    throw new Error('Las cuentas de tatuador se activan desde administración.')
  }
  if (user.status === 'active') throw new Error('Esta cuenta ya está activada.')
  if (
    user.inviteExpiresAt &&
    new Date(user.inviteExpiresAt).getTime() < Date.now()
  ) {
    throw new Error('La invitación ha caducado. Pide una nueva al estudio.')
  }

  const codeHash = await sha256Hex(String(code).trim())
  if (codeHash !== user.inviteCodeHash) {
    throw new Error('El código de invitación no es correcto.')
  }

  const { hash, salt, iterations } = await hashPassword(password)
  users[index] = {
    ...user,
    status: 'active',
    passwordHash: hash,
    passwordSalt: salt,
    iterations,
    inviteCodeHash: null,
    inviteExpiresAt: null,
    failedAttempts: 0,
    lockedUntil: null
  }
  saveUsers(users)
  createSession(users[index], true)
  return sanitizeUser(users[index])
}

export async function requestPasswordReset(email) {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) throw new Error('Introduce un email válido.')

  const users = await ensureAuthSeed()
  const index = users.findIndex((user) => normalizeEmail(user.email) === normalized)
  if (index < 0) return null

  const code = generateNumericCode(6)
  users[index] = {
    ...users[index],
    resetCodeHash: await sha256Hex(code),
    resetExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
  saveUsers(users)
  return { code }
}

export async function resetPassword(email, code, password) {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) throw new Error('Introduce un email válido.')
  if (!/^\d{6}$/.test(String(code || '').trim())) {
    throw new Error('El código debe tener 6 dígitos.')
  }
  if (!isValidPassword(password)) {
    throw new Error('La contraseña debe tener 8 caracteres, una letra y un número.')
  }

  const users = await ensureAuthSeed()
  const index = users.findIndex((user) => normalizeEmail(user.email) === normalized)
  if (index < 0) throw new Error('No encontramos una cuenta con ese email.')

  const user = users[index]
  if (!user.resetCodeHash || !user.resetExpiresAt) {
    throw new Error('Solicita un nuevo código de recuperación.')
  }
  if (new Date(user.resetExpiresAt).getTime() < Date.now()) {
    throw new Error('El código ha caducado. Solicita uno nuevo.')
  }

  const codeHash = await sha256Hex(String(code).trim())
  if (codeHash !== user.resetCodeHash) {
    throw new Error('El código de recuperación no es correcto.')
  }

  const { hash, salt, iterations } = await hashPassword(password)
  users[index] = {
    ...user,
    passwordHash: hash,
    passwordSalt: salt,
    iterations,
    resetCodeHash: null,
    resetExpiresAt: null,
    failedAttempts: 0,
    lockedUntil: null
  }
  saveUsers(users)
  return true
}

export async function updateAccount(userId, patch) {
  const users = await ensureAuthSeed()
  const index = users.findIndex((user) => user.id === userId)
  if (index < 0) throw new Error('Usuario no encontrado.')
  users[index] = { ...users[index], ...patch }
  saveUsers(users)
  return sanitizeUser(users[index])
}

export function clearAuthData() {
  removeItem(STORAGE_KEYS.users)
  removeItem(STORAGE_KEYS.session)
}
