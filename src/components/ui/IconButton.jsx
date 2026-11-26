import { cn } from '../../lib/cn'

const VARIANTS = {
  solid: 'bg-coffee text-cream hover:bg-coffee-soft',
  soft: 'bg-cream-deep/80 text-coffee hover:bg-cream-deep',
  ghost: 'bg-transparent text-coffee hover:bg-coffee/6',
  clay: 'bg-clay text-cream hover:bg-clay-deep'
}

export function IconButton({
  children,
  label,
  variant = 'soft',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
