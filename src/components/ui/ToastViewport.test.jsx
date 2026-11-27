import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastViewport } from './ToastViewport'

const mocks = vi.hoisted(() => ({ removeToast: vi.fn() }))

vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({
    toasts: [
      {
        id: 'toast-1',
        title: 'Foto aprobada',
        message: 'El estudio revisó tu evidencia.',
        tone: 'success'
      }
    ],
    removeToast: mocks.removeToast
  })
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ToastViewport', () => {
  it('muestra el aviso con su mensaje y permite cerrarlo', async () => {
    const user = userEvent.setup()
    render(<ToastViewport />)

    expect(screen.getByText('Foto aprobada')).toBeInTheDocument()
    expect(screen.getByText('El estudio revisó tu evidencia.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(mocks.removeToast).toHaveBeenCalledWith('toast-1')
  })
})
