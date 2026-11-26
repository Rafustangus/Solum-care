import { useState } from 'react'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getPasswordChecks } from '../../lib/validation'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'

export function ActivateAccountView({ onBack }) {
  const { activate } = useAuth()
  const { pushToast } = useNotifications()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const checks = getPasswordChecks(password)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await activate(email, code, password)
      pushToast({
        title: 'Cuenta activada',
        message: 'Ya puedes empezar a seguir tu plan de curación.',
        tone: 'success'
      })
    } catch (activationError) {
      setError(activationError.message || 'No se pudo activar la cuenta.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Alta de cliente"
      title="Activa tu cuenta."
      description="Introduce el email y el código de 6 dígitos que te ha dado tu tatuador al crear tu ficha. Después elige tu contraseña. Solo los clientes se registran desde aquí."
      topAction={
        <IconButton label="Volver al login" variant="soft" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </IconButton>
      }
      footer={
        <p className="text-center text-xs text-coffee-soft">
          ¿Ya tienes la cuenta activa?{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-bold text-clay underline-offset-4 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email invitado"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Input
          label="Código de invitación"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          hint="Te lo habrá facilitado tu tatuador al crear tu ficha."
          required
        />

        <PasswordInput
          label="Nueva contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {password ? (
          <div className="flex flex-wrap gap-1.5">
            {[
              ['length', '8 caracteres'],
              ['letter', 'una letra'],
              ['number', 'un número']
            ].map(([key, label]) => (
              <span
                key={key}
                className={
                  checks[key]
                    ? 'rounded-full bg-olive/18 px-2.5 py-1 text-[0.62rem] font-bold text-olive-deep'
                    : 'rounded-full bg-coffee/6 px-2.5 py-1 text-[0.62rem] font-bold text-coffee-soft'
                }
              >
                {checks[key] ? '✓' : '·'} {label}
              </span>
            ))}
          </div>
        ) : null}

        <PasswordInput
          label="Repite la contraseña"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rust/20 bg-rust/8 px-3.5 py-3 text-xs font-medium leading-relaxed text-rust"
          >
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Activar cuenta de cliente
          <BadgeCheck className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  )
}
