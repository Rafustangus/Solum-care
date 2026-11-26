import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toISODate } from '../../lib/dates'
import { NotesView } from './NotesView'

const mocks = vi.hoisted(() => ({
  useAppData: vi.fn(),
  useAuth: vi.fn(),
  pushToast: vi.fn(),
  notify: vi.fn()
}))

vi.mock('../../context/AppDataContext', () => ({ useAppData: mocks.useAppData }))
vi.mock('../../context/AuthContext', () => ({ useAuth: mocks.useAuth }))
vi.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({ pushToast: mocks.pushToast, notify: mocks.notify })
}))

const client = {
  id: 'client-1',
  name: 'Lucía Ferrer',
  startDate: toISODate(new Date()),
  durationDays: 14
}

const notes = [
  {
    id: 'note-propia',
    clientId: 'client-1',
    authorId: 'user-1',
    authorName: 'Lucía Ferrer',
    authorRole: 'client',
    text: 'Nota propia',
    createdAt: '2026-11-25T10:00:00.000Z',
    pinned: false
  },
  {
    id: 'note-estudio',
    clientId: 'client-1',
    authorId: 'user-2',
    authorName: 'Mara Sol',
    authorRole: 'artist',
    text: 'Nota del estudio',
    createdAt: '2026-11-26T10:00:00.000Z',
    pinned: false
  },
  {
    id: 'note-fijada',
    clientId: 'client-1',
    authorId: 'user-1',
    authorName: 'Lucía Ferrer',
    authorRole: 'client',
    text: 'Fijada antigua',
    createdAt: '2026-11-20T10:00:00.000Z',
    pinned: true
  }
]

let actions

beforeEach(() => {
  vi.clearAllMocks()
  actions = {
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    togglePinNote: vi.fn()
  }
  mocks.useAuth.mockReturnValue({
    user: { id: 'user-1', name: 'Lucía Ferrer', role: 'client' }
  })
  mocks.useAppData.mockReturnValue({ notes, ...actions })
})

function noteWithText(text) {
  return screen.getAllByRole('listitem').find((item) => item.textContent.includes(text))
}

describe('NotesView', () => {
  it('filtra por cliente y muestra fijadas primero', () => {
    const otherClientNote = {
      ...notes[0],
      id: 'note-otro-cliente',
      clientId: 'client-2',
      text: 'Nota ajena'
    }
    mocks.useAppData.mockReturnValue({ notes: [...notes, otherClientNote], ...actions })
    render(<NotesView client={client} clients={[client]} />)

    const visible = screen.getAllByRole('listitem').map((item) => item.textContent)
    expect(visible).toHaveLength(3)
    expect(visible[0]).toContain('Fijada antigua')
    expect(visible[1]).toContain('Nota del estudio')
    expect(visible[2]).toContain('Nota propia')
    expect(screen.queryByText('Nota ajena')).not.toBeInTheDocument()
  })

  it('solo ofrece acciones de autoría en las notas propias', async () => {
    const user = userEvent.setup()
    render(<NotesView client={client} clients={[client]} />)
    const own = noteWithText('Nota propia')
    const other = noteWithText('Nota del estudio')

    expect(within(own).getByRole('button', { name: 'Fijar nota' })).toBeInTheDocument()
    expect(within(own).getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(within(own).getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
    expect(within(other).queryByRole('button', { name: 'Fijar nota' })).not.toBeInTheDocument()
    expect(within(other).queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(within(other).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()

    await user.click(within(own).getByRole('button', { name: 'Fijar nota' }))
    expect(actions.togglePinNote).toHaveBeenCalledWith('note-propia')
  })

  it('publica una nota con día vinculado y fijada', async () => {
    const user = userEvent.setup()
    render(<NotesView client={client} clients={[client]} />)

    await user.type(screen.getByPlaceholderText(/Hoy noto menos rojo/), 'Todo bien')
    await user.selectOptions(screen.getByLabelText('Vincular'), '1')
    await user.click(screen.getByRole('button', { name: 'Fijar' }))
    await user.click(screen.getByRole('button', { name: 'Publicar nota' }))

    expect(actions.addNote).toHaveBeenCalledWith('client-1', {
      text: 'Todo bien',
      pinned: true,
      linkedDay: 1
    })
    expect(screen.getByPlaceholderText(/Hoy noto menos rojo/)).toHaveValue('')
  })

  it('edita y elimina una nota propia con confirmación', async () => {
    const user = userEvent.setup()
    render(<NotesView client={client} clients={[client]} />)

    const ownNote = () => screen.getAllByRole('listitem')[2]
    await user.click(within(ownNote()).getByRole('button', { name: 'Editar' }))
    const editor = within(ownNote()).getByRole('textbox')
    await user.clear(editor)
    await user.type(editor, 'Nota editada')
    await user.click(within(ownNote()).getByRole('button', { name: 'Guardar' }))
    expect(actions.updateNote).toHaveBeenCalledWith('note-propia', 'Nota editada')

    await user.click(within(ownNote()).getByRole('button', { name: 'Eliminar' }))
    await user.click(
      within(ownNote()).getByRole('button', { name: 'Confirmar eliminación' })
    )
    expect(actions.deleteNote).toHaveBeenCalledWith('note-propia')
  })

  it('muestra el error cuando no se puede publicar', async () => {
    const user = userEvent.setup()
    actions.addNote.mockImplementation(() => {
      throw new Error('No se pudo guardar')
    })
    render(<NotesView client={client} clients={[client]} />)

    await user.type(screen.getByPlaceholderText(/Hoy noto menos rojo/), 'No guardada')
    await user.click(screen.getByRole('button', { name: 'Publicar nota' }))

    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument()
  })
})
