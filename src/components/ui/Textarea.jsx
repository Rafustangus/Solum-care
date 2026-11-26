import { useId } from 'react'
import { cn } from '../../lib/cn'

export function Textarea({
  label,
  error,
  hint,
  className = '',
  textareaClassName = '',
  id,
  rows = 4,
  ...props
}) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={textareaId}
          className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        className={cn(
          'w-full resize-none rounded-2xl border bg-cream px-3.5 py-3 text-sm leading-relaxed text-coffee outline-none transition-all placeholder:text-coffee-soft/60',
          error
            ? 'border-rust/50 focus:ring-2 focus:ring-rust/20'
            : 'border-coffee/15 focus:border-clay/60 focus:ring-2 focus:ring-clay/15',
          textareaClassName
        )}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="text-xs font-medium text-rust">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="text-xs text-coffee-soft">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
