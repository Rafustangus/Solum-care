import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { IconButton } from './IconButton'

export function Sheet({
  open,
  onClose,
  children,
  title,
  description,
  className = '',
  showClose = true
}) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const descriptionId = useId()
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const previousFocus = document.activeElement
    dialogRef.current?.focus()
    const background = document.getElementById('root')
    const hadInert = background?.inert || false
    const previousAriaHidden = background?.getAttribute('aria-hidden')
    if (background) {
      background.inert = true
      background.setAttribute('aria-hidden', 'true')
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      const focusable = dialog?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) {
        event.preventDefault()
        dialog?.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const inside = dialog?.contains(document.activeElement)
      if (event.shiftKey && (!inside || document.activeElement === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || document.activeElement === last)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)

    const frame = requestAnimationFrame(() => {
      const initial = dialogRef.current?.querySelector('button, input, select, textarea, a[href]')
      const focusTarget = initial || dialogRef.current
      focusTarget?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      if (background) {
        background.inert = hadInert
        if (previousAriaHidden === null) background.removeAttribute('aria-hidden')
        else background.setAttribute('aria-hidden', previousAriaHidden)
      }
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [open])

  if (!open) return null

  const target = typeof document !== 'undefined' ? document.body : null
  if (!target) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-coffee/35 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-label="Cerrar panel"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel'}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[88%] w-full flex-col overflow-hidden rounded-t-[2rem] border-t border-coffee/10 bg-cream-soft shadow-[0_-20px_60px_-30px_rgba(58,46,43,0.55)] animate-sheet-up',
          'lg:max-h-[85vh] lg:w-[min(44rem,calc(100vw-3rem))] lg:rounded-[2rem] lg:border lg:shadow-soft lg:animate-fade-in',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-3 pb-1 lg:pt-4">
          <div className="mx-auto mt-0.5 h-1.5 w-12 rounded-full bg-coffee/15 sm:mx-0 lg:hidden" aria-hidden="true" />
          {showClose ? (
            <IconButton
              label="Cerrar"
              variant="soft"
              className="absolute right-4 top-3 h-9 w-9"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </IconButton>
          ) : null}
        </div>
        {title || description ? (
          <div className="px-5 pb-3 lg:pr-16">
            {title ? (
              <h2 className="font-display text-[1.55rem] leading-tight text-coffee">{title}</h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-coffee-soft">{description}</p>
            ) : null}
          </div>
        ) : null}
        <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-6">
          {children}
        </div>
      </div>
    </div>,
    target
  )
}
