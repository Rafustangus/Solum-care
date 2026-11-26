import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { cn } from '../../lib/cn'

const TONES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-olive-deep',
    barClass: 'bg-olive'
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-clay-deep',
    barClass: 'bg-clay'
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rust',
    barClass: 'bg-rust'
  },
  info: {
    icon: Info,
    iconClass: 'text-coffee-soft',
    barClass: 'bg-coffee/25'
  }
}

export function ToastViewport() {
  const { toasts, removeToast } = useNotifications()
  const target = typeof document !== 'undefined' ? document.body : null

  if (!target || !toasts.length) return null

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-4 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-[95] flex flex-col gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[23rem]"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] || TONES.info
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-coffee/10 bg-cream-soft/95 p-3.5 shadow-soft backdrop-blur animate-toast-in"
          >
            <span aria-hidden="true" className={cn('mt-0.5 shrink-0', tone.iconClass)}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight text-coffee">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">{toast.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-full p-1.5 text-coffee-soft transition hover:bg-coffee/6 hover:text-coffee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream-soft"
              aria-label="Cerrar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span className={cn('absolute bottom-0 left-0 h-0.5 w-full opacity-60', tone.barClass)} />
          </div>
        )
      })}
    </div>,
    target
  )
}
