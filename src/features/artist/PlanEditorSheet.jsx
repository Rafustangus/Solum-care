import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Sheet } from '../../components/ui/Sheet'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import {
  isValidDurationDays,
  MAX_DURATION_DAYS,
  MIN_DURATION_DAYS,
  PHOTO_FREQUENCIES,
  TECHNIQUES
} from '../../lib/healing'

const FREQUENCY_OPTIONS = Object.values(PHOTO_FREQUENCIES).map((frequency) => ({
  value: frequency.id,
  label: frequency.label
}))

export function PlanEditorSheet({ open, onClose, client }) {
  const { updatePlan, listCareTemplates } = useAppData()
  const { pushToast, notify } = useNotifications()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && client) {
      setForm({
        technique: client.technique,
        startDate: client.startDate,
        durationDays: String(client.durationDays),
        photoFrequency: client.photoFrequency,
        tattooZone: client.tattooZone || '',
        phone: client.phone || '',
        planNotes: client.planNotes || ''
      })
      setError('')
    }
  }, [open, client])

  if (!client || !form) return null

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const techniqueOptions = [
    ...Object.values(TECHNIQUES).map((technique) => ({
      value: technique.id,
      label: `Estándar · ${technique.label}`
    })),
    ...listCareTemplates().map((template) => ({
      value: template.id,
      label: `Del estudio · ${template.name}`
    }))
  ]

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!isValidDurationDays(form.durationDays)) {
      setError(
        `La duración debe ser un número entero entre ${MIN_DURATION_DAYS} y ${MAX_DURATION_DAYS} días.`
      )
      return
    }

    try {
      updatePlan(client.id, {
        technique: form.technique,
        startDate: form.startDate,
        durationDays: Number(form.durationDays),
        photoFrequency: form.photoFrequency,
        tattooZone: form.tattooZone.trim(),
        phone: form.phone.trim(),
        planNotes: form.planNotes.trim()
      })
    } catch (error) {
      setError(error.message)
      return
    }
    pushToast({
      title: 'Plan actualizado',
      message: `${client.name.split(' ')[0]} recibirá el aviso del cambio.`,
      tone: 'success'
    })
    notify({
      title: 'Plan de curación actualizado',
      body: `${client.name.split(' ')[0]} tiene una nueva pauta de seguimiento.`,
      tag: `solumcare-plan-${client.id}`
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Editar plan"
      description={`Ajusta la pauta de ${client.name}. El cliente verá el cambio reflejado al instante.`}
    >
      <form onSubmit={handleSubmit} className="space-y-3 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Zona"
            placeholder="Antebrazo"
            value={form.tattooZone}
            onChange={(event) => update('tattooZone', event.target.value)}
          />
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+34 600 000 000"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
          />
        </div>

        <Select
          label="Pauta de curación"
          value={form.technique}
          onChange={(event) => update('technique', event.target.value)}
          options={techniqueOptions}
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
          label="Indicaciones"
          rows={4}
          maxLength={300}
          placeholder="Ej. Retirar la segunda piel el día 5. Sin piscina."
          value={form.planNotes}
          onChange={(event) => update('planNotes', event.target.value)}
        />

        {error ? (
          <p className="rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full">
          <Save className="h-4 w-4" />
          Guardar plan
        </Button>
      </form>
    </Sheet>
  )
}
