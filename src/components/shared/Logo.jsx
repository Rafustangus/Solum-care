import { useBranding } from '../../context/BrandingContext'
import { assetUrl } from '../../lib/assets'
import { cn } from '../../lib/cn'

const SIZES = {
  sm: { mark: 'h-7 w-7', text: 'text-[1.35rem]', gap: 'gap-2' },
  md: { mark: 'h-9 w-9', text: 'text-[1.7rem]', gap: 'gap-2.5' },
  lg: { mark: 'h-14 w-14', text: 'text-[2.65rem]', gap: 'gap-3.5' }
}

export function Logo({ size = 'md', showName, className = '', centered = false }) {
  const { studioName, logoDataUrl, showName: globalShowName } = useBranding()
  const dimensions = SIZES[size] || SIZES.md
  const displayName = showName ?? globalShowName
  const defaultName = studioName.trim().toLowerCase() === 'solum-care'

  return (
    <div
      className={cn(
        'flex min-w-0 items-center',
        dimensions.gap,
        centered && 'justify-center',
        className
      )}
      aria-label={studioName}
    >
      {logoDataUrl ? (
        <img
          src={logoDataUrl}
          alt={`Logo de ${studioName}`}
          className={cn('w-auto max-w-[9.5rem] object-contain', dimensions.mark)}
        />
      ) : (
        <img
          src={assetUrl('logo.png')}
          alt=""
          aria-hidden="true"
          className={cn('shrink-0 object-contain', dimensions.mark)}
        />
      )}

      {displayName ? (
        <span
          className={cn(
            'truncate font-display font-semibold leading-none tracking-[-0.035em] text-coffee',
            dimensions.text
          )}
        >
          {defaultName ? (
            <>
              solum<span className="text-clay">care</span>
            </>
          ) : (
            studioName
          )}
        </span>
      ) : null}
    </div>
  )
}
