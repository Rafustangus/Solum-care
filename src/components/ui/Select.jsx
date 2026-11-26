import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({ label, error, hint, options = [], className = '', id, ...props }) {
  const generatedId = useId()
  const selectId = id || generatedId

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft"
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'relative flex min-h-12 items-center rounded-2xl border bg-cream px-3.5 transition-all',
          error
            ? 'border-rust/50 focus-within:ring-2 focus-within:ring-rust/40'
            : 'border-coffee/15 focus-within:border-clay/60 focus-within:ring-2 focus-within:ring-clay/40'
        )}
      >
        <select
          id={selectId}
          className="min-w-0 flex-1 appearance-none bg-transparent py-3 pr-6 text-sm text-coffee outline-none"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 h-4 w-4 text-coffee-soft" />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs font-medium text-rust">{error}</p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-coffee-soft">{hint}</p>
      ) : null}
    </div>
  )
}
