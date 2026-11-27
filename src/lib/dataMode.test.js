import { describe, expect, it } from 'vitest'
import { getDataMode, isSupabaseMode } from './dataMode'

describe('getDataMode', () => {
  it('usa mock cuando no hay configuración', () => {
    expect(getDataMode({})).toBe('mock')
  })

  it('normaliza el modo supabase', () => {
    expect(getDataMode({ VITE_DATA_MODE: ' SUPABASE ' })).toBe('supabase')
  })

  it('descarta valores desconocidos', () => {
    expect(getDataMode({ VITE_DATA_MODE: 'otro' })).toBe('mock')
  })
})

describe('isSupabaseMode', () => {
  it('solo es verdadero para supabase', () => {
    expect(isSupabaseMode({ VITE_DATA_MODE: 'supabase' })).toBe(true)
    expect(isSupabaseMode({ VITE_DATA_MODE: 'mock' })).toBe(false)
    expect(isSupabaseMode({ VITE_DATA_MODE: 'otro' })).toBe(false)
  })
})
