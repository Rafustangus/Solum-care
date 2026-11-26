import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { isDemoMode } from '../../lib/demo'
import { AuthLayout } from './AuthLayout'
import { DemoAccounts } from './DemoAccounts'
import { PasswordInput } from './PasswordInput'

export function LoginView({ onActivate, onForgot }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitCredentials(nextEmail, nextPassword) {
    setLoading(true)
    setError('')
    try {
      await login(nextEmail, nextPassword, remember)
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión.')
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await submitCredentials(email, password)
  }

  async function handleDemo(account) {
    setEmail(account.email)
    setPassword(account.password)
    await submitCredentials(account.email, account.password)
  }

  return (
    <AuthLayout
      eyebrow="Cuidado que acompaña"
      title="Tu curación, en orden."
      description="Entra con tu cuenta para seguir el plan, revisar evidencias y mantener el contacto con el estudio."
      footer={
        <p className="text-center text-[0.68rem] leading-relaxed text-coffee-soft">
          Fase piloto web · datos locales de demostración.
          <br />
          La versión Supabase se activa con las claves del proyecto.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <PasswordInput
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-coffee-soft">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember((value) => !value)}
              className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                remember
                  ? 'border-clay bg-clay text-cream'
                  : 'border-coffee/20 bg-cream text-transparent'
              )}
            >
              <span className="text-[0.6rem]">✓</span>
            </button>
            Recordarme
          </label>

          <button
            type="button"
            onClick={onForgot}
            className="rounded text-xs font-bold text-clay underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
          >
            He olvidado mi contraseña
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rust/20 bg-rust/8 px-3.5 py-3 text-xs font-medium leading-relaxed text-rust"
          >
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Entrar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-coffee-soft">
        <span>¿Eres cliente y tienes código?</span>
        <button
          type="button"
          onClick={onActivate}
          className="rounded font-bold text-clay underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
        >
          Activar cuenta
        </button>
      </div>
      <p className="mt-2 text-center text-[0.66rem] leading-relaxed text-coffee-soft">
        Los tatuadores los crea la administración del estudio.
      </p>

      {isDemoMode ? (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-coffee/10" />
            <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
              Acceso rápido de prueba
            </span>
            <span className="h-px flex-1 bg-coffee/10" />
          </div>

          <DemoAccounts onDemo={handleDemo} disabled={loading} />
        </>
      ) : null}
    </AuthLayout>
  )
}
