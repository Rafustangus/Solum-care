import { useMemo, useState } from 'react'
import { ChevronRight, Images } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PhotoImage } from '../../components/ui/PhotoImage'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { relativeTime } from '../../lib/dates'
import { PhotoReviewSheet } from './PhotoReviewSheet'

const STATUS_META = {
  pending: { label: 'Pendiente', tone: 'pending' },
  approved: { label: 'Aprobada', tone: 'ok' },
  changes: { label: 'Cambios', tone: 'alert' }
}

export function ArtistPhotoFeed({ clients }) {
  const [filter, setFilter] = useState('pending')
  const [review, setReview] = useState(null)

  const entries = useMemo(() => {
    return clients
      .flatMap((client) =>
        (client.photos || []).map((photo) => ({ client, photo }))
      )
      .sort((a, b) => new Date(b.photo.createdAt) - new Date(a.photo.createdAt))
  }, [clients])

  const pendingCount = entries.filter((entry) => entry.photo.status === 'pending').length
  const visible = filter === 'pending'
    ? entries.filter((entry) => entry.photo.status === 'pending')
    : entries

  return (
    <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:px-6 lg:pt-6">
      <div className="mb-4">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
          Revisión visual
        </p>
        <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
          Evidencias
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-coffee-soft">
          {pendingCount
            ? `${pendingCount} ${pendingCount === 1 ? 'foto espera' : 'fotos esperan'} tu revisión.`
            : 'No hay fotos pendientes. Todo revisado.'}
        </p>
      </div>

      <SegmentedControl
        label="Filtrar evidencias"
        className="mb-4"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'pending', label: `Pendientes · ${pendingCount}` },
          { value: 'all', label: `Todas · ${entries.length}` }
        ]}
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Images}
            title={filter === 'pending' ? 'Nada pendiente' : 'Aún no hay fotos'}
            description={
              filter === 'pending'
                ? 'Cuando un cliente suba una evidencia nueva aparecerá aquí.'
                : 'Las evidencias de todos los clientes se reunirán en este muro.'
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ client, photo }) => {
            const meta = STATUS_META[photo.status] || STATUS_META.pending
            return (
              <li key={photo.id}>
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setReview({ client, photo })}
                    className="block w-full text-left focus-visible:outline-none"
                    aria-label={`Revisar foto de ${client.name}, día ${photo.day}`}
                  >
                    <PhotoImage
                      photo={photo}
                      alt={`Foto de ${client.name}, día ${photo.day}`}
                      className="aspect-[16/10] w-full"
                    />
                  </button>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={client.name} tone="olive" size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-coffee">{client.name}</p>
                        <p className="text-[0.64rem] font-semibold text-coffee-soft">
                          Día {photo.day} · {relativeTime(photo.createdAt)}
                        </p>
                      </div>
                      <Badge tone={meta.tone} dot className="px-2 py-0.5 text-[0.58rem]">
                        {meta.label}
                      </Badge>
                    </div>

                    {photo.note ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-coffee-soft">
                        “{photo.note}”
                      </p>
                    ) : null}

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[0.64rem] font-semibold text-coffee-soft">
                        {client.tattooZone || 'Sin zona'}
                      </span>
                      <Button
                        size="sm"
                        variant={photo.status === 'pending' ? 'primary' : 'cream'}
                        onClick={() => setReview({ client, photo })}
                      >
                        {photo.status === 'pending' ? 'Revisar' : 'Ver revisión'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <PhotoReviewSheet
        open={Boolean(review)}
        onClose={() => setReview(null)}
        client={review?.client}
        photo={review?.photo}
      />
    </div>
  )
}
