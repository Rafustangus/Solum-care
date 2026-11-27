import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientNotificationsSheet } from './ClientNotificationsSheet'

const mocks = vi.hoisted(() => ({
  notificationsFor: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  pushToast: vi.fn(),
  onClose: vi.fn()
}))

vi.mock('../../context/AppDataContext', () => ({
  useAppData: () => ({
    notificationsFor: mocks.notificationsFor,
    markNotificationRead: mocks.markNotificationRead,
    markAllNotificationsRead: mocks.markAllNotificationsRead
  })
}))
vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({ pushToast: mocks.pushToast })
}))

const client = { id: 'client-1', name: 'Lucía Ferrer' }

const notifications = [
  {
    id: 'notif-1',
    clientId: 'client-1',
    type: 'approval',
    title: 'Foto aprobada',
    body: 'El estudio aprobó tu foto del día 4.',
    read: false,
    createdAt: '2026-11-26T10:00:00.000Z'
  },
  {
    id: 'notif-2',
    clientId: 'client-1',
    type: 'note',
    title: 'Nueva nota del estudio',
    body: 'Sigue con la rutina actual.',
    read: false,
    createdAt: '2026-11-25T10:00:00.000Z'
  }
]

function renderSheet() {
  return render(
    <ClientNotificationsSheet open onClose={mocks.onClose} client={client} />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.notificationsFor.mockReturnValue(notifications)
})

describe('ClientNotificationsSheet', () => {
  it('marca un aviso como leído al abrirlo', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: /Foto aprobada/ }))

    expect(mocks.markNotificationRead).toHaveBeenCalledWith('notif-1')
  })

  it('marca todos los avisos del cliente y avisa', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: /Marcar todo como leído \(2\)/ }))

    expect(mocks.markAllNotificationsRead).toHaveBeenCalledWith('client', 'client-1')
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Avisos leídos', tone: 'info' })
    )
  })

  it('muestra el estado vacío cuando el cliente no tiene avisos', () => {
    mocks.notificationsFor.mockReturnValue([])
    renderSheet()

    expect(screen.getByText('Sin avisos todavía')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Marcar todo como leído/ })
    ).not.toBeInTheDocument()
  })
})
