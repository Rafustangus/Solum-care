const DAY_MS = 24 * 60 * 60 * 1000

export function toISODate(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value) {
  if (value instanceof Date) return startOfDay(value)
  if (!value) return startOfDay(new Date())
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return startOfDay(new Date())
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function startOfDay(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
}

export function addDays(value, amount) {
  const date = value instanceof Date ? new Date(value) : parseISODate(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function addDaysISO(value, amount) {
  return toISODate(addDays(value, amount))
}

export function daysAgoISO(amount) {
  return addDaysISO(new Date(), -amount)
}

export function daysBetween(from, to = new Date()) {
  const start = startOfDay(from)
  const end = startOfDay(to)
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS)
}

export function formatLongDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parseISODate(value))
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short'
  }).format(parseISODate(value))
}

export function formatDateInput(value) {
  if (!value) return ''
  return toISODate(parseISODate(value))
}

export function formatTime(value = new Date()) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(value instanceof Date ? value : new Date(value))
}

export function formatDateTime(value) {
  return `${formatShortDate(value)} · ${formatTime(value)}`
}

export function relativeTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  return formatShortDate(date)
}

export function weekdayShort(value) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
    .format(parseISODate(value))
    .replace('.', '')
}

export function isTodayISO(value) {
  return toISODate(parseISODate(value)) === toISODate()
}

export function nowISOString() {
  return new Date().toISOString()
}
