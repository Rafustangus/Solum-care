import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Pencil,
  StickyNote
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconButton } from '../../components/ui/IconButton'
import { PhotoImage } from '../../components/ui/PhotoImage'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { formatLongDate, relativeTime } from '../../lib/dates'
import {
  CLIENT_STATUS_META,
  generateChecklist,
  getCarePlan,
  getChecklistProgress,
  getClientStatus,
  getFrequency,
  getHealingDay
} from '../../lib/healing'
import { whatsappUrl } from '../../lib/platform'
import { PhotoReviewSheet } from './PhotoReviewSheet'
import { PlanEditorSheet } from './PlanEditorSheet'

const PHOTO_STATUS = {
  pending: { label: 'Pendiente', tone: 'pending' },
  approved: { label: 'Aprobada', tone: 'ok' },
  changes: { label: 'Cambios', tone: 'alert' }
}

export function ClientDetail({ client, onBack, onOpenNotes }) {
  const { resolveAlert, careTemplates } = useAppData()
  const { pushToast } = useNotifications()
  const [reviewTarget, setReviewTarget] = useState(null)
  const [planOpen, setPlanOpen] = useState(false)

  if (!client) return null

  const healing = getHealingDay(client.startDate, client.durationDays)
  const status = getClientStatus(client)
  const statusMeta = CLIENT_STATUS_META[status]
  const plan = getCarePlan(client.technique, careTemplates)
  const frequency = getFrequency(client.photoFrequency)
  const day = Math.max(1, healing.day)
  const tasks = generateChecklist(plan, day, client.durationDays)
  const checklist = getChecklistProgress(client, day, tasks)
  const photos = [...(client.photos || [])].sort((a, b) => {
    if (Number(a.day) !== Number(b.day)) return Number(b.day) - Number(a.day)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  function handleResolve() {
    resolveAlert(client.id)
    pushToast({
      title: 'Alerta revisada',
      message: `${client.name.split(' ')[0]} recibirá el aviso de que ya la has visto.`,
      tone: 'success'
    })
  }

  return (
    <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6 pt-3 lg:px-6 lg:pt-5">
      <div className="mb-3 flex items-center gap-2">
        <IconButton
          label="Volver a clientes"
          variant="soft"
          onClick={onBack}
          className="lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
            Ficha del cliente
          </p>
          <p className="truncate font-display text-lg leading-none text-coffee">
            {client.name}
          </p>
        </div>
        <Badge tone={statusMeta.id} dot>
          {statusMeta.label}
        </Badge>
      </div>

      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Avatar name={client.name} tone="olive" size="md" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[1.7rem] leading-none text-coffee">
                {client.name}
              </h1>
              <p className="mt-1 truncate text-xs text-coffee-soft">{client.email}</p>
              <p className="truncate text-xs text-coffee-soft">
                {client.phone || 'Sin teléfono'} · {client.tattooZone || 'Sin zona'}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Día" value={`${healing.day}/${healing.total}`} />
            <Stat label="Fotos" value={photos.length} />
            <Stat label="Checklist" value={`${checklist.percent}%`} />
          </div>
        </Card>

        {client.alert?.active ? (
          <Card className="border-rust/30 bg-rust/8 p-4 lg:col-span-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-rust">Alerta activa</p>
                <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">
                  {client.alert.symptoms?.length
                    ? `Síntomas: ${client.alert.symptoms.join(', ')}.`
                    : 'Sin síntomas marcados.'}{' '}
                  {client.alert.note}
                </p>
                <p className="mt-1 text-[0.62rem] font-semibold text-rust/80">
                  {relativeTime(client.alert.createdAt)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleResolve}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Marcar revisada
                  </Button>
                  {client.phone ? (
                    <a
                      href={whatsappUrl(
                        client.phone,
                        `Hola ${client.name.split(' ')[0]}, he visto tu aviso en Solum-care.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-rust/25 px-3 text-xs font-bold text-rust transition hover:bg-rust/10"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-clay" />
              <h2 className="font-display text-xl leading-none text-coffee">Plan</h2>
            </div>
            <Button size="sm" variant="cream" onClick={() => setPlanOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Pauta" value={plan.label} />
            <Row label="Inicio" value={formatLongDate(client.startDate)} />
            <Row label="Duración" value={`${client.durationDays} días`} />
            <Row label="Fotos" value={frequency.label} />
          </dl>
          {client.planNotes ? (
            <div className="mt-3 rounded-2xl bg-olive/10 p-3">
              <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-olive-deep">
                Indicaciones
              </p>
              <p className="mt-1 text-xs leading-relaxed text-coffee">{client.planNotes}</p>
            </div>
          ) : null}
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-olive-deep" />
            <h2 className="font-display text-xl leading-none text-coffee">
              Cuidados de hoy
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar
              value={checklist.percent}
              className="flex-1"
              barClassName={checklist.percent === 100 ? 'bg-olive' : 'bg-clay'}
            />
            <span className="text-xs font-bold text-coffee-soft">
              {checklist.done}/{checklist.total}
            </span>
          </div>
          <p className="mt-1.5 text-[0.68rem] leading-relaxed text-coffee-soft">
            {checklist.done === checklist.total && checklist.total > 0
              ? 'El cliente ha completado el checklist de hoy.'
              : `Faltan ${checklist.total - checklist.done} tareas para completar el día ${day}.`}
          </p>
        </Card>

        <div className="flex items-end justify-between gap-3 px-1 pt-1 lg:col-span-2">
          <h2 className="font-display text-[1.6rem] leading-none text-coffee">
            Evidencias
          </h2>
          <span className="rounded-full bg-coffee/6 px-2.5 py-1 text-[0.68rem] font-bold text-coffee-soft">
            {photos.length}
          </span>
        </div>

        {photos.length === 0 ? (
          <Card className="lg:col-span-2">
            <EmptyState
              icon={CalendarDays}
              title="Sin fotos todavía"
              description="Cuando el cliente suba su primera evidencia aparecerá aquí."
            />
          </Card>
        ) : (
          <ul className="space-y-2 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
            {photos.map((photo) => {
              const meta = PHOTO_STATUS[photo.status] || PHOTO_STATUS.pending
              return (
                <li key={photo.id}>
                  <Card className="p-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewTarget(photo)}
                        className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                        aria-label={`Abrir foto del día ${photo.day}`}
                      >
                        <PhotoImage
                          photo={photo}
                          alt={`Foto del día ${photo.day}`}
                          className="h-[4.4rem] w-[4.4rem] rounded-2xl"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-display text-lg leading-none text-coffee">
                            Día {photo.day}
                          </p>
                          <Badge tone={meta.tone} className="px-2 py-0.5 text-[0.56rem]">
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-coffee-soft">
                          {photo.note || 'Sin nota del cliente.'}
                        </p>
                        <p className="mt-0.5 text-[0.62rem] font-semibold text-coffee-soft">
                          {relativeTime(photo.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="cream"
                        onClick={() => setReviewTarget(photo)}
                        className="shrink-0"
                      >
                        Revisar
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1 lg:col-span-2 lg:max-w-md">
          <Button variant="secondary" onClick={onOpenNotes}>
            <StickyNote className="h-4 w-4" />
            Notas
          </Button>
          {client.phone ? (
            <a
              href={whatsappUrl(client.phone)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-coffee/15 px-4 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
            >
              <MessageCircle className="h-4 w-4 text-olive-deep" />
              WhatsApp
            </a>
          ) : (
            <Button variant="outline" onClick={() => setPlanOpen(true)}>
              <Pencil className="h-4 w-4" />
              Editar plan
            </Button>
          )}
        </div>
      </div>

      <PhotoReviewSheet
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        client={client}
        photo={reviewTarget}
      />
      <PlanEditorSheet
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        client={client}
      />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs font-semibold text-coffee-soft">{label}</dt>
      <dd className="text-right text-xs font-bold text-coffee">{value}</dd>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-cream-deep/60 px-2 py-2 text-center">
      <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-coffee-soft">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg leading-none text-coffee">{value}</p>
    </div>
  )
}
