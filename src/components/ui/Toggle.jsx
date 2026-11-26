import { cn } from '../../lib/cn'

export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-coffee">{label}</p>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream-soft',
          checked ? 'border-clay bg-clay' : 'border-coffee/15 bg-coffee/10',
          disabled && 'opacity-50'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-cream-soft shadow-sm transition-all',
            checked ? 'left-[1.55rem]' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}
