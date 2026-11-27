import { parseISODate, startOfDay } from './dates'

export const TECHNIQUES = {
  'second-skin': {
    id: 'second-skin',
    label: 'Segunda piel',
    short: 'Segunda piel',
    description: 'Film transparente adhesivo de varios días.',
    icon: 'shield'
  },
  'traditional-film': {
    id: 'traditional-film',
    label: 'Film tradicional',
    short: 'Film',
    description: 'Película protectora tradicional con cambios periódicos.',
    icon: 'layers'
  },
  'friction-zone': {
    id: 'friction-zone',
    label: 'Zonas de fricción',
    short: 'Fricción',
    description: 'Cuidado reforzado en zonas de roce o pliegues.',
    icon: 'wind'
  }
}

export const PHOTO_FREQUENCIES = {
  daily: { id: 'daily', label: 'Todos los días', interval: 1 },
  'every-2-days': { id: 'every-2-days', label: 'Cada 2 días', interval: 2 },
  'every-3-days': { id: 'every-3-days', label: 'Cada 3 días', interval: 3 },
  'on-demand': { id: 'on-demand', label: 'Solo cuando se solicite', interval: null }
}

export const MIN_DURATION_DAYS = 1
export const MAX_DURATION_DAYS = 90

export function isValidDurationDays(value) {
  const days = Number(value)
  return (
    Number.isInteger(days) &&
    days >= MIN_DURATION_DAYS &&
    days <= MAX_DURATION_DAYS
  )
}

export const CLIENT_STATUS_META = {
  ok: {
    id: 'ok',
    label: 'Al día',
    dot: 'bg-olive',
    soft: 'bg-olive/15 text-olive-deep',
    border: 'border-olive/30'
  },
  pending: {
    id: 'pending',
    label: 'Foto pendiente',
    dot: 'bg-clay',
    soft: 'bg-clay/12 text-clay-deep',
    border: 'border-clay/30'
  },
  alert: {
    id: 'alert',
    label: 'Alerta',
    dot: 'bg-rust',
    soft: 'bg-rust/10 text-rust',
    border: 'border-rust/30'
  }
}

const BASE_TASKS = [
  {
    id: 'wash',
    label: 'Lavar con jabón neutro',
    detail: 'Agua tibia, sin frotar ni usar esponja.'
  },
  {
    id: 'dry',
    label: 'Secar con papel limpio',
    detail: 'Toques suaves, sin compartir toalla.'
  },
  {
    id: 'cream',
    label: 'Aplicar la crema indicada',
    detail: 'Capa fina sobre la zona, sin excederte.'
  },
  {
    id: 'sun',
    label: 'Evitar sol y calor directo',
    detail: 'Nada de sauna, playa ni exposición directa.'
  },
  {
    id: 'scratch',
    label: 'No rascar ni arrancar costras',
    detail: 'La picazón es parte del proceso.'
  }
]

const TECHNIQUE_TASKS = {
  'second-skin': [
    {
      id: 'second-skin-edges',
      label: 'Revisar los bordes del film',
      detail: 'Si se despega o acumula líquido, avisa al estudio.'
    },
    {
      id: 'second-skin-water',
      label: 'Evitar remojar la segunda piel',
      detail: 'Ducha rápida; no piscina ni bañera.'
    }
  ],
  'traditional-film': [
    {
      id: 'film-change',
      label: 'Cambiar el film si toca hoy',
      detail: 'Sigue las indicaciones del tatuador y lávalo antes.'
    },
    {
      id: 'film-air',
      label: 'Dejar respirar la zona',
      detail: 'Sin film cuando el estudio lo haya indicado.'
    }
  ],
  'friction-zone': [
    {
      id: 'friction-loose',
      label: 'Usar ropa holgada',
      detail: 'Evita costuras, gomas y tejidos que rocen.'
    },
    {
      id: 'friction-check',
      label: 'Revisar roces y humedad',
      detail: 'Seca bien los pliegues y cambia la ropa si se humedece.'
    }
  ]
}

const PHASE_TASKS = [
  {
    id: 'phase-inflammation',
    label: 'Controlar hinchazón y calor',
    detail: 'Mantén la zona limpia y en reposo. Si empeora, avisa.',
    when: (day) => day <= 3
  },
  {
    id: 'phase-flaking',
    label: 'Hidratar sin exceso',
    detail: 'La descamación empieza a notarse. No tires de la piel.',
    when: (day, total) => day > 3 && day <= Math.ceil(total * 0.55)
  },
  {
    id: 'phase-maturity',
    label: 'Proteger la piel madura',
    detail: 'Usa protección solar cuando el estudio lo autorice.',
    when: (day, total) => day > Math.ceil(total * 0.55)
  }
]

const PHOTO_TASK = {
  id: 'check-photo',
  label: 'Revisar el aspecto con buena luz',
  detail: 'Si ves rojo intenso, pus o hinchazón, repórtalo.'
}

