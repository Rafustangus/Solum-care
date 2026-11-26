import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    }))
  )
  vi.stubGlobal('Notification', { permission: 'denied', requestPermission: vi.fn() })
  if (!globalThis.requestAnimationFrame) {
    vi.stubGlobal('requestAnimationFrame', (callback) => setTimeout(() => callback(Date.now()), 0))
    vi.stubGlobal('cancelAnimationFrame', clearTimeout)
  }
})

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})
