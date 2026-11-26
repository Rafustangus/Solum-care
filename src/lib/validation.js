export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim())
}

export function getPasswordChecks(value = '') {
  const password = String(value)
  return {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password)
  }
}

export function isValidPassword(value) {
  const checks = getPasswordChecks(value)
  return checks.length && checks.letter && checks.number
}

export function isValidCode(value) {
  return /^\d{6}$/.test(String(value || '').trim())
}

export function isValidName(value, min = 2, max = 40) {
  const length = String(value || '').trim().length
  return length >= min && length <= max
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function passwordStrengthLabel(value) {
  const checks = Object.values(getPasswordChecks(value)).filter(Boolean).length
  if (!value) return ''
  if (checks <= 1) return 'Débil'
  if (checks === 2) return 'Aceptable'
  return 'Segura'
}
