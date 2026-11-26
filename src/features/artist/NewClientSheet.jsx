import { useEffect, useState } from 'react'
import { BadgeCheck, Copy, MessageCircle, Plus, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Sheet } from '../../components/ui/Sheet'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { generateId } from '../../lib/crypto'
import { toISODate } from '../../lib/dates'
import {
  isValidDurationDays,
  MAX_DURATION_DAYS,
  MIN_DURATION_DAYS,
  PHOTO_FREQUENCIES,
  TECHNIQUES
} from '../../lib/healing'
import { copyText, whatsappUrl } from '../../lib/platform'
import { isValidEmail } from '../../lib/validation'

const TECHNIQUE_OPTIONS = Object.values(TECHNIQUES).map((technique) => ({
  value: technique.id,
  label: technique.label
}))

const FREQUENCY_OPTIONS = Object.values(PHOTO_FREQUENCIES).map((frequency) => ({
  value: frequency.id,
  label: frequency.label
}))

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  tattooZone: '',
  technique: 'second-skin',
  startDate: toISODate(),
  durationDays: '14',
  photoFrequency: 'daily',
  planNotes: ''
}

export function NewClientSheet({ open, onClose }) {
  const { addClient } = useAppData()
  const { user, inviteUser } = useAuth()
  const { pushToast } = useNotifications()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [invitation, setInvitation] = useState(null)

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, startDate: toISODate() })
      setError('')
      setInvitation(null)
      setLoading(false)
    }
  }, [open])

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function handleTechnique(value) {
    setForm((previous) => ({ ...previous, technique: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Introduce el nombre del cliente.')
      return
    }
    if (!isValidEmail(form.email)) {
      setError('Introduce un email válido para enviar la invitación.')
      return
    }
    if (!isValidDurationDays(form.durationDays)) {
      setError(`La duración debe ser un número entero entre ${MIN_DURATION_DAYS} y ${MAX_DURATION_DAYS} días.`)
      return
    }

    setLoading(true)
    const clientId = generateId('client')

    try {
      const invited = await inviteUser({
        name: form.name,
        email: form.email,
        role: 'client',
        studioId: user?.studioId || 'studio-solum',
        clientId,
        assignedArtistId: user?.id || null
      })

      const client = addClient({
        id: clientId,
        userId: invited.user.id,
        assignedArtistId: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        tattooZone: form.tattooZone,
        technique: form.technique,
        startDate: form.startDate,
        durationDays: Number(form.durationDays),
        photoFrequency: form.photoFrequency,
        planNotes: form.planNotes
      })

      setInvitation({ client, code: invited.code })
      pushToast({
        title: 'Invitación creada',
        message: 'Comparte el código con el cliente para que active su cuenta.',
        tone: 'success'
      })
    } catch (inviteError) {
      setError(inviteError.message || 'No se pudo crear la invitación.')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    if (!invitation) return
    const copied = await copyText(invitation.code)
    pushToast({
      title: copied ? 'Código copiado' : 'No se pudo copiar',
      message: copied ? 'Pégalo donde quieras compartirlo.' : 'Cópialo manualmente.',
      tone: copied ? 'success' : 'warning'
    })
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM, startDate: toISODate() })
    setInvitation(null)
    setError('')
  }

  const invitationMessage = invitation
    ? `Hola ${invitation.client.name.split(' ')[0]}, tu cuenta de Solum-care está lista. Entra en la app, elige "Activar cuenta" y usa este código: ${invitation.code}`
    : ''

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={invitation ? 'Invitación lista' : 'Nueva ficha de cliente'}
      description={
        invitation
          ? 'El cliente ya tiene una ficha y una invitación de 6 dígitos.'
          : 'Crea la ficha, define el plan y genera el código de activación.'
      }
    >
      {invitation ? (
        <div className="space-y-3 pb-2">
          <div className="rounded-[1.6rem] border border-olive/30 bg-olive/12 p-5 text-center">
            <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-olive/20 text-olive-deep">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-olive-deep">
              Código de invitación
            </p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-[0.28em] text-coffee">
              {invitation.code}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-coffee-soft">
              Caduca en 7 días. Compártelo con {invitation.client.name}.
            </p>
          </div>

          <div className="rounded-2xl border border-coffee/10 bg-cream/70 p-3.5">
            <p className="text-xs font-bold text-coffee">{invitation.client.name}</p>
            <p className="mt-0.5 text-xs text-coffee-soft">{invitation.client.email}</p>
            <p className="mt-0.5 text-xs text-coffee-soft">
              {invitation.client.tattooZone || 'Sin zona indicada'} ·{' '}
              {invitation.client.durationDays} días
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="cream" onClick={copyCode}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <a
              href={whatsappUrl(invitation.client.phone, invitationMessage)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-olive px-4 text-sm font-semibold text-coffee transition hover:bg-olive-deep hover:text-cream"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar
            </a>
          </div>

          <Button variant="outline" className="w-full" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            Crear otra ficha
          </Button>
          <Button className="w-full" onClick={onClose}>
            Hecho
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pb-2">
          <Input
            label="Nombre completo"
            placeholder="Ej. Marta Gil"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            inputMode="email"
            placeholder="cliente@email.com"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+34 600 000 000"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
            <Input
              label="Zona"
              placeholder="Antebrazo"
              value={form.tattooZone}
              onChange={(event) => update('tattooZone', event.target.value)}
            />
          </div>

          <Select
            label="Técnica"
            value={form.technique}
            onChange={(event) => handleTechnique(event.target.value)}
            options={TECHNIQUE_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Inicio"
              type="date"
              value={form.startDate}
              onChange={(event) => update('startDate', event.target.value)}
              required
            />
            <Input
              label="Duración (días)"
              type="number"
              inputMode="numeric"
              min={MIN_DURATION_DAYS}
              max={MAX_DURATION_DAYS}
              step="1"
              value={form.durationDays}
              onChange={(event) => update('durationDays', event.target.value)}
              hint={`Entre ${MIN_DURATION_DAYS} y ${MAX_DURATION_DAYS} días.`}
              required
            />
          </div>

          <Select
            label="Frecuencia de fotos"
            value={form.photoFrequency}
            onChange={(event) => update('photoFrequency', event.target.value)}
            options={FREQUENCY_OPTIONS}
          />

          <Textarea
            label="Indicaciones del plan"
            rows={3}
            placeholder="Ej. Retirar la segunda piel el día 5. Sin piscina."
            maxLength={300}
            value={form.planNotes}
            onChange={(event) => update('planNotes', event.target.value)}
          />

          {error ? (
            <p className="rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            <UserPlus className="h-4 w-4" />
            Crear ficha e invitar
          </Button>
          <p className="text-center text-[0.68rem] leading-relaxed text-coffee-soft">
            El cliente activará su cuenta con un código de 6 dígitos. No se envía email real en
            el piloto local.
          </p>
        </form>
      )}
    </Sheet>
  )
}
