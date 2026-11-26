import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from './Sheet'

function Trigger({ onClose = vi.fn() }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir panel
      </button>
      <Sheet
        open={open}
        onClose={() => {
          onClose()
          setOpen(false)
        }}
        title="Ajustes"
        description="Cambia la configuración"
      >
        <button type="button">Primero</button>
        <button type="button">Segundo</button>
      </Sheet>
    </>
  )
}

describe('Sheet', () => {
  it('no renderiza cuando está cerrado', () => {
    const { container } = render(
      <Sheet open={false} onClose={vi.fn()} title="Ajustes">
        <button type="button">Contenido</button>
      </Sheet>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('abre con etiquetas, descripción y foco inicial', async () => {
    const user = userEvent.setup()
    render(<Trigger />)

    await user.click(screen.getByRole('button', { name: 'Abrir panel' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajustes' })
    const describedBy = dialog.getAttribute('aria-describedby')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy)).toHaveTextContent('Cambia la configuración')
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    )
    expect(document.getElementById('root')).toHaveAttribute('aria-hidden', 'true')
    expect(document.getElementById('root').inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('mantiene el foco dentro del diálogo al tabular', async () => {
    const user = userEvent.setup()
    render(<Trigger />)
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajustes' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus())

    await user.tab()
    expect(within(dialog).getByRole('button', { name: 'Primero' })).toHaveFocus()
    await user.tab()
    expect(within(dialog).getByRole('button', { name: 'Segundo' })).toHaveFocus()
    await user.tab()
    expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(within(dialog).getByRole('button', { name: 'Segundo' })).toHaveFocus()

    for (let index = 0; index < 8; index += 1) await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('cierra con Escape y restaura foco, scroll y fondo', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Trigger onClose={onClose} />)
    const trigger = screen.getByRole('button', { name: 'Abrir panel' })
    trigger.focus()

    await user.click(trigger)
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeInTheDocument())
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.getElementById('root').inert).toBe(false)
    expect(document.getElementById('root')).not.toHaveAttribute('aria-hidden')
    expect(document.body.style.overflow).toBe('')
    expect(trigger).toHaveFocus()
  })

  it('llama a onClose desde el botón de cerrar y desde el fondo', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const children = <button type="button">Contenido</button>
    const { unmount } = render(
      <Sheet open onClose={onClose} title="Panel">
        {children}
      </Sheet>
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    render(
      <Sheet open onClose={onClose} title="Panel">
        {children}
      </Sheet>
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
