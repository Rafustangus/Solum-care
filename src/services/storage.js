export const STORAGE_KEYS = {
  users: 'solumcare:users',
  session: 'solumcare:session',
  data: 'solumcare:data:v1',
  branding: 'solumcare:branding',
  reminders: 'solumcare:reminders',
  notified: 'solumcare:notified'
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('No se pudo guardar en localStorage', error)
    return false
  }
}

export function readSessionJSON(key, fallback = null) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeSessionJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // noop
  }
  try {
    sessionStorage.removeItem(key)
  } catch {
    // noop
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.session)
  } catch {
    // noop
  }
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session)
  } catch {
    // noop
  }
}
