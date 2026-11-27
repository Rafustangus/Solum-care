import { createClient } from '@supabase/supabase-js'
import { getDataMode } from '../lib/dataMode'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export const dataMode = getDataMode()

export function requireSupabase() {
  if (dataMode !== 'supabase') {
    throw new Error('VITE_DATA_MODE debe ser supabase para usar Supabase.')
  }
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    )
  }
  return supabase
}
