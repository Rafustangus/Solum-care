import { describe, expect, it } from 'vitest'
import { getGuideContent, getGuideOptions } from './guideContent'

const template = {
  id: 'care-humedo',
  name: 'Clima húmedo',
  studioId: 'studio-solum',
  taskIds: ['friction-check'],
  guide: {
    intro: 'Mantén la piel seca.',
    steps: [{ title: 'Secar', detail: 'Sin frotar' }],
    dos: ['Ropa holgada'],
    donts: ['Calor directo'],
    alarms: ['Hinchazón']
  }
}

describe('guías de curación', () => {
  it('resuelve la guía de una pauta del estudio', () => {
    expect(getGuideContent('care-humedo', [template])).toMatchObject({
      id: 'care-humedo',
      label: 'Clima húmedo',
      intro: 'Mantén la piel seca.'
    })
  })

  it('mantiene las guías estándar y añade la pauta asignada', () => {
    const options = getGuideOptions([template], 'care-humedo')
    expect(options).toHaveLength(4)
    expect(options[0]).toEqual({ id: 'care-humedo', label: 'Clima húmedo' })
    expect(options.map((option) => option.id)).toContain('second-skin')
    expect(getGuideOptions([template]).map((option) => option.id)).not.toContain('care-humedo')
  })
})
