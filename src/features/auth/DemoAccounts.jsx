import { Palette, UserRound } from 'lucide-react'
import { DEMO_ACCOUNTS } from '../../lib/demo'

const ICONS = {
  client: UserRound,
  artist: Palette
}

const ORDER = ['client', 'artist']

export function DemoAccounts({ onDemo, disabled = false }) {
  return (
    <div className="space-y-2">
      {ORDER.map((role) => {
        const account = { ...DEMO_ACCOUNTS[role], id: role }
        const Icon = ICONS[role]
        return (
          <button
            key={account.id}
            type="button"
            disabled={disabled}
            onClick={() => onDemo(account)}
            className="flex w-full items-center gap-3 rounded-2xl border border-coffee/10 bg-cream-soft/80 p-3 text-left transition hover:border-clay/30 hover:bg-cream-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:opacity-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/18 text-olive-deep">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-coffee">{account.label}</span>
              <span className="block text-xs text-coffee-soft">{account.caption}</span>
            </span>
            <span className="rounded-full bg-clay/10 px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.1em] text-clay-deep">
              demo
            </span>
          </button>
        )
      })}
    </div>
  )
}
