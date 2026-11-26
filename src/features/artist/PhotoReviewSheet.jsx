import { useEffect, useState } from 'react'
import { CheckCircle2, MessageSquareWarning } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PhotoImage } from '../../components/ui/PhotoImage'
import { Sheet } from '../../components/ui/Sheet'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { formatDateTime } from '../../lib/dates'
import { cn } from '../../lib/cn'

const STATUS_META = {
  pending: { label: 'Pendiente', tone: 'pending' },
  approved: { label: 'Aprobada', tone: 'ok' },
  changes: { label: 'Cambios pedidos', tone: 'alert' }
}

const QUICK_APPROVALS = ['Todo correcto.', 'Buena evolución.', 'Sigue así, sin cambios.']
const QUICK_CHANGES = [
  'Repite la foto con más luz natural.',
  'Se ve más rojo de lo esperado. Vuelve a subir una foto hoy.',
  'No se aprecia bien la zona. Haz una foto más cercana.'
]

export function PhotoReviewSheet({ open, onClose, client, photo }) {
  const { reviewPhoto } = useAppData()
  const { pushToast, notify } = useNotifications()
  const [comment, setComment] = useState('')
  const [pendingStatus, setPendingStatus] = useState(null)

  useEffect(() => {
    if (open) {
      setComment(photo?.artistComment || '')
      setPendingStatus(null)
    }
  }, [open, photo?.id, photo?.artistComment])

  if (!client || !photo) return null

  const meta = STATUS_META[photo.status] || STATUS_META.pending

  function submit(status) {
    if (status === 'changes' && !comment.trim()) {
      setPendingStatus('changes')
      pushToast({
        title: 'Añade una indicación',
        message: 'Para pedir cambios, explica qué debe corregir el cliente.',
        tone: 'warning'
      })
      return
    }

    reviewPhoto(client.id, photo.id, status, comment.trim())
    pushToast({
      title: status === 'approved' ? 'Foto aprobada' : 'Cambios solicitados',
      message:
        status === 'approved'
          ? `${client.name.split(' ')[0]} recibirá la aprobación.`
          : `${client.name.split(' ')[0]} recibirá tu indicación.`,
      tone: status === 'approved' ? 'success' : 'warning'
    })
    notify({
      title: status === 'approved' ? 'Foto aprobada' : 'Cambios solicitados',
      body:
        status === 'approved'
          ? `El estudio ha aprobado la foto del día ${photo.day}.`
          : `El estudio ha pedido cambios en la foto del día ${photo.day}.`,
      tag: `solumcare-review-${client.id}-${photo.id}`
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Revisar día ${photo.day}`}
      description={`${client.name} · ${formatDateTime(photo.createdAt)}`}
    >
      <div className="space-y-3 pb-2">
        <PhotoImage
          photo={photo}
          alt={`Evidencia del día ${photo.day}`}
          className="aspect-[4/5] w-full rounded-[1.5rem]"
        />

        <div className="flex items-center justify-between gap-3">
          <Badge tone={meta.tone} dot>
            {meta.label}
          </Badge>
          <span className="text-xs font-semibold text-coffee-soft">
            {client.tattooZone || 'Sin zona'}
          </span>
        </div>

        {photo.note ? (
          <div className="rounded-2xl border border-coffee/10 bg-cream/70 p-3.5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-clay">
              Nota del cliente
            </p>
            <p className="mt-1 text-sm leading-relaxed text-coffee">{photo.note}</p>
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft">
            Respuestas rápidas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...QUICK_APPROVALS, ...QUICK_CHANGES].map((quick) => {
              const isChange = QUICK_CHANGES.includes(quick)
              return (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    setComment(quick)
                    setPendingStatus(null)
                  }}
                  className={cn(
                    'rounded-full border px-2.5 py-1.5 text-[0.68rem] font-semibold transition',
                    isChange
                      ? 'border-clay/25 bg-clay/6 text-clay-deep hover:bg-clay/12'
                      : 'border-olive/25 bg-olive/8 text-olive-deep hover:bg-olive/16'
                  )}
                >
                  {quick}
                </button>
              )
            })}
          </div>
        </div>

        <Textarea
          label="Comentario para el cliente"
          rows={3}
          placeholder="Explica la revisión o lo que debe corregir."
          maxLength={320}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value)
            setPendingStatus(null)
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-clay/30 text-clay-deep hover:bg-clay/6"
            onClick={() => submit('changes')}
          >
            <MessageSquareWarning className="h-4 w-4" />
            Pedir cambios
          </Button>
          <Button onClick={() => submit('approved')}>
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </Button>
        </div>

        {pendingStatus === 'changes' ? (
          <p className="rounded-xl bg-clay/10 px-3 py-2 text-xs font-medium text-clay-deep">
            Escribe una indicación antes de pedir cambios.
          </p>
        ) : null}
      </div>
    </Sheet>
  )
}
