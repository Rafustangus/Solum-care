import { useEffect, useState } from 'react'
import { BellRing, Save } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { isValidEmail } from '../../lib/validation'

export function ReminderSettings() {
  const { settings, updateSettings } = useAppData()
  const { pushToast } = useNotifications()
  const [form, setForm] = useState({
    studioWhatsApp: settings?.studioWhatsApp || '',
    studioEmail: settings?.studioEmail || '',
    reminderTime: settings?.reminderTime || '09:00'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      studioWhatsApp: settings?.studioWhatsApp || '',
      studioEmail: settings?.studioEmail || '',
      reminderTime: settings?.reminderTime || '09:00'
    })
  }, [settings])

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function save() {
    if (form.studioEmail && !isValidEmail(form.studioEmail)) {
      setError('El email del estudio no es válido.')
      return
    }
    setError('')
    updateSettings({
      studioWhatsApp: form.studioWhatsApp.trim(),
      studioEmail: form.studioEmail.trim(),
      reminderTime: form.reminderTime || '09:00'
    })
    pushToast({
      title: 'Contacto y recordatorios guardados',
      message: 'Los clientes verán los nuevos datos de contacto.',
      tone: 'success'
    })
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-clay" />
        <h3 className="font-display text-xl leading-none text-coffee">
          Contacto y recordatorios
        </h3>
      </div>

      <div className="space-y-3">
        <Input
          label="WhatsApp del estudio"
          type="tel"
          placeholder="+34 600 000 000"
          value={form.studioWhatsApp}
          onChange={(event) => update('studioWhatsApp', event.target.value)}
          hint="Se usa en los botones de contacto para clientes."
        />
        <Input
          label="Email de respaldo"
          type="email"
          inputMode="email"
          placeholder="hola@estudio.com"
          value={form.studioEmail}
          onChange={(event) => update('studioEmail', event.target.value)}
        />
        <Input
          label="Hora de recordatorio"
          type="time"
          value={form.reminderTime}
          onChange={(event) => update('reminderTime', event.target.value)}
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
      ) : null}

      <Button className="mt-3 w-full" onClick={save}>
        <Save className="h-4 w-4" />
        Guardar ajustes
      </Button>

      <p className="mt-2 text-[0.66rem] leading-relaxed text-coffee-soft">
        En el piloto, los recordatorios locales usan la hora del dispositivo. El envío real por
        email y Web Push se activará con Supabase + Resend + VAPID en el despliegue.
      </p>
    </Card>
  )
}
