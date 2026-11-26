import { cn } from '../../lib/cn'

export function Card({ children, className = '', as: Tag = 'section', ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-[1.65rem] border border-coffee/10 bg-cream-soft/85 shadow-card backdrop-blur-[2px]',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
