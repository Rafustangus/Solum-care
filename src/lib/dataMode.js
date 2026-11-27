const DATA_MODES = ['mock', 'supabase']

export function getDataMode(env = import.meta.env) {
  const value = String(env?.VITE_DATA_MODE || 'mock').trim().toLowerCase()
  return DATA_MODES.includes(value) ? value : 'mock'
}

export function isSupabaseMode(env = import.meta.env) {
  return getDataMode(env) === 'supabase'
}
