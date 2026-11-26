import { BellRing, LogOut, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Toggle } from '../../components/ui/Toggle'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { formatLongDate } from '../../lib/dates'
import { getFrequency, getTechnique } from '../../lib/healing'
import { DemoRoleSwitch } from '../settings/DemoRoleSwitch'

export function ClientProfile({ client }) {
  const { user, logout } = useAuth()
  const { settings } = useAppData()
  const {
    remindersEnabled,
    permission,
    requestReminders,
    disableReminders,
    sendTestNotification,
    notificationsSupported
  } = useNotifications()

  const remindersOn = remindersEnabled && permission === 'granted'
  const technique = getTechnique(client?.technique)
  const frequency = getFrequency(client?.photoFrequency)
  const whatsapp = String(settings?.studioWhatsApp || '').replace(/[^\d]/g, '')

  function handleReminderToggle(next) {
    if (next) requestReminders()
    else disableReminders()
  }

  return (
    <div className="space-y-3 pb-2">
      <Card className="flex items-center gap-3 p-4">
        <Avatar name={user?.name || ''} tone="olive" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl leading-none text-coffee">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-coffee-soft">{user?.email}</p>
          <Badge tone="olive" className="mt-1.5">
            Cuenta de cliente
          </Badge>
        </div>
      </Card>

      <DemoRoleSwitch />

      {client ? (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-clay" />
            <h3 className="font-display text-xl leading-none text-coffee">Mi plan</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Zona" value={client.tattooZone || 'Sin indicar'} />
            <Row label="Técnica" value={technique.label} />
            <Row label="Inicio" value={formatLongDate(client.startDate)} />
            <Row label="Duración" value={`${client.durationDays} días`} />
            <Row label="Fotos" value={frequency.label} />
          </dl>
          {client.planNotes ? (
            <div className="mt-3 rounded-2xl bg-olive/10 p-3">
              <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-olive-deep">
                Indicación del estudio
              </p>
              <p className="mt-1 text-xs leading-relaxed text-coffee">{client.planNotes}</p>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-olive-deep" />
          <h3 className="font-display text-xl leading-none text-coffee">Recordatorios</h3>
        </div>
        <Toggle
          checked={remindersOn}
          onChange={handleReminderToggle}
          disabled={!notificationsSupported}
          label={remindersOn ? 'Recordatorios activos' : 'Activar recordatorios'}
          description={
            notificationsSupported
              ? `Avisos locales a las ${settings?.reminderTime || '09:00'}. En el piloto se envían desde este dispositivo.`
              : 'Este navegador no permite notificaciones del sistema.'
          }
        />
        {remindersOn ? (
          <Button
            variant="cream"
            size="sm"
            className="mt-3 w-full"
            onClick={sendTestNotification}
          >
            Enviar notificación de prueba
          </Button>
        ) : null}
        {permission === 'denied' ? (
          <p className="mt-2 text-[0.68rem] leading-relaxed text-clay-deep">
            El permiso está bloqueado en el navegador. Actívalo desde los ajustes del sitio.
          </p>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-olive-deep" />
          <h3 className="font-display text-xl leading-none text-coffee">Contacto del estudio</h3>
        </div>
        <p className="text-xs leading-relaxed text-coffee-soft">
          {settings?.studioEmail || 'hola@solumcare.app'}
        </p>
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-coffee/15 px-5 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
          >
            <MessageCircle className="h-4 w-4 text-olive-deep" />
            Abrir WhatsApp
          </a>
        ) : null}
      </Card>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rust/20 bg-rust/6 px-4 py-3 text-sm font-bold text-rust transition hover:bg-rust/10"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>

      <p className="pt-1 text-center text-[0.62rem] leading-relaxed text-coffee-soft">
        Solum-care · piloto web
        <br />
        Tus datos de demostración se guardan solo en este dispositivo.
      </p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs font-semibold text-coffee-soft">{label}</dt>
      <dd className="text-right text-xs font-bold text-coffee">{value}</dd>
    </div>
  )
}
