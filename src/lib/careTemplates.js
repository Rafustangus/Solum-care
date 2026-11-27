import { generateUuid } from './crypto'
import { TEMPLATE_TASKS } from './healing'

export const CARE_GUIDE_LIMITS = {
  name: 60,
  intro: 400,
  stepTitle: 80,
  stepDetail: 400,
  line: 240,
  steps: 12,
  lines: 12,
  tasks: 12
}

function text(value, limit) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, limit)
}

function lines(value, limit = CARE_GUIDE_LIMITS.lines) {
  return String(value ?? '')
    .split('\n')
    .map((line) => text(line, CARE_GUIDE_LIMITS.line))
    .filter(Boolean)
    .slice(0, limit)
}

function steps(value) {
  return String(value ?? '')
    .split('\n')
    .slice(0, CARE_GUIDE_LIMITS.steps)
    .map((line) => {
      const [title, ...rest] = line.split('|')
      return {
        title: text(title, CARE_GUIDE_LIMITS.stepTitle),
        detail: text(rest.join('|'), CARE_GUIDE_LIMITS.stepDetail)
      }
    })
    .filter((step) => step.title || step.detail)
}

export function createCareTemplateId() {
  return `care-${generateUuid()}`
}

export function normalizeCareTemplateInput(input = {}) {
  const guide = input.guide || input
  const taskIds = Array.isArray(input.taskIds)
    ? [...new Set(input.taskIds.map((id) => String(id)))].filter((id) =>
        TEMPLATE_TASKS.some((task) => task.id === id)
      )
    : []

  return {
    name: text(input.name, CARE_GUIDE_LIMITS.name),
    taskIds: taskIds.slice(0, CARE_GUIDE_LIMITS.tasks),
    guide: {
      intro: text(guide.intro, CARE_GUIDE_LIMITS.intro),
      steps: Array.isArray(guide.steps)
        ? steps(guide.steps.map(stepToLine))
        : steps(guide.steps ?? guide.stepsText),
      dos: Array.isArray(guide.dos) ? lines(guide.dos.join('\n')) : lines(guide.dos ?? guide.dosText),
      donts: Array.isArray(guide.donts)
        ? lines(guide.donts.join('\n'))
        : lines(guide.donts ?? guide.dontsText),
      alarms: Array.isArray(guide.alarms)
        ? lines(guide.alarms.join('\n'))
        : lines(guide.alarms ?? guide.alarmsText)
    }
  }
}

function stepToLine(step) {
  if (!step || typeof step !== 'object') return ''
  return `${step.title || ''}|${step.detail || ''}`
}

export function validateCareTemplateInput(input = {}, { templates = [], studioId, templateId } = {}) {
  const value = normalizeCareTemplateInput(input)

  if (!studioId) return 'Falta el estudio para guardar la pauta.'
  if (value.name.length < 3) return 'Escribe un nombre de al menos 3 caracteres.'
  if (!value.taskIds.length) return 'Selecciona al menos una tarea para la pauta.'
  if (!value.guide.intro) return 'Añade una introducción para la guía.'
  if (!value.guide.steps.length) return 'Añade al menos un paso de la guía.'
  if (
    templates.some(
      (template) =>
        template.studioId === studioId &&
        template.id !== templateId &&
        template.name.trim().toLowerCase() === value.name.toLowerCase()
    )
  ) {
    return 'Ya existe una pauta del estudio con ese nombre.'
  }

  return ''
}

export function listStudioCareTemplates(templates = [], studioId) {
  if (!studioId) return []
  return templates.filter((template) => template.studioId === studioId)
}

export function isCareTemplateAllowed(techniqueId, templates = [], studioId) {
  if (!techniqueId) return false
  if (!String(techniqueId).startsWith('care-')) return true
  return listStudioCareTemplates(templates, studioId).some((template) => template.id === techniqueId)
}
