import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { IconButton } from '../ui/IconButton'
import { Logo } from './Logo'

export function Header({
  onOpenSettings,
  onOpenNotifications,
  unreadCount = 0,
  title = '',
  maxWidthClass = 'max-w-7xl'
}) {
  const { user } = useAuth()

  return (
    <header className="relative z-20 shrink-0 border-b border-coffee/8 bg-cream/95 backdrop-blur">
      <div
        className={cn(
          'mx-auto flex w-full items-center justify-between gap-3 px-5 py-3 md:px-6 lg:py-4',
          maxWidthClass
        )}
      >
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
            Solum-care
          </p>
          <h1 className="truncate font-display text-xl leading-tight tracking-[-0.02em] text-coffee">
            {title || 'Panel'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <IconButton
              label={unreadCount > 0 ? `Abrir avisos, ${unreadCount} sin leer` : 'Abrir avisos'}
              variant="ghost"
              onClick={onOpenNotifications}
            >
              <Bell className="h-[1.15rem] w-[1.15rem]" />
            </IconButton>
            {unreadCount > 0 ? (
              <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[0.58rem] font-extrabold text-cream">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            aria-label="Abrir cuenta y ajustes"
          >
            <Avatar
              name={user?.name || ''}
              tone={user?.role === 'artist' ? 'clay' : 'olive'}
              size="sm"
            />
          </button>
        </div>
      </div>
    </header>
  )
}
