import { cn } from '../../lib/cn'

export function ProgressBar({ value = 0, className = '', barClassName = 'bg-clay' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div
      className={cn('h-2 overflow-hidden rounded-full bg-coffee/10', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
