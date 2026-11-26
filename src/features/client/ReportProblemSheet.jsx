import { useEffect, useState } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { cn } from '../../lib/cn'
import { getHealingDay } from '../../lib/healing'

const SYMPTOMS = ['rojo', 'hinchazón', 'dolor', 'pus', 'fiebre', 'mal olor']

export function ReportProblemSheet({ open, onClose, client }) {
  const { reportAlert } = useAppData()
  const { pushToast, notify } = useNotifications()
  const [selected, setSelected] = useState([])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setSelected([])
      setNote('')
      setError('')
    }
  }, [open])

  function toggleSymptom(symptom) {
    setSelected((previous) =>
      previous.includes(symptom)
        ? previous.filter((item) => item !== symptom)
        : [...previous, symptom]
    )
  }

  function handleSubmit() {
    if (!selected.length && !note.trim()) {
      setError('Marca al menos un síntoma o escribe una nota.')
      return
    }

    const day = getHealingDay(client.startDate, client.durationDays).day
    reportAlert(client.id, selected, `Día ${day}. ${note.trim()}`.trim())
    pushToast({
      title: 'Incidencia enviada',
      message: 'El estudio recibirá tu aviso y revisará la zona.',
      tone: 'warning'
    })
    notify({
      title: 'Incidencia enviada al estudio',
      body: 'El equipo revisará tu aviso y te responderá por notas.',
      tag: `solumcare-alert-${client.id}`
    })
    onClose()
  }

  const activeAlert = client?.alert?.active

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reportar una incidencia"
      description="Cuéntanos qué ves. Esto marcará una alerta visible para tu estudio."
    >
      <div className="space-y-4 pb-2">
        {activeAlert ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rust/20 bg-rust/8 p-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
            <div>
              <p className="text-xs font-bold text-rust">Ya hay una alerta activa</p>
              <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">
                Puedes ampliar la información o avisar de un cambio nuevo.
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft">
            ¿Qué observas?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SYMPTOMS.map((symptom) => {
              const active = selected.includes(symptom)
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                    active
                      ? 'border-rust/35 bg-rust/12 text-rust'
                      : 'border-coffee/15 bg-cream text-coffee-soft hover:border-clay/30'
                  )}
                >
                  {symptom}
                </button>
              )
            })}
          </div>
        </div>

        <Textarea
          label="Cuéntanos un poco más"
          rows={4}
          placeholder="Ej. Desde anoche está más rojo y caliente. No he cambiado de crema."
          maxLength={320}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        {error ? (
          <p className="rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
        ) : null}

        <div className="rounded-2xl bg-cream-deep/70 p-3 text-[0.7rem] leading-relaxed text-coffee-soft">
          Si tienes fiebre, el dolor aumenta rápido o ves pus, contacta también con el estudio
          por WhatsApp. Esta app no sustituye una valoración sanitaria.
        </div>

        <Button variant="danger" size="lg" className="w-full" onClick={handleSubmit}>
          <Send className="h-4 w-4" />
          Enviar incidencia
        </Button>
      </div>
    </Sheet>
  )
}
