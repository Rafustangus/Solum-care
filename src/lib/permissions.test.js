import { describe, expect, it } from 'vitest'
import { canAccessStudioData, canManageStudioData } from './permissions'

describe('permisos de estudio', () => {
  it('permite solo a artistas activos', () => {
    expect(canManageStudioData({ role: 'artist', status: 'active' })).toBe(true)
    expect(canManageStudioData({ role: 'artist', status: 'invited' })).toBe(false)
    expect(canManageStudioData({ role: 'client', status: 'active' })).toBe(false)
    expect(canManageStudioData(null)).toBe(false)
  })

  it('exige el mismo estudio', () => {
    const user = { role: 'artist', status: 'active', studioId: 'studio-solum' }
    expect(canAccessStudioData(user, 'studio-solum')).toBe(true)
    expect(canAccessStudioData(user, 'studio-otro')).toBe(false)
    expect(canAccessStudioData(user, null)).toBe(false)
  })
})
