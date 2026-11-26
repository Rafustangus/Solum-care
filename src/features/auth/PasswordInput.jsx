import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { Input } from '../../components/ui/Input'

export function PasswordInput({ label = 'Contraseña', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      label={label}
      type={visible ? 'text' : 'password'}
      leftIcon={<LockKeyhole className="h-4 w-4" />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="rounded-full p-1 text-coffee-soft transition hover:bg-coffee/6 hover:text-coffee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  )
}
