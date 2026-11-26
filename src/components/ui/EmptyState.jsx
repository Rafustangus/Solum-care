import { cn } from '../../lib/cn'

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      {Icon ? (
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/18 text-olive-deep">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="font-display text-xl text-coffee">{title}</p>
      {description ? (
        <p className="mt-1 max-w-[18rem] text-sm leading-relaxed text-coffee-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
