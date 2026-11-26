import { Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Logo } from './Logo'
import { NAV_ICONS, NAV_ITEMS } from './navigation'

export function Sidebar({
  role,
  active,
  onChange,
  unreadCount = 0,
  notesUnreadCount = 0,
  onOpenSettings
}) {
  const { user } = useAuth()
  const items = NAV_ITEMS[role] || NAV_ITEMS.client
  const roleLabel = role === 'artist' ? 'Panel del estudio' : 'Tu seguimiento'

  return (
    <aside className="hidden h-dvh w-[17.5rem] shrink-0 flex-col border-r border-coffee/10 bg-cream-soft/80 px-4 py-5 backdrop-blur lg:flex">
      <div className="px-2">
        <Logo size="md" />
      </div>

      <p className="mt-7 px-3 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
        {roleLabel}
      </p>

      <nav aria-label="Navegación principal" className="mt-2 space-y-1">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const selected = active === item.id
          const badge =
            item.id === 'notifications'
              ? unreadCount
              : item.id === 'notes'
                ? notesUnreadCount
                : 0

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                selected
                  ? 'bg-clay/10 text-clay-deep'
                  : 'text-coffee-soft hover:bg-coffee/5 hover:text-coffee'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
                  selected ? 'bg-clay/15 text-clay-deep' : 'bg-cream-deep/70 text-coffee-soft'
                )}
              >
                <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={selected ? 2.5 : 2} />
              </span>
              <span className="min-w-0 flex-1 text-left">{item.label}</span>
              {badge > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.58rem] font-extrabold text-cream',
                    item.id === 'notifications' ? 'bg-clay' : 'bg-olive-deep'
                  )}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-coffee-soft transition hover:bg-coffee/5 hover:text-coffee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-deep/70 text-coffee-soft">
            <Settings className="h-[1.1rem] w-[1.1rem]" />
          </span>
          Cuenta y ajustes
        </button>

        <div className="flex items-center gap-3 rounded-[1.4rem] border border-coffee/10 bg-cream/70 p-3">
          <Avatar name={user?.name || ''} tone={role === 'artist' ? 'clay' : 'olive'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-coffee">{user?.name}</p>
            <p className="truncate text-[0.66rem] text-coffee-soft">{user?.email}</p>
          </div>
          <Badge tone={role === 'artist' ? 'clay' : 'olive'} className="shrink-0">
            {role === 'artist' ? 'estudio' : 'cliente'}
          </Badge>
        </div>
      </div>
    </aside>
  )
}
