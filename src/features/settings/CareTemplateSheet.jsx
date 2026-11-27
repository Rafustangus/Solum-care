import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { CARE_GUIDE_LIMITS } from '../../lib/careTemplates'
import { TEMPLATE_TASKS } from '../../lib/healing'

const EMPTY_FORM = {
  name: '',
  taskIds: [],
  intro: '',
  steps: '',
  dos: '',
  donts: '',
  alarms: ''
}

function linesFrom(value) {
  if (Array.isArray(value)) return value.join('\n')
  return String(value || '')
}

function stepsFrom(value) {
  if (Array.isArray(value)) {
    return value.map((step) => `${step.title || ''}|${step.detail || ''}`).join('\n')
  }
  return String(value || '')
}

export function CareTemplateSheet({ open, onClose, template = null }) {
  const { createCareTemplate, updateCareTemplate } = useAppData()
  const { pushToast } = useNotifications()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (template) {
      setForm({
        name: template.name || '',
        taskIds: template.taskIds || [],
        intro: template.guide?.intro || '',
        steps: stepsFrom(template.guide?.steps),
        dos: linesFrom(template.guide?.dos),
        donts: linesFrom(template.guide?.donts),
        alarms: linesFrom(template.guide?.alarms)
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [open, template])

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function toggleTask(taskId) {
    setForm((previous) => ({
      ...previous,
      taskIds: previous.taskIds.includes(taskId)
        ? previous.taskIds.filter((id) => id !== taskId)
        : [...previous.taskIds, taskId].slice(0, CARE_GUIDE_LIMITS.tasks)
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const input = {
      name: form.name,
      taskIds: form.taskIds,
      guide: {
        intro: form.intro,
        steps: form.steps,
        dos: form.dos,
        donts: form.donts,
        alarms: form.alarms
      }
    }

    try {
      if (template) updateCareTemplate(template.id, input)
      else createCareTemplate(input)
      pushToast({
        title: template ? 'Pauta actualizada' : 'Pauta creada',
        message: template
          ? 'Los clientes con esta pauta verán los cambios al instante.'
          : 'Ya puedes asignarla desde el plan de cada cliente.',
        tone: 'success'
      })
      onClose()
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={template ? 'Editar pauta de curación' : 'Nueva pauta de curación'}
      description="Define las tareas y la guía que verán los clientes con esta pauta."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-2">
        <Input
          label="Nombre de la pauta"
          placeholder="Curación en clima húmedo"
          maxLength={CARE_GUIDE_LIMITS.name}
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          error={error && error.includes('nombre') ? error : ''}
        />

        <fieldset className="space-y-2">
          <legend className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coffee-soft">
            Tareas de la pauta
          </legend>
          <p className="text-xs leading-relaxed text-coffee-soft">
            Las tareas base de higiene siempre se incluyen. Máximo {CARE_GUIDE_LIMITS.tasks}.
          </p>
          <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-2xl border border-coffee/10 bg-cream px-3 py-2">
            {TEMPLATE_TASKS.map((task) => {
              const checked = form.taskIds.includes(task.id)
              const disabled = !checked && form.taskIds.length >= CARE_GUIDE_LIMITS.tasks
              return (
                <label
                  key={task.id}
                  className={`flex items-start gap-2 rounded-xl px-1.5 py-1 text-xs leading-snug ${
                    disabled ? 'opacity-50' : 'hover:bg-cream-deep'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-clay"
                  />
                  <span>
                    <span className="block font-bold text-coffee">{task.label}</span>
                    <span className="block text-coffee-soft">{task.detail}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {error && error.includes('tarea') ? (
            <p className="text-xs font-medium text-rust">{error}</p>
          ) : null}
        </fieldset>

        <Textarea
          label="Introducción"
          rows={3}
          maxLength={CARE_GUIDE_LIMITS.intro}
          placeholder="Explica el objetivo de esta pauta durante los primeros días."
          value={form.intro}
          onChange={(event) => update('intro', event.target.value)}
        />

        <Textarea
          label="Pasos"
          rows={5}
          placeholder={'Título | Detalle\nOtro paso | Detalle'}
          hint="Un paso por línea. Separa título y detalle con |."
          value={form.steps}
          onChange={(event) => update('steps', event.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Textarea
            label="Sí, hazlo"
            rows={4}
            placeholder={'Una acción por línea'}
            value={form.dos}
            onChange={(event) => update('dos', event.target.value)}
          />
          <Textarea
            label="No lo hagas"
            rows={4}
            placeholder={'Una acción por línea'}
            value={form.donts}
            onChange={(event) => update('donts', event.target.value)}
          />
        </div>

        <Textarea
          label="Señales de alarma"
          rows={4}
          placeholder={'Una señal por línea'}
          value={form.alarms}
          onChange={(event) => update('alarms', event.target.value)}
        />

        {error && !error.includes('nombre') && !error.includes('tarea') ? (
          <p className="text-xs font-medium text-rust">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="cream" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
