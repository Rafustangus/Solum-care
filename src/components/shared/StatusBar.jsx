import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useClock } from '../../hooks/useClock'
import { cn } from '../../lib/cn'
import { formatTime } from '../../lib/dates'

export function StatusBar({ className = '' }) {
  const now = useClock()

  return (
    <div className={cn('safe-top relative z-20 shrink-0 bg-cream', className)}>
      <div className="flex h-8 items-center justify-between px-6 text-[0.68rem] font-bold tracking-tight text-coffee">
        <span>{formatTime(now)}</span>
        <span
          className="absolute left-1/2 top-[0.65rem] h-4 w-20 -translate-x-1/2 rounded-full bg-coffee/85"
          aria-hidden="true"
        />
        <span className="flex items-center gap-1">
          <Signal className="h-3.5 w-3.5" strokeWidth={2.6} />
          <Wifi className="h-3.5 w-3.5" strokeWidth={2.6} />
          <BatteryFull className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </div>
    </div>
  )
}
