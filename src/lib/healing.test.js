import { describe, expect, it } from 'vitest'
import {
  generateChecklist,
  getChecklistProgress,
  getClientStatus,
  getHealingDay,
  getHealingPhase,
  getLatestPhoto,
  getTechnique,
  hasPhotoForDay,
  isPhotoDue,
  isPhotoPending,
  isValidDurationDays,
  MAX_DURATION_DAYS,
  MIN_DURATION_DAYS
} from './healing'
import { addDaysISO, toISODate } from './dates'

const today = toISODate()
const photos = [
  { id: 'p1', day: 1, createdAt: '2026-11-01T10:00:00.000Z' },
  { id: 'p2', day: 3, createdAt: '2026-11-03T10:00:00.000Z' }
]

function makeClient(overrides = {}) {
  return {
    id: 'client-test',
    startDate: today,
    durationDays: 14,
    technique: 'second-skin',
    photoFrequency: 'daily',
    photos: [],
    alert: null,
    checklist: {},
    ...overrides
  }
}

describe('getHealingDay', () => {
  it('calcula el día 1 el mismo día de inicio', () => {
    const healing = getHealingDay(today, 14)
    expect(healing).toMatchObject({
      day: 1,
      total: 14,
      progress: 7,
      isBefore: false,
      isComplete: false
    })
  })

  it('marca los planes que aún no han empezado', () => {
    const healing = getHealingDay(addDaysISO(today, 2), 14)
    expect(healing.isBefore).toBe(true)
    expect(healing.day).toBe(0)
    expect(healing.progress).toBe(0)
  })

  it('cierra el plan al superar la duración', () => {
    const healing = getHealingDay(addDaysISO(today, -30), 14)
    expect(healing.day).toBe(14)
    expect(healing.progress).toBe(100)
    expect(healing.isComplete).toBe(true)
  })
})

describe('fases y checklist', () => {
  it('asigna la fase según el día', () => {
    expect(getHealingPhase(0, 14).id).toBe('waiting')
    expect(getHealingPhase(2, 14).id).toBe('inflammation')
    expect(getHealingPhase(5, 14).id).toBe('flaking')
    expect(getHealingPhase(12, 14).id).toBe('maturation')
  })

  it('incluye tareas de la técnica y de la fase', () => {
    const ids = generateChecklist('friction-zone', 5, 21).map((task) => task.id)
    expect(ids).toContain('wash')
    expect(ids).toContain('friction-loose')
    expect(ids).toContain('phase-flaking')
    expect(ids).not.toContain('phase-inflammation')
  })

  it('calcula el progreso del checklist', () => {
    const tasks = generateChecklist('second-skin', 1, 14)
    const client = makeClient({ checklist: { 1: [tasks[0].id, tasks[1].id] } })
    const progress = getChecklistProgress(client, 1, tasks)
    expect(progress.done).toBe(2)
    expect(progress.total).toBe(tasks.length)
    expect(progress.percent).toBe(Math.round((2 / tasks.length) * 100))
  })
})

describe('duración del plan', () => {
  it('acepta enteros entre 1 y 90', () => {
    expect(isValidDurationDays(MIN_DURATION_DAYS)).toBe(true)
    expect(isValidDurationDays(MAX_DURATION_DAYS)).toBe(true)
    expect(isValidDurationDays(14)).toBe(true)
  })

  it('rechaza valores fuera de rango o no enteros', () => {
    expect(isValidDurationDays(0)).toBe(false)
    expect(isValidDurationDays(91)).toBe(false)
    expect(isValidDurationDays(14.5)).toBe(false)
    expect(isValidDurationDays('abc')).toBe(false)
  })
})

describe('fotos y estado', () => {
  it('detecta fotos por día y frecuencia', () => {
    expect(hasPhotoForDay(photos, 3)).toBe(true)
    expect(hasPhotoForDay(photos, 2)).toBe(false)
    expect(isPhotoDue(makeClient(), 1)).toBe(true)
    expect(isPhotoDue(makeClient({ photoFrequency: 'every-2-days' }), 2)).toBe(false)
    expect(isPhotoDue(makeClient({ photoFrequency: 'every-2-days' }), 3)).toBe(true)
    expect(isPhotoDue(makeClient({ photoFrequency: 'on-demand' }), 3)).toBe(false)
  })

  it('marca foto pendiente solo cuando toca y no existe', () => {
    expect(isPhotoPending(makeClient(), 1)).toBe(true)
    expect(isPhotoPending(makeClient({ photos }), 1)).toBe(false)
    expect(isPhotoPending(makeClient({ photos }), 2)).toBe(true)
    expect(
      isPhotoPending(makeClient({ photos, photoFrequency: 'every-2-days' }), 2)
    ).toBe(false)
  })

  it('no marca foto pendiente en planes terminados o sin empezar', () => {
    const completed = makeClient({ startDate: addDaysISO(today, -30), durationDays: 14 })
    const upcoming = makeClient({ startDate: addDaysISO(today, 2), durationDays: 14 })
    expect(isPhotoPending(completed)).toBe(false)
    expect(isPhotoPending(upcoming)).toBe(false)
  })

  it('no bloquea con frecuencia solo cuando se solicite ni sin cliente', () => {
    const onDemand = makeClient({ photoFrequency: 'on-demand' })
    expect(isPhotoPending(onDemand, 3)).toBe(false)
    expect(isPhotoPending(null, 3)).toBe(false)
  })

  it('respeta la frecuencia cada 2 días y desbloquea con la foto del día', () => {
    const client = makeClient({ photoFrequency: 'every-2-days' })
    expect(isPhotoPending(client, 1)).toBe(true)
    expect(isPhotoPending(client, 2)).toBe(false)
    expect(isPhotoPending(client, 3)).toBe(true)
    expect(isPhotoPending(makeClient({ photos: [{ id: 'p3', day: 3, status: 'changes' }] }), 3)).toBe(false)
  })

  it('prioriza la alerta sobre la foto pendiente', () => {
    const alertClient = makeClient({
      photos,
      alert: { active: true, symptoms: ['rojo'] }
    })
    expect(getClientStatus(alertClient)).toBe('alert')
    expect(getClientStatus(makeClient())).toBe('pending')
    expect(getClientStatus(makeClient({ photos }))).toBe('ok')
  })

  it('devuelve la última foto por día', () => {
    expect(getLatestPhoto(makeClient({ photos })).id).toBe('p2')
    expect(getLatestPhoto(makeClient())).toBeNull()
  })
})

describe('getTechnique', () => {
  it('usa segunda piel como técnica por defecto', () => {
    expect(getTechnique('desconocida').id).toBe('second-skin')
    expect(getTechnique('friction-zone').label).toBe('Zonas de fricción')
  })
})
