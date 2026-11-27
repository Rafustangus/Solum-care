import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  Camera,
  ChevronRight,
  MessageCircle,
  StickyNote
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useClock } from '../../hooks/useClock'
import { relativeTime } from '../../lib/dates'
import {
  generateChecklist,
  getCarePlan,
  getHealingDay,
  isPhotoPending
} from '../../lib/healing'
import { CareChecklist } from './CareChecklist'
import { DayStrip } from './DayStrip'
import { HealingCounter } from './HealingCounter'
import { ReportProblemSheet } from './ReportProblemSheet'

function greeting(hour) {
  if (hour < 6) return 'Buenas noches'
  if (hour < 13) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function ClientHome({ client, onNavigate }) {
  const { user } = useAuth()
  const { notes, toggleTask, settings, careTemplates } = useAppData()
  const {
    remindersEnabled,
    permission,
    requestReminders,
    maybeRemindToday,
    notificationsSupported
  } = useNotifications()
  const now = useClock()
  const [reportOpen, setReportOpen] = useState(false)

  const healing = useMemo(
    () => getHealingDay(client?.startDate, client?.durationDays),
    [client?.startDate, client?.durationDays]
  )
  const currentDay = Math.max(1, healing.day)
  const [selectedDay, setSelectedDay] = useState(currentDay)

  useEffect(() => {
    setSelectedDay(currentDay)
  }, [currentDay])

  useEffect(() => {
    maybeRemindToday(client)
  }, [client, maybeRemindToday])

  const day = selectedDay
  const clientId = client?.id
  const technique = client?.technique
  const durationDays = client?.durationDays
  const checklist = client?.checklist
  const plan = useMemo(() => getCarePlan(technique, careTemplates), [technique, careTemplates])
  const tasks = useMemo(
    () => (clientId ? generateChecklist(plan, day, durationDays) : []),
    [clientId, plan, durationDays, day]
  )
  const completed = useMemo(() => checklist?.[String(day)] || [], [checklist, day])
  const handleToggle = useCallback(
    (taskId) => {
      if (clientId) toggleTask(clientId, day, taskId)
    },
    [clientId, day, toggleTask]
  )

  if (!client) return null

  const isCurrentDay = day === currentDay
  const pendingPhoto = isPhotoPending(client, healing.day)
  const clientNotes = notes
    .filter((note) => note.clientId === client.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const latestNote = clientNotes[0]
  const whatsapp = String(settings?.studioWhatsApp || '').replace(/[^\d]/g, '')
  const remindersOn = remindersEnabled && permission === 'granted'

  return (
    <div className="phone-scroll mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:pt-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
            {greeting(now.getHours())}
          </p>
          <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
            {user?.name?.split(' ')[0] || 'Hola'}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-coffee-soft">
            {healing.isComplete
              ? 'Tu plan ha terminado. Revisa el historial cuando quieras.'
              : 'Tu plan de hoy está listo para revisar.'}
          </p>
        </div>
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/18 text-olive-deep">
          <SparkleMark />
        </span>
      </div>

      <div className="space-y-3">
        <HealingCounter client={client} healing={healing} plan={plan} />

        <DayStrip
          client={client}
          currentDay={currentDay}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />

        {client.alert?.active ? (
          <Card className="border-rust/25 bg-rust/8 p-3.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
              <div>
                <p className="text-sm font-bold text-rust">Incidencia enviada al estudio</p>
                <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">
                  El equipo revisará tu aviso. Si empeora, contacta también por WhatsApp.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {pendingPhoto ? (
          <Card className="border-clay/30 bg-clay/10 p-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay-deep">
                <Camera className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-clay-deep">Hoy toca foto</p>
                <p className="text-xs leading-relaxed text-coffee-soft">
                  Sube la evidencia del día {healing.day} para que el estudio la revise.
                </p>
              </div>
              <Button size="sm" onClick={() => onNavigate('photos')}>
                Subir
              </Button>
            </div>
          </Card>
        ) : null}

        <CareChecklist
          tasks={tasks}
          completed={completed}
          day={day}
          readOnly={!isCurrentDay}
          onToggle={handleToggle}
        />

        {notificationsSupported && !remindersOn ? (
          <Card className="p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/18 text-olive-deep">
                <BellRing className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-coffee">Activa los recordatorios</p>
                <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">
                  Te avisamos cuando toque foto o checklist. Sin spam.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={requestReminders}>
                Activar
              </Button>
            </div>
          </Card>
        ) : null}

        {latestNote ? (
          <button
            type="button"
            onClick={() => onNavigate('notes')}
            className="w-full rounded-[1.65rem] border border-coffee/10 bg-cream-soft/85 p-3.5 text-left shadow-card transition hover:border-clay/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/12 text-clay-deep">
                <StickyNote className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-clay">
                    Última nota · {latestNote.authorName}
                  </p>
                  <span className="text-[0.62rem] font-semibold text-coffee-soft">
                    {relativeTime(latestNote.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-coffee">
                  {latestNote.text}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[0.68rem] font-bold text-clay">
                  Ir a notas
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          </button>
        ) : null}

        {client.planNotes ? (
          <Card className="border-olive/25 bg-olive/10 p-3.5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-olive-deep">
              Indicación del estudio
            </p>
            <p className="mt-1 text-sm leading-relaxed text-coffee">{client.planNotes}</p>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            className="border-rust/25 text-rust hover:bg-rust/6"
            onClick={() => setReportOpen(true)}
          >
            <AlertTriangle className="h-4 w-4" />
            Reportar
          </Button>
          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-coffee/15 px-4 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
            >
              <MessageCircle className="h-4 w-4 text-olive-deep" />
              WhatsApp
            </a>
          ) : (
            <Button variant="outline" onClick={() => onNavigate('notes')}>
              <StickyNote className="h-4 w-4" />
              Notas
            </Button>
          )}
        </div>
      </div>

      <ReportProblemSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        client={client}
      />
    </div>
  )
}

function SparkleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c.6 3.7 2.8 5.9 6.5 6.5-3.7.6-5.9 2.8-6.5 6.5-.6-3.7-2.8-5.9-6.5-6.5 3.7-.6 5.9-2.8 6.5-6.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
