import { useState } from 'react'
import { AlertTriangle, LogOut, RotateCcw, X } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { BrandingSettings } from './BrandingSettings'
import { DemoRoleSwitch } from './DemoRoleSwitch'
import { ReminderSettings } from './ReminderSettings'
import { TeamSettings } from './TeamSettings'

export function ArtistSettings() {
  const { user, logout } = useAuth()
  const { resetDemo } = useAppData()
  const { pushToast } = useNotifications()
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    setResetting(true)
    try {
      await resetDemo()
      setConfirmReset(false)
      pushToast({
        title: 'Demo restaurada',
        message: 'Los clientes, notas y fotos vuelven al estado inicial.',
        tone: 'success'
      })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-3 pb-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3 lg:space-y-0">
      <Card className="flex items-center gap-3 p-4 lg:col-span-2">
        <Avatar name={user?.name || ''} tone="clay" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl leading-none text-coffee">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-coffee-soft">{user?.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="clay">Estudio</Badge>
            {user?.specialty ? (
              <Badge tone="cream" className="normal-case tracking-normal">
                {user.specialty}
              </Badge>
            ) : null}
          </div>
        </div>
      </Card>

      <DemoRoleSwitch />
      <TeamSettings />
      <div className="lg:col-span-2">
        <BrandingSettings />
      </div>
      <div className="lg:col-span-2">
        <ReminderSettings />
      </div>

      <Card className="border-rust/20 bg-rust/6 p-4 lg:col-span-2">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rust" />
          <h3 className="font-display text-xl leading-none text-rust">Zona de prueba</h3>
        </div>
        <p className="text-xs leading-relaxed text-coffee-soft">
          Restaura los datos locales de demostración. Se borran las fotos subidas en este
          dispositivo, las notas nuevas y los cambios de plan.
        </p>

        {confirmReset ? (
          <div className="mt-3 rounded-2xl border border-rust/20 bg-cream/70 p-3">
            <p className="text-xs font-bold text-rust">¿Restaurar toda la demo?</p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={resetting}
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Sí, restaurar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-3 w-full border-rust/25 text-rust hover:bg-rust/8"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar demo
          </Button>
        )}
      </Card>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rust/20 bg-rust/6 px-4 py-3 text-sm font-bold text-rust transition hover:bg-rust/10 lg:col-span-2"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>

      <p className="pt-1 text-center text-[0.62rem] leading-relaxed text-coffee-soft lg:col-span-2">
        Solum-care · piloto web
        <br />
        Supabase + Vercel pendientes de conectar.
      </p>
    </div>
  )
}
