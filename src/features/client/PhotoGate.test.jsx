import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toISODate } from '../../lib/dates'
import { PhotoGate } from './PhotoGate'

const mocks = vi.hoisted(() => ({ useAppData: vi.fn() }))

vi.mock('../../context/AppDataContext', () => ({ useAppData: mocks.useAppData }))
vi.mock('../../context/BrandingContext', () => ({
  useBranding: () => ({ studioName: 'Solum Care', logoDataUrl: null, showName: true })
}))

const client = {
  id: 'client-1',
  name: 'Lucía Ferrer',
  startDate: toISODate(new Date()),
  durationDays: 14
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.useAppData.mockReturnValue({
    settings: {
      studioWhatsApp: '+34 600 123 456',
      studioEmail: 'hola@estudio.test'
    }
  })
})

describe('PhotoGate', () => {
  it('muestra el día pendiente y abre la subida de foto', async () => {
    const user = userEvent.setup()
    const onOpenPhotos = vi.fn()
    render(<PhotoGate client={client} onOpenPhotos={onOpenPhotos} />)

    expect(screen.getByRole('heading', { name: 'Hoy toca subir tu foto' })).toBeInTheDocument()
    expect(screen.getByText(/día 1 de 14/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Subir foto ahora' }))
    expect(onOpenPhotos).toHaveBeenCalledTimes(1)
  })

  it('ofrece escapatorias de WhatsApp y email', () => {
    render(<PhotoGate client={client} onOpenPhotos={vi.fn()} />)
    const whatsapp = screen.getByRole('link', { name: 'Avisar por WhatsApp' })
    const email = screen.getByRole('link', { name: 'Escribir al estudio' })

    expect(whatsapp.getAttribute('href')).toContain('https://wa.me/34600123456')
    expect(decodeURIComponent(whatsapp.getAttribute('href'))).toContain('día 1')
    expect(whatsapp).toHaveAttribute('target', '_blank')
    expect(whatsapp).toHaveAttribute('rel', 'noreferrer')
    expect(email.getAttribute('href')).toContain('mailto:hola@estudio.test')
  })

  it('oculta WhatsApp y usa el email por defecto si no hay teléfono', () => {
    mocks.useAppData.mockReturnValue({ settings: { studioWhatsApp: '', studioEmail: '' } })
    render(<PhotoGate client={client} onOpenPhotos={vi.fn()} />)

    expect(screen.queryByRole('link', { name: 'Avisar por WhatsApp' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escribir al estudio' }).getAttribute('href')).toContain(
      'mailto:hola@solumcare.app'
    )
  })
})
