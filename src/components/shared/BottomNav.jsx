import { cn } from '../../lib/cn'
import { NAV_ICONS, NAV_ITEMS } from './navigation'

export function BottomNav({ role, active, onChange, unreadCount = 0, notesUnreadCount = 0 }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.client

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="safe-bottom relative z-20 shrink-0 border-t border-coffee/8 bg-cream-soft/95 px-3 pb-1 pt-2 backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-around gap-1">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const selected = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[0.64rem] font-bold transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                selected ? 'text-clay' : 'text-coffee-soft hover:text-coffee'
              )}
            >
              <span
                className={cn(
                  'relative flex h-8 w-10 items-center justify-center rounded-full transition-all',
                  selected ? 'bg-clay/12' : 'bg-transparent'
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={selected ? 2.5 : 2} />
                {item.id === 'notifications' && unreadCount > 0 ? (
                  <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[0.55rem] font-extrabold text-cream">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
                {item.id === 'notes' && notesUnreadCount > 0 ? (
                  <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive-deep px-1 text-[0.55rem] font-extrabold text-cream">
                    {notesUnreadCount > 9 ? '9+' : notesUnreadCount}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
              {selected ? (
                <span className="absolute -top-2 h-1 w-5 rounded-full bg-clay" aria-hidden="true" />
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
