import {
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
import { Sheet } from '../../components/ui/Sheet'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { relativeTime } from '../../lib/dates'
import { cn } from '../../lib/cn'

const TYPE_META = {
  approval: {
    icon: Camera,
    label: 'Foto',
    badge: 'ok',
    iconClass: 'bg-olive/18 text-olive-deep'
  },
  changes: {
    icon: MessageSquareWarning,
    label: 'Cambios',
    badge: 'alert',
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
  alert_resolved: {
    icon: CheckCheck,
    label: 'Incidencia',
    badge: 'ok',
    iconClass: 'bg-olive/18 text-olive-deep'
  }
}

export function ClientNotificationsSheet({ open, onClose, client }) {
  const { notificationsFor, markNotificationRead, markAllNotificationsRead } = useAppData()
  const { pushToast } = useNotifications()
  const notifications = client ? notificationsFor('client', client.id) : []
  const unread = notifications.filter((notification) => !notification.read).length

  function markAll() {
    if (!unread) return
    markAllNotificationsRead('client', client.id)
    pushToast({
      title: 'Avisos leídos',
      message: 'Todo queda al día.',
      tone: 'info'
    })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Avisos del estudio"
      description="Novedades sobre fotos, notas y tu plan de curación."
    >
      {unread ? (
        <Button variant="cream" size="sm" className="mb-3 w-full" onClick={markAll}>
          <CheckCheck className="h-4 w-4" />
          Marcar todo como leído ({unread})
        </Button>
      ) : null}

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Sin avisos todavía"
          description="Cuando el estudio revise una foto o deje una nota, lo verás aquí."
        />
      ) : (
        <ul className="space-y-2 pb-2">
          {notifications.map((notification) => {
            const meta = TYPE_META[notification.type] || TYPE_META.note
            const Icon = meta.icon
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-[1.4rem] border p-3.5 text-left transition',
                    notification.read
                      ? 'border-coffee/8 bg-cream/60'
                      : 'border-clay/20 bg-cream'
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
                    <span className="mt-0.5 block text-xs leading-relaxed text-coffee-soft">
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
    </Sheet>
  )
}
