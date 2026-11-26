import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

const VARIANTS = {
  primary:
    'bg-clay text-cream hover:bg-clay-deep active:bg-clay-deep shadow-[0_12px_26px_-16px_rgba(179,92,62,0.9)]',
  secondary: 'bg-olive text-coffee hover:bg-olive-deep hover:text-cream active:bg-olive-deep',
  ghost: 'bg-transparent text-coffee hover:bg-coffee/6 active:bg-coffee/10',
  outline:
    'border border-coffee/20 bg-transparent text-coffee hover:bg-cream-deep/70 active:bg-cream-deep',
  danger: 'bg-rust text-cream hover:bg-rust/90 active:bg-rust/95',
  cream:
    'border border-coffee/10 bg-cream-soft text-coffee hover:bg-cream-deep active:bg-cream-deep'
}

const SIZES = {
  sm: 'min-h-9 px-3.5 text-[0.78rem] gap-1.5 rounded-full',
  md: 'min-h-11 px-5 text-sm gap-2 rounded-full',
  lg: 'min-h-13 px-6 text-[0.95rem] gap-2.5 rounded-full',
  icon: 'h-11 w-11 rounded-full'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
