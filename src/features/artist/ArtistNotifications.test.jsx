import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistNotifications } from './ArtistNotifications'

const mocks = vi.hoisted(() => ({
  notificationsFor: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  pushToast: vi.fn(),
  onOpenClient: vi.fn()
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

const notifications = [
  {
    id: 'notif-1',
    clientId: 'client-1',
    type: 'photo',
    title: 'Nueva foto de Lucía',
    body: 'Día 4: menos rojo',
    read: false,
    createdAt: '2026-11-26T10:00:00.000Z'
  },
  {
    id: 'notif-2',
    clientId: 'client-2',
    type: 'note',
    title: 'Nueva nota de Diego',
    body: 'Todo bien',
    read: true,
    createdAt: '2026-11-25T10:00:00.000Z'
  }
]

beforeEach(() => {
  vi.clearAllMocks()
  mocks.notificationsFor.mockReturnValue(notifications)
})

describe('ArtistNotifications', () => {
  it('abre al cliente y marca la notificación como leída', async () => {
    const user = userEvent.setup()
    render(<ArtistNotifications onOpenClient={mocks.onOpenClient} />)

    await user.click(screen.getByRole('button', { name: /Nueva foto de Lucía/ }))

    expect(mocks.markNotificationRead).toHaveBeenCalledWith('notif-1')
    expect(mocks.onOpenClient).toHaveBeenCalledWith('client-1')
  })

  it('marca todos los avisos como leídos y muestra un toast', async () => {
    const user = userEvent.setup()
    render(<ArtistNotifications onOpenClient={mocks.onOpenClient} />)

    await user.click(screen.getByRole('button', { name: 'Leer todo' }))

    expect(mocks.markAllNotificationsRead).toHaveBeenCalledWith('artist')
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Avisos marcados como leídos', tone: 'info' })
    )
    expect(mocks.onOpenClient).not.toHaveBeenCalled()
  })

  it('muestra el estado vacío sin acción de lectura', () => {
    mocks.notificationsFor.mockReturnValue([])
    render(<ArtistNotifications onOpenClient={mocks.onOpenClient} />)

    expect(screen.getByText('Sin avisos')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Leer todo' })).not.toBeInTheDocument()
  })
})
