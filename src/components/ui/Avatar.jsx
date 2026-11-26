import { getInitials } from '../../lib/platform'
import { cn } from '../../lib/cn'

const SIZES = {
  xs: 'h-8 w-8 text-[0.65rem]',
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg'
}

export function Avatar({ name = '', tone = 'olive', size = 'md', className = '' }) {
  const toneClass = tone === 'clay' ? 'bg-clay/18 text-clay-deep' : 'bg-olive/22 text-olive-deep'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-wide',
        SIZES[size],
        toneClass,
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
