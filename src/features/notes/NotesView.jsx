import { useMemo, useState } from 'react'
import {
  Check,
  MessageSquareText,
  Pencil,
  Pin,
  PinOff,
  Send,
  Trash2,
  X
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconButton } from '../../components/ui/IconButton'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { relativeTime } from '../../lib/dates'
import { getHealingDay } from '../../lib/healing'
import { canModifyNote, sortNotes } from '../../lib/notes'
import { cn } from '../../lib/cn'

export function NotesView({ client, clients = [], onChangeClient }) {
  const { user } = useAuth()
  const isStudio = user?.role === 'artist'
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useAppData()
  const { pushToast, notify } = useNotifications()
  const [text, setText] = useState('')
  const [linkedDay, setLinkedDay] = useState('')
  const [pin, setPin] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const currentDay = client
    ? Math.max(1, getHealingDay(client.startDate, client.durationDays).day)
    : 1
  const dayOptions = [
    { value: '', label: 'Sin día vinculado' },
    ...Array.from({ length: currentDay }, (_, index) => ({
      value: String(index + 1),
      label: `Día ${index + 1}`
    }))
  ]

  const clientNotes = useMemo(
    () => sortNotes(notes.filter((note) => note.clientId === client?.id)),
    [notes, client?.id]
  )

  if (!client) {
    return (
      <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <EmptyState
          icon={MessageSquareText}
          title="Selecciona un cliente"
          description="Elige una ficha para ver y compartir notas."
        />
      </div>
    )
  }

  function handleAdd(event) {
    event.preventDefault()
    setError('')
    try {
      addNote(client.id, {
        text,
        pinned: pin,
        linkedDay: linkedDay ? Number(linkedDay) : null
      })
      setText('')
      setLinkedDay('')
      setPin(false)
      pushToast({
        title: 'Nota publicada',
        message: 'La otra parte podrá verla en su historial.',
        tone: 'success'
      })
      notify({
        title: 'Nueva nota publicada',
        body: `Nota de ${user?.name?.split(' ')[0] || 'Solum-care'} en el seguimiento de ${client.name.split(' ')[0]}.`,
        tag: `solumcare-note-${client.id}`
      })
    } catch (addError) {
      setError(addError.message || 'No se pudo publicar la nota.')
    }
  }

  function startEditing(note) {
    setEditingId(note.id)
    setEditingText(note.text)
    setConfirmDeleteId(null)
  }

  function saveEditing(noteId) {
    try {
      updateNote(noteId, editingText)
      setEditingId(null)
      setEditingText('')
    } catch (editError) {
      pushToast({
        title: 'No se pudo guardar',
        message: editError.message,
        tone: 'warning'
      })
    }
  }

  function handleDelete(noteId) {
    deleteNote(noteId)
    setConfirmDeleteId(null)
    pushToast({
      title: 'Nota eliminada',
      message: 'La nota ha desaparecido del historial compartido.',
      tone: 'info'
    })
  }

  return (
    <div
      className={cn(
        'phone-scroll mx-auto w-full flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:pt-6',
        isStudio ? 'max-w-6xl lg:px-6' : 'max-w-3xl'
      )}
    >
      <div className="mb-4">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
          Espacio compartido
        </p>
        <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
          Notas de {client.name.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-coffee-soft">
          Indicaciones, dudas y acuerdos. Sin chats infinitos: solo lo importante.
        </p>
      </div>

      <div
        className={cn(
          isStudio && 'lg:grid lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start lg:gap-4'
        )}
      >
        <div>
          {clients.length > 1 ? (
            <Select
              label="Cliente"
              className="mb-3"
              value={client.id}
              onChange={(event) => onChangeClient?.(event.target.value)}
              options={clients.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.tattooZone || 'sin zona'}`
              }))}
            />
          ) : null}

          <Card className="mb-4 p-3.5">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar name={user?.name || ''} tone={user?.role === 'artist' ? 'clay' : 'olive'} size="xs" />
            <p className="text-xs font-bold text-coffee">
              Escribir como {user?.name?.split(' ')[0]}
            </p>
            <Badge tone={user?.role === 'artist' ? 'clay' : 'olive'} className="ml-auto">
              {user?.role === 'artist' ? 'estudio' : 'cliente'}
            </Badge>
          </div>

          <Textarea
            rows={3}
            placeholder={
              user?.role === 'artist'
                ? 'Ej. Mantén la crema en capa fina y mándame foto el jueves.'
                : 'Ej. Hoy noto menos rojo, pero me pica al final del día.'
            }
            maxLength={600}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Select
              label="Vincular"
              className="flex-1"
              value={linkedDay}
              onChange={(event) => setLinkedDay(event.target.value)}
              options={dayOptions}
            />
            <button
              type="button"
              onClick={() => setPin((value) => !value)}
              aria-pressed={pin}
              className={cn(
                'flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border px-3.5 text-xs font-bold transition',
                pin
                  ? 'border-clay/35 bg-clay/12 text-clay-deep'
                  : 'border-coffee/15 bg-cream text-coffee-soft hover:border-clay/30'
              )}
            >
              <Pin className="h-3.5 w-3.5" />
              Fijar
            </button>
          </div>

          {error ? (
            <p className="rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
            Publicar nota
          </Button>
        </form>
          </Card>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <h2 className="font-display text-[1.55rem] leading-none text-coffee">Historial</h2>
        <span className="rounded-full bg-coffee/6 px-2.5 py-1 text-[0.68rem] font-bold text-coffee-soft">
          {clientNotes.length} {clientNotes.length === 1 ? 'nota' : 'notas'}
        </span>
      </div>

      {clientNotes.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareText}
            title="Todavía no hay notas"
            description="La primera nota puede ser una indicación del estudio o una duda del cliente."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {clientNotes.map((note) => {
            const mine = canModifyNote(note, user?.id)
            const editing = editingId === note.id
            const confirming = confirmDeleteId === note.id
            const isArtist = note.authorRole === 'artist'

            return (
              <li key={note.id}>
                <Card
                  className={cn(
                    'p-3.5',
                    note.pinned && 'border-olive/30 bg-olive/8',
                    editing && 'ring-2 ring-clay/25'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar
                      name={note.authorName}
                      tone={isArtist ? 'clay' : 'olive'}
                      size="xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs font-bold text-coffee">{note.authorName}</p>
                        <Badge tone={isArtist ? 'clay' : 'olive'} className="px-2 py-0.5 text-[0.56rem]">
                          {isArtist ? 'estudio' : 'cliente'}
                        </Badge>
                        {note.pinned ? (
                          <Badge tone="olive" className="px-2 py-0.5 text-[0.56rem]">
                            <Pin className="h-2.5 w-2.5" />
                            fijada
                          </Badge>
                        ) : null}
                        {note.linkedDay ? (
                          <Badge tone="cream" className="px-2 py-0.5 text-[0.56rem]">
                            día {note.linkedDay}
                          </Badge>
                        ) : null}
                        <span className="ml-auto text-[0.62rem] font-semibold text-coffee-soft">
                          {relativeTime(note.createdAt)}
                        </span>
                      </div>

                      {editing ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            rows={3}
                            value={editingText}
                            maxLength={600}
                            onChange={(event) => setEditingText(event.target.value)}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => saveEditing(note.id)}
                              disabled={!editingText.trim()}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null)
                                setEditingText('')
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-coffee">
                          {note.text}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-0.5">
                        {mine ? (
                          <button
                            type="button"
                            onClick={() => togglePinNote(note.id)}
                            className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 py-1 text-[0.64rem] font-bold text-coffee-soft transition hover:bg-coffee/6 hover:text-coffee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                            aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                          >
                            {note.pinned ? (
                              <PinOff className="h-3 w-3" />
                            ) : (
                              <Pin className="h-3 w-3" />
                            )}
                            {note.pinned ? 'Desfijar' : 'Fijar'}
                          </button>
                        ) : null}

                        {mine && !editing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(note)}
                              className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 py-1 text-[0.64rem] font-bold text-coffee-soft transition hover:bg-coffee/6 hover:text-coffee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                            {confirming ? (
                              <span className="ml-auto flex items-center gap-1">
                                <span className="text-[0.62rem] font-semibold text-rust">
                                  ¿Eliminar?
                                </span>
                                <IconButton
                                  label="Confirmar eliminación"
                                  variant="ghost"
                                  className="h-7 w-7 text-rust"
                                  onClick={() => handleDelete(note.id)}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </IconButton>
                                <IconButton
                                  label="Cancelar eliminación"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </IconButton>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(note.id)}
                                className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-full px-2 py-1 text-[0.64rem] font-bold text-coffee-soft transition hover:bg-rust/8 hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                              >
                                <Trash2 className="h-3 w-3" />
                                Eliminar
                              </button>
                            )}
                          </>
                        ) : null}

                        {note.edited ? (
                          <span className="ml-auto text-[0.6rem] italic text-coffee-soft">
                            editada
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
        </div>
      </div>
    </div>
  )
}
