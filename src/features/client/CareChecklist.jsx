import { memo } from 'react'
import { Check, LockKeyhole } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { getChecklistProgress } from '../../lib/healing'
import { cn } from '../../lib/cn'

export const CareChecklist = memo(function CareChecklist({
  tasks,
  completed = [],
  onToggle,
  day,
  readOnly = false
}) {
  const completedSet = new Set(completed)
  const progress = getChecklistProgress(
    { checklist: { [String(day)]: completed } },
    day,
    tasks
  )

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-clay">
            Cuidados del día {day}
          </p>
          <h3 className="mt-0.5 font-display text-[1.5rem] leading-none text-coffee">
            {progress.done === progress.total && progress.total > 0
              ? 'Día completado'
              : 'Checklist diario'}
          </h3>
        </div>
        <span className="rounded-full bg-coffee/6 px-2.5 py-1 text-[0.68rem] font-bold text-coffee-soft">
          {progress.done}/{progress.total}
        </span>
      </div>

      <ProgressBar
        value={progress.percent}
        className="mb-3"
        barClassName={progress.percent === 100 ? 'bg-olive' : 'bg-clay'}
      />

      {readOnly ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-olive/10 px-3 py-2 text-[0.68rem] font-semibold text-olive-deep">
          <LockKeyhole className="h-3.5 w-3.5" />
          Estás revisando un día pasado. Solo puedes editar el día actual.
        </div>
      ) : null}

      <ul className="space-y-1.5">
        {tasks.map((task) => {
          const checked = completedSet.has(task.id)
          return (
            <li key={task.id}>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onToggle(task.id)}
                aria-pressed={checked}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                  readOnly ? 'cursor-default opacity-80' : 'hover:bg-cream-deep/50 active:bg-cream-deep',
                  checked && 'bg-olive/8'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    checked
                      ? 'border-olive bg-olive text-cream animate-pop'
                      : 'border-coffee/20 bg-cream text-transparent'
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm font-semibold leading-snug text-coffee transition-all',
                      checked && 'text-coffee-soft line-through decoration-coffee/30'
                    )}
                  >
                    {task.label}
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] leading-relaxed text-coffee-soft">
                    {task.detail}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
})
