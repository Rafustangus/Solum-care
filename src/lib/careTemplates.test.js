import { describe, expect, it } from 'vitest'
import {
  createCareTemplateId,
  isCareTemplateAllowed,
  listStudioCareTemplates,
  normalizeCareTemplateInput,
  validateCareTemplateInput
} from './careTemplates'

const input = {
  name: '  Curación en clima húmedo  ',
  taskIds: ['friction-check', 'friction-check', 'no-existe'],
  guide: {
    intro: '  Mantén la zona seca.  ',
    steps: 'Secar bien|Sin frotar\nRopa holgada|Evita costuras',
    dos: 'Secar tras la ducha\nCambiar la ropa',
    donts: 'No usar calor',
    alarms: 'Hinchazón\n\nPus'
  }
}

describe('careTemplates', () => {
  it('normaliza nombre, tareas y guía', () => {
    expect(normalizeCareTemplateInput(input)).toEqual({
      name: 'Curación en clima húmedo',
      taskIds: ['friction-check'],
      guide: {
        intro: 'Mantén la zona seca.',
        steps: [
          { title: 'Secar bien', detail: 'Sin frotar' },
          { title: 'Ropa holgada', detail: 'Evita costuras' }
        ],
        dos: ['Secar tras la ducha', 'Cambiar la ropa'],
        donts: ['No usar calor'],
        alarms: ['Hinchazón', 'Pus']
      }
    })
  })

  it('genera ids de pauta del estudio', () => {
    expect(createCareTemplateId()).toMatch(/^care-/)
  })

  it('rechaza datos incompletos y nombres duplicados', () => {
    const error = validateCareTemplateInput(
      { name: 'Húmeda', taskIds: [], guide: { intro: '', steps: '' } },
      { studioId: 'studio-solum' }
    )
    expect(error).toContain('tarea')

    const templates = [
      {
        id: 'care-1',
        studioId: 'studio-solum',
        name: 'Húmeda',
        taskIds: ['friction-check'],
        guide: { intro: 'A', steps: [{ title: 'B', detail: 'C' }] }
      }
    ]
    expect(
      validateCareTemplateInput(
        { name: ' húmeda ', taskIds: ['friction-check'], guide: { intro: 'A', steps: 'B|C' } },
        { templates, studioId: 'studio-solum' }
      )
    ).toContain('Ya existe')
  })

  it('filtra plantillas por estudio y valida su asignación', () => {
    const templates = [
      { id: 'care-mia', studioId: 'studio-solum', name: 'Mía' },
      { id: 'care-ajena', studioId: 'studio-otro', name: 'Ajena' }
    ]

    expect(listStudioCareTemplates(templates, 'studio-solum')).toHaveLength(1)
    expect(isCareTemplateAllowed('care-mia', templates, 'studio-solum')).toBe(true)
    expect(isCareTemplateAllowed('care-ajena', templates, 'studio-solum')).toBe(false)
    expect(isCareTemplateAllowed('second-skin', templates, 'studio-solum')).toBe(true)
  })
})
