import { describe, expect, it } from 'vitest'
import { canModifyNote, countUnreadNotes, markNotesRead, sortNotes } from './notes'

function notification(id, overrides = {}) {
  return {
    id,
    audienceRole: 'artist',
    clientId: 'client-1',
    type: 'note',
    read: false,
    ...overrides
  }
}

describe('autoría de notas', () => {
  it('solo permite modificar las notas propias', () => {
    expect(canModifyNote({ authorId: 'user-1' }, 'user-1')).toBe(true)
    expect(canModifyNote({ authorId: 'user-2' }, 'user-1')).toBe(false)
    expect(canModifyNote({ authorId: 'user-1' }, null)).toBe(false)
    expect(canModifyNote(null, 'user-1')).toBe(false)
  })
})

describe('orden de notas', () => {
  it('fija primero las destacadas y luego ordena por fecha', () => {
    const notes = [
      { id: 'a', pinned: false, createdAt: '2026-11-10T10:00:00.000Z' },
      { id: 'b', pinned: true, createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 'c', pinned: false, createdAt: '2026-11-11T10:00:00.000Z' }
    ]
    expect(sortNotes(notes).map((note) => note.id)).toEqual(['b', 'c', 'a'])
    expect(notes.map((note) => note.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('lectura y badges de notas', () => {
  const list = [
    notification('n1'),
    notification('n2', { clientId: 'client-2' }),
    notification('n3', { audienceRole: 'client', clientId: 'client-1', read: true }),
    notification('n4', { type: 'photo' }),
    notification('n5', { audienceRole: 'client', clientId: 'client-1' }),
    notification('n6', { audienceRole: 'client', clientId: 'client-2' })
  ]

  it('marca como leídas solo las notas del destinatario', () => {
    const artist = markNotesRead(list, 'artist', 'client-1')
    expect(artist[0].read).toBe(true)
    expect(artist[1].read).toBe(true)
    expect(artist[3].read).toBe(false)
    expect(artist[4].read).toBe(false)
    expect(list[0].read).toBe(false)

    const client = markNotesRead(list, 'client', 'client-1')
    expect(client[4].read).toBe(true)
    expect(client[5].read).toBe(false)
    expect(client[0].read).toBe(false)
  })

  it('devuelve la misma referencia si no hay nada que marcar', () => {
    expect(markNotesRead(list, 'client', 'client-3')).toBe(list)
  })

  it('cuenta las no leídas por rol y cliente', () => {
    expect(countUnreadNotes(list, 'artist')).toBe(2)
    expect(countUnreadNotes(list, 'artist', 'client-1')).toBe(2)
    expect(countUnreadNotes(list, 'client', 'client-1')).toBe(1)
    expect(countUnreadNotes(list, 'client', 'client-2')).toBe(1)
  })
})
