import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { getPhoto } from '../../services/photoStore'
import { cn } from '../../lib/cn'

export function PhotoImage({ photo, alt = 'Evidencia del tatuaje', className = '', ...props }) {
  const [resolved, setResolved] = useState(photo?.src || null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setFailed(false)

    if (photo?.src) {
      setResolved(photo.src)
      return () => {
        active = false
      }
    }

    if (photo?.storageKey) {
      getPhoto(photo.storageKey)
        .then((value) => {
          if (active) setResolved(value)
        })
        .catch(() => {
          if (active) setFailed(true)
        })
    } else {
      setResolved(null)
    }

    return () => {
      active = false
    }
  }, [photo?.src, photo?.storageKey])

  return (
    <div className={cn('relative overflow-hidden bg-cream-deep/80', className)}>
      {resolved && !failed ? (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-coffee-soft/50">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
    </div>
  )
}
