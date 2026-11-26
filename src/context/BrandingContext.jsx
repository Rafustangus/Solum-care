import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../lib/assets'
import { loadBranding, saveBranding } from '../services/api'

const DEFAULT_BRANDING = {
  studioName: 'Solum-care',
  logoDataUrl: null,
  showName: true,
  updatedAt: null
}

const BrandingContext = createContext(null)

function applyIconLinks(logoDataUrl) {
  if (typeof document === 'undefined') return
  const iconHref = logoDataUrl || assetUrl('logo.png')
  const appleHref = logoDataUrl || assetUrl('apple-touch-icon.png')

  let icon = document.querySelector('link[rel="icon"]')
  if (!icon) {
    icon = document.createElement('link')
    icon.rel = 'icon'
    document.head.appendChild(icon)
  }
  icon.href = iconHref

  let apple = document.querySelector('link[rel="apple-touch-icon"]')
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href = appleHref
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(() => ({
    ...DEFAULT_BRANDING,
    ...(loadBranding() || {})
  }))

  useEffect(() => {
    applyIconLinks(branding.logoDataUrl)
    document.title = branding.studioName || DEFAULT_BRANDING.studioName
    saveBranding(branding)
  }, [branding])

  const updateBranding = useCallback((patch) => {
    setBranding((previous) => ({
      ...previous,
      ...patch,
      updatedAt: new Date().toISOString()
    }))
  }, [])

  const resetBranding = useCallback(() => {
    setBranding({ ...DEFAULT_BRANDING, updatedAt: new Date().toISOString() })
  }, [])

  const value = useMemo(
    () => ({
      ...branding,
      isCustomLogo: Boolean(branding.logoDataUrl),
      updateBranding,
      resetBranding
    }),
    [branding, updateBranding, resetBranding]
  )

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) throw new Error('useBranding debe usarse dentro de BrandingProvider')
  return context
}
