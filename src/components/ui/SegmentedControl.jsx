import { cn } from '../../lib/cn'

export function SegmentedControl({ options = [], value, onChange, className = '', label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex gap-1 rounded-full border border-coffee/10 bg-cream-deep/70 p-1',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[0.72rem] font-bold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
              active
                ? 'bg-cream-soft text-coffee shadow-sm'
                : 'text-coffee-soft hover:text-coffee'
            )}
          >
            <span aria-hidden="true" className="flex shrink-0">{option.icon}</span>
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
