import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoReviewSheet } from './PhotoReviewSheet'

const mocks = vi.hoisted(() => ({
  reviewPhoto: vi.fn(),
  pushToast: vi.fn(),
  notify: vi.fn(),
  onClose: vi.fn()
}))

vi.mock('../../context/AppDataContext', () => ({
  useAppData: () => ({ reviewPhoto: mocks.reviewPhoto })
}))
vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({ pushToast: mocks.pushToast, notify: mocks.notify })
}))

const client = {
  id: 'client-1',
  name: 'Lucía Ferrer',
  tattooZone: 'Antebrazo'
}

const photo = {
  id: 'photo-1',
  clientId: 'client-1',
  day: 4,
  src: 'data:image/jpeg;base64,abc',
  note: 'Menos rojo hoy',
  status: 'pending',
  artistComment: '',
  createdAt: '2026-11-26T10:00:00.000Z'
}

function renderSheet() {
  return render(
    <PhotoReviewSheet open onClose={mocks.onClose} client={client} photo={photo} />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PhotoReviewSheet', () => {
  it('aprueba la foto y avisa al cliente', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: 'Aprobar' }))

    expect(mocks.reviewPhoto).toHaveBeenCalledWith('client-1', 'photo-1', 'approved', '')
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Foto aprobada', tone: 'success' })
    )
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Foto aprobada',
        tag: 'solumcare-review-client-1-photo-1'
      })
    )
    expect(mocks.onClose).toHaveBeenCalledTimes(1)
  })

  it('pide cambios con una respuesta rápida', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: 'Repite la foto con más luz natural.' }))
    await user.click(screen.getByRole('button', { name: 'Pedir cambios' }))

    expect(mocks.reviewPhoto).toHaveBeenCalledWith(
      'client-1',
      'photo-1',
      'changes',
      'Repite la foto con más luz natural.'
    )
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Cambios solicitados', tone: 'warning' })
    )
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Cambios solicitados' })
    )
    expect(mocks.onClose).toHaveBeenCalledTimes(1)
  })

  it('exige una indicación antes de pedir cambios', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: 'Pedir cambios' }))

    expect(mocks.reviewPhoto).not.toHaveBeenCalled()
    expect(mocks.onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Escribe una indicación antes de pedir cambios.')).toBeInTheDocument()
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Añade una indicación', tone: 'warning' })
    )
  })
})
