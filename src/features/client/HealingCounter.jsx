import { memo } from 'react'
import { CalendarDays, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { formatLongDate } from '../../lib/dates'
import { getHealingPhase, getTechnique } from '../../lib/healing'

export const HealingCounter = memo(
  function HealingCounter({ client, healing, plan }) {
  const techniqueLabel = plan?.label || getTechnique(client.technique).label
  const phase = getHealingPhase(healing.day, healing.total)

  return (
    <Card className="relative overflow-hidden border-olive/25 bg-olive/14 p-4">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cream/35 blur-xl" />
      <div className="relative flex items-center gap-4">
        <ProgressRing
          value={healing.progress}
          size={112}
          stroke={9}
          trackClassName="text-cream/60"
          progressClassName="text-clay"
        >
          <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-olive-deep">
            {healing.isComplete ? 'Completado' : healing.isBefore ? 'Empieza' : 'Día'}
          </span>
          <span className="font-display text-[2.25rem] leading-none text-coffee">
            {healing.isBefore ? healing.total : healing.day}
          </span>
          <span className="mt-0.5 text-[0.62rem] font-bold text-coffee-soft">
            de {healing.total}
          </span>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-clay-deep">
            {healing.isComplete ? 'Curación finalizada' : 'En curación'}
          </p>
          <h2 className="mt-1 font-display text-[1.65rem] leading-[1.05] tracking-[-0.03em] text-coffee">
            {healing.isBefore ? 'Prepárate para empezar' : `Fase de ${phase.label.toLowerCase()}`}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-cream/55 px-2.5 py-1 text-[0.64rem] font-bold text-coffee">
              <Sparkles className="h-3 w-3 text-clay" />
              {techniqueLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cream/55 px-2.5 py-1 text-[0.64rem] font-bold text-coffee">
              <CalendarDays className="h-3 w-3 text-olive-deep" />
              {formatLongDate(client.startDate)}
            </span>
          </div>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-coffee-soft">
            {client.tattooZone}
          </p>
        </div>
      </div>
    </Card>
  )
  },
  (previous, next) =>
    previous.client.startDate === next.client.startDate &&
    previous.client.technique === next.client.technique &&
    previous.plan?.label === next.plan?.label &&
    previous.client.tattooZone === next.client.tattooZone &&
    previous.client.durationDays === next.client.durationDays &&
    previous.healing.day === next.healing.day &&
    previous.healing.total === next.healing.total &&
    previous.healing.progress === next.healing.progress &&
    previous.healing.isComplete === next.healing.isComplete &&
    previous.healing.isBefore === next.healing.isBefore
)
