import { useState } from 'react'
import { AlertTriangle, Check, ShieldCheck, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { getTechnique, TECHNIQUES } from '../../lib/healing'
import { GUIDE_CONTENT } from './guideContent'

const METHOD_ORDER = ['second-skin', 'traditional-film', 'friction-zone']

export function HealingGuide({ client }) {
  const [method, setMethod] = useState(client?.technique || 'second-skin')
  const guide = GUIDE_CONTENT[method] || GUIDE_CONTENT['second-skin']
  const technique = getTechnique(method)

  return (
    <div className="phone-scroll mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:pt-6">
      <div className="mb-4">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
          Guía de curación
        </p>
        <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
          Cuidar también es parte del tattoo.
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-coffee-soft">
          Pautas generales del método asignado. Si algo no encaja, consulta con el estudio.
        </p>
      </div>

      <div className="phone-scroll -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {METHOD_ORDER.map((id) => {
          const option = TECHNIQUES[id]
          const active = method === id
          const mine = client?.technique === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              aria-pressed={active}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                active
                  ? 'border-clay bg-clay text-cream shadow-card'
                  : 'border-coffee/12 bg-cream-soft text-coffee-soft hover:border-clay/30'
              )}
            >
              {option.label}
              {mine ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[0.54rem] uppercase tracking-[0.08em]',
                    active ? 'bg-cream/20 text-cream' : 'bg-olive/18 text-olive-deep'
                  )}
                >
                  mi plan
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <Card className="mb-3 border-olive/25 bg-olive/12 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-olive-deep" />
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-olive-deep">
            {technique.label}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-coffee">{guide.intro}</p>
      </Card>

      <Card className="mb-3 p-4">
        <h2 className="font-display text-[1.55rem] leading-none text-coffee">
          Paso a paso
        </h2>
        <ol className="mt-4 space-y-0">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
              {index < guide.steps.length - 1 ? (
                <span className="absolute left-[0.9rem] top-8 h-[calc(100%-1.4rem)] w-px bg-coffee/12" />
              ) : null}
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay/12 text-[0.68rem] font-extrabold text-clay-deep">
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold leading-snug text-coffee">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <DoDontCard
          title="Sí, hazlo"
          tone="ok"
          items={guide.dos}
          icon={Check}
        />
        <DoDontCard
          title="No lo hagas"
          tone="no"
          items={guide.donts}
          icon={X}
        />
      </div>

      <Card className="border-rust/25 bg-rust/8 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rust" />
          <h2 className="font-display text-xl leading-none text-rust">Señales de alarma</h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-coffee-soft">
          Si aparece alguna de estas señales, manda una foto y avisa al estudio.
        </p>
        <ul className="mt-3 space-y-1.5">
          {guide.alarms.map((alarm) => (
            <li key={alarm} className="flex items-start gap-2 text-sm leading-relaxed text-coffee">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
              {alarm}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-4 px-2 text-center text-[0.68rem] leading-relaxed text-coffee-soft">
        Esta guía es informativa y no sustituye las indicaciones personalizadas del estudio ni
        una valoración sanitaria.
      </p>
    </div>
  )
}

function DoDontCard({ title, items, tone, icon: Icon }) {
  const ok = tone === 'ok'
  return (
    <Card className={cn('p-4', ok ? 'border-olive/25 bg-olive/8' : 'border-clay/20 bg-clay/6')}>
      <h2
        className={cn(
          'font-display text-xl leading-none',
          ok ? 'text-olive-deep' : 'text-clay-deep'
        )}
      >
        {title}
      </h2>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-coffee">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                ok ? 'bg-olive/25 text-olive-deep' : 'bg-clay/18 text-clay-deep'
              )}
            >
              <Icon className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}
