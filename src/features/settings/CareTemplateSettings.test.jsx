import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CareTemplateSettings } from './CareTemplateSettings'

const mocks = vi.hoisted(() => ({
  clients: [],
  templates: [],
  deleteCareTemplate: vi.fn(),
  createCareTemplate: vi.fn(),
  updateCareTemplate: vi.fn(),
  pushToast: vi.fn()
}))

vi.mock('../../context/AppDataContext', () => ({
  useAppData: () => ({
    clients: mocks.clients,
    listCareTemplates: () => mocks.templates,
    deleteCareTemplate: mocks.deleteCareTemplate,
    createCareTemplate: mocks.createCareTemplate,
    updateCareTemplate: mocks.updateCareTemplate
  })
}))

vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({ pushToast: mocks.pushToast })
}))

const makeTemplate = (id, name) => ({
  id,
  studioId: 'studio-solum',
  name,
  taskIds: ['friction-check'],
  guide: { intro: 'A', steps: [{ title: 'B', detail: 'C' }], dos: [], donts: [], alarms: [] }
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.clients = []
  mocks.templates = []
})

describe('CareTemplateSettings', () => {
  it('muestra las pautas del estudio y abre el editor', async () => {
    const user = userEvent.setup()
    mocks.templates = [makeTemplate('care-mia', 'Clima húmedo')]
    render(<CareTemplateSettings />)

    expect(screen.getByText('Clima húmedo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nueva' }))
    expect(screen.getByText('Nueva pauta de curación')).toBeInTheDocument()
  })

  it('bloquea el borrado de una pauta en uso', () => {
    mocks.templates = [makeTemplate('care-uso', 'En uso')]
    mocks.clients = [{ id: 'client-1', technique: 'care-uso' }]
    render(<CareTemplateSettings />)

    expect(screen.getByRole('button', { name: 'Borrar En uso' })).toBeDisabled()
  })

  it('permite borrar una pauta sin clientes asignados', async () => {
    const user = userEvent.setup()
    mocks.templates = [makeTemplate('care-libre', 'Sin uso')]
    render(<CareTemplateSettings />)

    await user.click(screen.getByRole('button', { name: 'Borrar Sin uso' }))
    await user.click(screen.getByRole('button', { name: 'Borrar' }))

    expect(mocks.deleteCareTemplate).toHaveBeenCalledWith('care-libre')
  })
})
