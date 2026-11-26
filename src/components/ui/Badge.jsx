import { cn } from '../../lib/cn'

const TONES = {
  neutral: 'bg-coffee/7 text-coffee-soft',
  cream: 'bg-cream-deep text-coffee',
  olive: 'bg-olive/18 text-olive-deep',
  clay: 'bg-clay/12 text-clay-deep',
  rust: 'bg-rust/10 text-rust',
  ok: 'bg-olive/18 text-olive-deep',
  pending: 'bg-clay/12 text-clay-deep',
  alert: 'bg-rust/10 text-rust'
}

export function Badge({ children, tone = 'neutral', className = '', dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
