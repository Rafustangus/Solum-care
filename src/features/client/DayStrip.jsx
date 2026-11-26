import { memo } from 'react'
import { addDaysISO, weekdayShort } from '../../lib/dates'
import { hasPhotoForDay, isPhotoDue } from '../../lib/healing'
import { cn } from '../../lib/cn'

export const DayStrip = memo(
  function DayStrip({ client, currentDay, selectedDay, onSelect }) {
  const visibleDays = 7
  const startDay = Math.max(1, currentDay - visibleDays + 1)
  const days = []
  for (let day = startDay; day <= Math.max(startDay, currentDay); day += 1) {
    days.push(day)
  }

  if (!days.length) {
    days.push(1)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-coffee-soft">
          Revisar días
        </p>
        <p className="text-[0.66rem] font-semibold text-coffee-soft">
          Día actual: {currentDay}
        </p>
      </div>

      <div className="phone-scroll flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const date = addDaysISO(client.startDate, day - 1)
          const photo = hasPhotoForDay(client.photos, day)
          const due = isPhotoDue(client, day)
          const selected = selectedDay === day
          const isCurrent = day === currentDay

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(day)}
              aria-label={`Ver día ${day}${isCurrent ? ', hoy' : ''}`}
              aria-pressed={selected}
              className={cn(
                'relative flex w-[3.35rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-2 py-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                selected
                  ? 'border-clay bg-clay text-cream shadow-card'
                  : 'border-coffee/10 bg-cream-soft text-coffee hover:border-clay/30'
              )}
            >
              <span
                className={cn(
                  'text-[0.58rem] font-bold uppercase',
                  selected ? 'text-cream/70' : 'text-coffee-soft'
                )}
              >
                {isCurrent ? 'hoy' : weekdayShort(date)}
              </span>
              <span className="font-display text-xl leading-none">{day}</span>
              <span
                className={cn(
                  'mt-0.5 h-1.5 w-1.5 rounded-full',
                  photo
                    ? selected
                      ? 'bg-cream'
                      : 'bg-olive'
                    : due
                      ? selected
                        ? 'bg-cream/60'
                        : 'bg-clay'
                      : 'bg-transparent'
                )}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
  },
  (previous, next) =>
    previous.client.startDate === next.client.startDate &&
    previous.client.photos === next.client.photos &&
    previous.client.photoFrequency === next.client.photoFrequency &&
    previous.currentDay === next.currentDay &&
    previous.selectedDay === next.selectedDay &&
    previous.onSelect === next.onSelect
)
