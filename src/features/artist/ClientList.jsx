import { useMemo, useState } from 'react'
import { ChevronRight, Plus, Search, Users } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PhotoImage } from '../../components/ui/PhotoImage'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAppData } from '../../context/AppDataContext'
import {
  CLIENT_STATUS_META,
  getCarePlan,
  getClientStatus,
  getHealingDay,
  getLatestPhoto
} from '../../lib/healing'
import { cn } from '../../lib/cn'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'alert', label: 'Alertas' }
]

const STATUS_WEIGHT = { alert: 0, pending: 1, ok: 2 }

export function ClientList({ clients, onSelect, onNewClient, selectedClientId = null }) {
  const { careTemplates } = useAppData()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const rows = useMemo(() => {
    return clients
      .map((client) => ({
        client,
        plan: getCarePlan(client.technique, careTemplates),
        healing: getHealingDay(client.startDate, client.durationDays),
        status: getClientStatus(client),
        photo: getLatestPhoto(client)
      }))
      .filter(({ client, status }) => {
        if (filter === 'pending' && status !== 'pending') return false
        if (filter === 'alert' && status !== 'alert') return false
        const term = query.trim().toLowerCase()
        if (!term) return true
        return [client.name, client.email, client.tattooZone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      })
      .sort((a, b) => {
        const weight = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]
        if (weight !== 0) return weight
        return a.client.name.localeCompare(b.client.name, 'es')
      })
  }, [clients, careTemplates, filter, query])

  const counts = useMemo(
    () => ({
      all: clients.length,
      pending: clients.filter((client) => getClientStatus(client) === 'pending').length,
      alert: clients.filter((client) => getClientStatus(client) === 'alert').length
    }),
    [clients]
  )

  return (
    <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
            Panel del estudio
          </p>
          <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
            Clientes
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-coffee-soft">
            {counts.all} fichas activas · {counts.pending + counts.alert} necesitan atención.
          </p>
        </div>
        <Button size="sm" onClick={onNewClient} className="mt-1">
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre, email o zona"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        className="mb-3"
      />

      <div className="mb-3 flex gap-1.5">
        {FILTERS.map((item) => {
          const active = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                active
                  ? 'border-clay bg-clay text-cream shadow-card'
                  : 'border-coffee/12 bg-cream-soft text-coffee-soft hover:border-clay/30'
              )}
            >
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.58rem]',
                  active ? 'bg-cream/20 text-cream' : 'bg-coffee/8 text-coffee-soft'
                )}
              >
                {counts[item.id]}
              </span>
            </button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={clients.length ? 'Sin resultados' : 'Tu primera ficha'}
            description={
              clients.length
                ? 'Prueba con otro nombre, email o filtro.'
                : 'Crea un cliente, define su plan y comparte el código de invitación.'
            }
            action={
              !clients.length ? (
                <Button onClick={onNewClient}>
                  <Plus className="h-4 w-4" />
                  Nueva ficha
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ client, plan, healing, status, photo }) => {
            const meta = CLIENT_STATUS_META[status]
            return (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => onSelect(client.id)}
                  aria-current={selectedClientId === client.id ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[1.55rem] border p-3 text-left shadow-card transition hover:border-clay/30 hover:bg-cream-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay',
                    selectedClientId === client.id
                      ? 'border-clay/35 bg-cream-soft'
                      : 'border-coffee/10 bg-cream-soft/85'
                  )}
                >
                  <PhotoImage
                    photo={photo}
                    alt={`Última foto de ${client.name}`}
                    className="h-14 w-14 shrink-0 rounded-2xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-coffee">{client.name}</p>
                      <Badge tone={meta.id} dot className="shrink-0 px-2 py-0.5 text-[0.56rem]">
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-coffee-soft">
                      {client.tattooZone || 'Sin zona'} · {plan.label}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar
                        value={healing.progress}
                        className="h-1.5 flex-1"
                        barClassName={meta.id === 'alert' ? 'bg-rust' : 'bg-clay'}
                      />
                      <span className="shrink-0 text-[0.62rem] font-bold text-coffee-soft">
                        Día {healing.day}/{healing.total}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-coffee-soft/60" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
