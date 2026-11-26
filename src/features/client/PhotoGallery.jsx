import { useState } from 'react'
import { Camera, ChevronRight, MessageCircle } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PhotoImage } from '../../components/ui/PhotoImage'
import { Sheet } from '../../components/ui/Sheet'
import { formatDateTime, relativeTime } from '../../lib/dates'

const STATUS_META = {
  pending: { label: 'En revisión', tone: 'pending' },
  approved: { label: 'Aprobada', tone: 'ok' },
  changes: { label: 'Cambios', tone: 'alert' }
}

function sortPhotos(photos = []) {
  return [...photos].sort((a, b) => {
    if (Number(a.day) !== Number(b.day)) return Number(b.day) - Number(a.day)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function PhotoGallery({ photos = [] }) {
  const [selected, setSelected] = useState(null)
  const sorted = sortPhotos(photos)

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
            Historial
          </p>
          <h3 className="mt-0.5 font-display text-[1.55rem] leading-none text-coffee">
            Tus evidencias
          </h3>
        </div>
        <span className="rounded-full bg-coffee/6 px-2.5 py-1 text-[0.68rem] font-bold text-coffee-soft">
          {sorted.length} {sorted.length === 1 ? 'foto' : 'fotos'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={Camera}
            title="Aún no hay fotos"
            description="Cuando subas tu primera evidencia aparecerá aquí con la revisión del estudio."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {sorted.map((photo) => {
            const meta = STATUS_META[photo.status] || STATUS_META.pending
            return (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setSelected(photo)}
                  className="flex w-full items-center gap-3 rounded-[1.4rem] border border-coffee/10 bg-cream-soft/85 p-2.5 text-left shadow-card transition hover:border-clay/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                >
                  <PhotoImage
                    photo={photo}
                    alt={`Foto del día ${photo.day}`}
                    className="h-[4.6rem] w-[4.6rem] shrink-0 rounded-2xl"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-lg leading-none text-coffee">
                        Día {photo.day}
                      </span>
                      <Badge tone={meta.tone} dot className="px-2 py-0.5 text-[0.58rem]">
                        {meta.label}
                      </Badge>
                    </span>
                    <span className="mt-1 line-clamp-1 block text-xs text-coffee-soft">
                      {photo.note || 'Sin nota adjunta.'}
                    </span>
                    <span className="mt-1 block text-[0.64rem] font-semibold text-coffee-soft">
                      {relativeTime(photo.createdAt)}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-coffee-soft/60" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Evidencia del día ${selected.day}` : ''}
        description={selected ? formatDateTime(selected.createdAt) : ''}
      >
        {selected ? (
          <div className="space-y-3 pb-2">
            <PhotoImage
              photo={selected}
              alt={`Evidencia del día ${selected.day}`}
              className="aspect-[4/5] w-full rounded-[1.5rem]"
            />
            <div className="flex items-center justify-between gap-3">
              <Badge
                tone={(STATUS_META[selected.status] || STATUS_META.pending).tone}
                dot
              >
                {(STATUS_META[selected.status] || STATUS_META.pending).label}
              </Badge>
              <span className="text-xs font-semibold text-coffee-soft">
                {relativeTime(selected.createdAt)}
              </span>
            </div>
            <Card className="p-3.5">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-clay">
                Tu nota
              </p>
              <p className="mt-1 text-sm leading-relaxed text-coffee">
                {selected.note || 'No añadiste ninguna nota a esta foto.'}
              </p>
            </Card>
            {selected.artistComment ? (
              <Card className="border-olive/25 bg-olive/10 p-3.5">
                <p className="flex items-center gap-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-olive-deep">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Comentario del estudio
                </p>
                <p className="mt-1 text-sm leading-relaxed text-coffee">
                  {selected.artistComment}
                </p>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}
