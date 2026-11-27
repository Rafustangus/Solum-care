import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDataProvider, useAppData } from './AppDataContext'

const mocks = vi.hoisted(() => ({
  user: null,
  data: null
}))

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: mocks.user })
}))

vi.mock('../services/repository', () => ({
  loadData: () => mocks.data,
  saveData: vi.fn(),
  resetData: () => mocks.data
}))

vi.mock('../services/photoStore', () => ({
  clearPhotos: vi.fn()
}))

function wrapper({ children }) {
  return <AppDataProvider>{children}</AppDataProvider>
}

const validInput = {
  name: 'Clima húmedo',
  taskIds: ['friction-check'],
  guide: {
    intro: 'Mantén la zona seca.',
    steps: 'Secar bien|Sin frotar',
    dos: 'Ropa holgada',
    donts: 'No usar calor',
    alarms: 'Hinchazón'
  }
}

beforeEach(() => {
  mocks.user = { id: 'artist-1', role: 'artist', status: 'active', studioId: 'studio-solum' }
  mocks.data = {
    version: 4,
    clients: [],
    notes: [],
    notifications: [],
    careTemplates: [],
    settings: {}
  }
})

describe('AppDataContext: pautas de curación', () => {
  it('crea y lista una pauta del estudio', () => {
    const { result } = renderHook(() => useAppData(), { wrapper })
    let created

    act(() => {
      created = result.current.createCareTemplate(validInput)
    })

    expect(created.id).toMatch(/^care-/)
    expect(created.studioId).toBe('studio-solum')
    expect(result.current.listCareTemplates()).toHaveLength(1)
    expect(result.current.listCareTemplates()[0].guide.steps).toEqual([
      { title: 'Secar bien', detail: 'Sin frotar' }
    ])
  })

  it('rechaza pautas duplicadas del mismo estudio', () => {
    const { result } = renderHook(() => useAppData(), { wrapper })

    act(() => {
      result.current.createCareTemplate(validInput)
    })

    expect(() => {
      act(() => {
        result.current.createCareTemplate({ ...validInput, name: ' clima húmedo ' })
      })
    }).toThrow(/Ya existe/)
    expect(result.current.listCareTemplates()).toHaveLength(1)
  })

  it('bloquea el borrado de una pauta en uso', () => {
    mocks.data.clients = [{ id: 'client-1', technique: 'care-uso', studioId: 'studio-solum' }]
    mocks.data.careTemplates = [
      {
        id: 'care-uso',
        studioId: 'studio-solum',
        name: 'En uso',
        taskIds: ['wash'],
        guide: { intro: 'A', steps: [{ title: 'B', detail: 'C' }], dos: [], donts: [], alarms: [] }
      }
    ]
    const { result } = renderHook(() => useAppData(), { wrapper })

    expect(() => {
      act(() => {
        result.current.deleteCareTemplate('care-uso')
      })
    }).toThrow(/No se puede borrar/)
    expect(result.current.listCareTemplates()).toHaveLength(1)
  })

  it('no permite asignar una pauta de otro estudio', () => {
    mocks.data.careTemplates = [
      {
        id: 'care-ajena',
        studioId: 'studio-otro',
        name: 'Ajena',
        taskIds: ['wash'],
        guide: { intro: 'A', steps: [{ title: 'B', detail: 'C' }], dos: [], donts: [], alarms: [] }
      }
    ]
    const { result } = renderHook(() => useAppData(), { wrapper })

    expect(() => {
      act(() => {
        result.current.addClient({
          name: 'Prueba',
          email: 'prueba@example.com',
          technique: 'care-ajena'
        })
      })
    }).toThrow(/no está disponible/)
    expect(result.current.clients).toHaveLength(0)
  })
})
