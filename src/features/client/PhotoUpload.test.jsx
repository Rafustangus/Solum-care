import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoUpload } from './PhotoUpload'

const mocks = vi.hoisted(() => ({
  addPhoto: vi.fn(),
  pushToast: vi.fn(),
  notify: vi.fn(),
  compressPhoto: vi.fn(),
  putPhoto: vi.fn(),
  generateId: vi.fn()
}))

vi.mock('../../context/AppDataContext', () => ({
  useAppData: () => ({ addPhoto: mocks.addPhoto })
}))
vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({ pushToast: mocks.pushToast, notify: mocks.notify })
}))
vi.mock('../../lib/image', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, compressPhoto: mocks.compressPhoto }
})
vi.mock('../../services/photoStore', () => ({ putPhoto: mocks.putPhoto }))
vi.mock('../../lib/crypto', () => ({ generateId: mocks.generateId }))

const client = {
  id: 'client-1',
  name: 'Lucía Ferrer',
  photos: []
}

function renderUpload() {
  return render(<PhotoUpload client={client} day={3} />)
}

beforeEach(() => {
  vi.clearAllMocks()
  URL.createObjectURL = vi.fn(() => 'blob:foto')
  URL.revokeObjectURL = vi.fn()
  mocks.generateId.mockReturnValue('media-1')
  mocks.compressPhoto.mockResolvedValue({ dataUrl: 'data:image/jpeg;base64,abc' })
  mocks.putPhoto.mockResolvedValue('media-1')
})

describe('PhotoUpload', () => {
  it('guarda la foto del día y avisa al estudio', async () => {
    const user = userEvent.setup()
    const { container } = renderUpload()
    const file = new File(['foto'], 'foto.png', { type: 'image/png' })
    const input = container.querySelector('input[accept="image/*"][capture="environment"]')

    await user.upload(input, file)

    expect(await screen.findByAltText('Vista previa de la foto')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nota para el estudio (opcional)'), 'Menos rojo')
    await user.click(screen.getByRole('button', { name: 'Enviar al estudio' }))

    await waitFor(() =>
      expect(mocks.putPhoto).toHaveBeenCalledWith('media-1', 'data:image/jpeg;base64,abc')
    )
    expect(mocks.compressPhoto).toHaveBeenCalledWith(file)
    expect(mocks.addPhoto).toHaveBeenCalledWith('client-1', {
      day: 3,
      storageKey: 'media-1',
      note: 'Menos rojo'
    })
    expect(mocks.pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Foto enviada', tone: 'success' })
    )
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Foto enviada al estudio',
        tag: 'solumcare-photo-client-client-1-3'
      })
    )
  })

  it('rechaza un archivo que no es una imagen', () => {
    const { container } = renderUpload()
    const file = new File(['texto'], 'nota.txt', { type: 'text/plain' })
    const input = container.querySelector('input[accept="image/*"][capture="environment"]')

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('El archivo debe ser una imagen.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enviar al estudio' })).not.toBeInTheDocument()
    expect(mocks.addPhoto).not.toHaveBeenCalled()
  })

  it('muestra el error cuando no se puede guardar la foto', async () => {
    const user = userEvent.setup()
    mocks.putPhoto.mockRejectedValueOnce(new Error('Sin espacio'))
    const { container } = renderUpload()
    const file = new File(['foto'], 'foto.png', { type: 'image/png' })
    const input = container.querySelector('input[accept="image/*"][capture="environment"]')

    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Enviar al estudio' }))

    expect(await screen.findByText('Sin espacio')).toBeInTheDocument()
    expect(mocks.addPhoto).not.toHaveBeenCalled()
  })
})
