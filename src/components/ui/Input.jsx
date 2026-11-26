import { useId } from 'react'
import { cn } from '../../lib/cn'

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  className = '',
  inputClassName = '',
  id,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={inputId} className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex min-h-12 items-center gap-2.5 rounded-2xl border bg-cream px-3.5 transition-all',
          error
            ? 'border-rust/50 focus-within:ring-2 focus-within:ring-rust/20'
            : 'border-coffee/15 focus-within:border-clay/60 focus-within:ring-2 focus-within:ring-clay/15',
          inputClassName
        )}
      >
        {leftIcon ? <span className="shrink-0 text-coffee-soft">{leftIcon}</span> : null}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-coffee outline-none placeholder:text-coffee-soft/60"
          {...props}
        />
        {rightSlot ? <span className="shrink-0">{rightSlot}</span> : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-rust">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-coffee-soft">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
