import {
  AlertTriangle,
  BellOff,
  CalendarDays,
  Camera,
  CheckCheck,
  MessageSquareWarning,
  StickyNote
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { relativeTime } from '../../lib/dates'
import { cn } from '../../lib/cn'

const TYPE_META = {
  alert: {
    icon: AlertTriangle,
    label: 'Alerta',
    badge: 'alert',
    iconClass: 'bg-rust/12 text-rust'
  },
  photo: {
    icon: Camera,
    label: 'Foto',
    badge: 'pending',
    iconClass: 'bg-clay/12 text-clay-deep'
  },
  note: {
    icon: StickyNote,
    label: 'Nota',
    badge: 'olive',
    iconClass: 'bg-olive/18 text-olive-deep'
  },
  plan: {
    icon: CalendarDays,
    label: 'Plan',
    badge: 'clay',
    iconClass: 'bg-clay/12 text-clay-deep'
  },
  changes: {
    icon: MessageSquareWarning,
    label: 'Cambios',
    badge: 'alert',
    iconClass: 'bg-clay/12 text-clay-deep'
  }
}

export function ArtistNotifications({ onOpenClient }) {
  const {
    notificationsFor,
    markNotificationRead,
    markAllNotificationsRead
  } = useAppData()
  const { pushToast } = useNotifications()
  const notifications = notificationsFor('artist')
  const unread = notifications.filter((notification) => !notification.read).length

  function handleOpen(notification) {
    markNotificationRead(notification.id)
    if (notification.clientId) onOpenClient(notification.clientId)
  }

  function handleMarkAll() {
    if (!unread) return
    markAllNotificationsRead('artist')
    pushToast({
      title: 'Avisos marcados como leídos',
      message: 'Todo queda al día.',
      tone: 'info'
    })
  }

  return (
    <div className="phone-scroll mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:px-6 lg:pt-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
            Actividad del estudio
          </p>
          <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
            Avisos
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-coffee-soft">
            {unread ? `${unread} sin leer.` : 'Estás al día.'}
          </p>
        </div>
        {unread ? (
          <Button size="sm" variant="cream" onClick={handleMarkAll} className="mt-1">
            <CheckCheck className="h-4 w-4" />
            Leer todo
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellOff}
            title="Sin avisos"
            description="Las fotos, notas y alertas de tus clientes aparecerán aquí."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const meta = TYPE_META[notification.type] || TYPE_META.note
            const Icon = meta.icon
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-[1.5rem] border p-3.5 text-left shadow-card transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                    notification.read
                      ? 'border-coffee/8 bg-cream-soft/65 hover:border-clay/20'
                      : 'border-clay/20 bg-cream-soft hover:border-clay/35'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      meta.iconClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-coffee">
                        {notification.title}
                      </span>
                      {!notification.read ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-coffee-soft">
                      {notification.body}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <Badge tone={meta.badge} className="px-2 py-0.5 text-[0.54rem]">
                        {meta.label}
                      </Badge>
                      <span className="text-[0.62rem] font-semibold text-coffee-soft">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
