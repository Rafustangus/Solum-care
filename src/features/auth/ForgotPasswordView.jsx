import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { isValidPassword } from '../../lib/validation'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'

export function ForgotPasswordView({ onBack }) {
  const { requestReset, resetPassword } = useAuth()
  const { pushToast } = useNotifications()
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequest(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await requestReset(email)
      if (!result?.code) {
        setError('No encontramos una cuenta activa con ese email.')
        setLoading(false)
        return
      }
      setDemoCode(result.code)
      setStep('reset')
      pushToast({
        title: 'Código generado',
        message: 'En el piloto local mostramos el código directamente.',
        tone: 'info'
      })
    } catch (requestError) {
      setError(requestError.message || 'No se pudo generar el código.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(event) {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!isValidPassword(password)) {
      setError('La contraseña debe tener 8 caracteres, una letra y un número.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, code, password)
      pushToast({
        title: 'Contraseña actualizada',
        message: 'Ya puedes iniciar sesión con tu nueva contraseña.',
        tone: 'success'
      })
      onBack()
    } catch (resetError) {
      setError(resetError.message || 'No se pudo cambiar la contraseña.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Recuperar acceso"
      title={step === 'request' ? '¿Olvidaste tu contraseña?' : 'Elige una nueva.'}
      description={
        step === 'request'
          ? 'Introduce el email de tu cuenta y generaremos un código de recuperación.'
          : 'Usa el código de 6 dígitos y define una nueva contraseña segura.'
      }
      topAction={
        <IconButton label="Volver al login" variant="soft" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </IconButton>
      }
    >
      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <Input
            label="Email de la cuenta"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
          {error ? (
            <div className="rounded-2xl border border-rust/20 bg-rust/8 px-3.5 py-3 text-xs font-medium text-rust">
              {error}
            </div>
          ) : null}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Generar código
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-olive/25 bg-olive/10 p-3.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-deep" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-olive-deep">
                Código de prueba
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.22em] text-coffee">
                {demoCode}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-coffee-soft">
                En producción se enviará por email desde Supabase.
              </p>
            </div>
          </div>

          <Input
            label="Código de recuperación"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            leftIcon={<KeyRound className="h-4 w-4" />}
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

          <PasswordInput
            label="Repite la contraseña"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />

          {error ? (
            <div className="rounded-2xl border border-rust/20 bg-rust/8 px-3.5 py-3 text-xs font-medium text-rust">
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Cambiar contraseña
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