export const TEMPLATE_TASKS = [
  ...Object.values(TECHNIQUE_TASKS).flat(),
  ...PHASE_TASKS.map(({ id, label, detail }) => ({ id, label, detail })),
  PHOTO_TASK
]

const TEMPLATE_TASK_BY_ID = new Map(TEMPLATE_TASKS.map((task) => [task.id, task]))

export function getCarePlan(techniqueId, templates = []) {
  const template = templates.find((item) => item.id === techniqueId)
  if (template) {
    return {
      id: template.id,
      label: template.name,
      taskIds: (template.taskIds || []).filter((id) => TEMPLATE_TASK_BY_ID.has(id)),
      isCustom: true
    }
  }

  const id = TECHNIQUES[techniqueId] ? techniqueId : 'second-skin'
  return {
    id,
    label: TECHNIQUES[id].label,
    taskIds: (TECHNIQUE_TASKS[id] || []).map((task) => task.id),
    isCustom: false
  }
}

export function getTechnique(id) {
  return TECHNIQUES[id] || TECHNIQUES['second-skin']
}

export function getFrequency(id) {
  return PHOTO_FREQUENCIES[id] || PHOTO_FREQUENCIES.daily
}

export function getHealingDay(startDate, durationDays, referenceDate = new Date()) {
  const total = Math.max(1, Number(durationDays) || 1)
  const start = startOfDay(parseISODate(startDate))
  const ref = startOfDay(referenceDate)
  const raw = Math.floor((ref.getTime() - start.getTime()) / 86400000) + 1

  if (raw < 1) {
    return {
      day: 0,
      elapsed: 0,
      total,
      progress: 0,
      isBefore: true,
      isComplete: false
    }
  }

  if (raw > total) {
    return {
      day: total,
      elapsed: total,
      total,
      progress: 100,
      isBefore: false,
      isComplete: true
    }
  }

  return {
    day: raw,
    elapsed: raw,
    total,
    progress: Math.max(1, Math.round((raw / total) * 100)),
    isBefore: false,
    isComplete: false
  }
}

export function getHealingPhase(day, total) {
  if (day <= 0) return { id: 'waiting', label: 'Aún no comienza' }
  if (day <= 3) return { id: 'inflammation', label: 'Inflamación' }
  if (day <= Math.ceil(total * 0.55)) return { id: 'flaking', label: 'Descamación' }
  return { id: 'maturation', label: 'Maduración' }
}

export function generateChecklist(planOrTechniqueId, day, total) {
  const plan =
    typeof planOrTechniqueId === 'string' || !planOrTechniqueId
      ? getCarePlan(planOrTechniqueId)
      : planOrTechniqueId
  const tasks = [...BASE_TASKS]
  const seen = new Set(tasks.map((task) => task.id))

  function addTask(task) {
    if (!task || seen.has(task.id)) return
    tasks.push(task)
    seen.add(task.id)
  }

  ;(plan.taskIds || []).forEach((id) => addTask(TEMPLATE_TASK_BY_ID.get(id)))

  if (!plan.isCustom) {
    const phaseTask = PHASE_TASKS.find((task) => task.when(day, total))
    if (phaseTask) {
      addTask({
        id: phaseTask.id,
        label: phaseTask.label,
        detail: phaseTask.detail
      })
    }

    if (day >= 4) addTask(PHOTO_TASK)
  }

  return tasks
}

export function hasPhotoForDay(photos = [], day) {
  return photos.some((photo) => Number(photo.day) === Number(day))
}

export function isPhotoDue(client, day) {
  const frequency = getFrequency(client?.photoFrequency)
  if (!frequency.interval || day < 1) return false
  return (day - 1) % frequency.interval === 0
}

export function isPhotoPending(client, day = null) {
  if (!client) return false
  const healing = getHealingDay(client.startDate, client.durationDays)
  const currentDay = day ?? healing.day
  if (currentDay < 1 || healing.isBefore || healing.isComplete) return false
  return isPhotoDue(client, currentDay) && !hasPhotoForDay(client.photos, currentDay)
}

export function getClientStatus(client, referenceDate = new Date()) {
  if (client?.alert?.active) return 'alert'
  const healing = getHealingDay(client.startDate, client.durationDays, referenceDate)
  if (isPhotoPending(client, healing.day)) return 'pending'
  return 'ok'
}

export function getChecklistProgress(client, day, tasks) {
  const completed = new Set((client?.checklist?.[String(day)] || []).map(String))
  const done = tasks.filter((task) => completed.has(task.id)).length
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0
  }
}

export function getLatestPhoto(client) {
  if (!client?.photos?.length) return null
  return [...client.photos].sort((a, b) => {
    if (a.day !== b.day) return b.day - a.day
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })[0]
}
