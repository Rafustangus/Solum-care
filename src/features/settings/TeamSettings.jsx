import { UserPlus } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { getStoredUsers } from '../../services/auth'

function loadTeam(studioId) {
  return getStoredUsers()
    .filter((user) => user.role === 'artist' && user.studioId === studioId)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1
      return a.name.localeCompare(b.name, 'es')
    })
}

export function TeamSettings() {
  const { user } = useAuth()
  const team = loadTeam(user?.studioId)

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-olive-deep" />
        <h3 className="font-display text-xl leading-none text-coffee">Equipo</h3>
      </div>

      <ul className="space-y-1.5">
        {team.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-2.5 rounded-2xl border border-coffee/8 bg-cream/65 p-2.5"
          >
            <Avatar name={member.name} tone="clay" size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-coffee">{member.name}</p>
                {member.id === user?.id ? (
                  <Badge tone="clay" className="px-1.5 py-0.5 text-[0.52rem]">
                    tú
                  </Badge>
                ) : null}
              </div>
              <p className="truncate text-[0.68rem] text-coffee-soft">
                {member.specialty || member.email}
              </p>
            </div>
            <Badge
              tone={member.status === 'active' ? 'ok' : 'pending'}
              className="px-2 py-0.5 text-[0.54rem]"
            >
              {member.status === 'active' ? 'activo' : 'invitado'}
            </Badge>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-[0.66rem] leading-relaxed text-coffee-soft">
        Las cuentas de tatuador se crean desde administración. Esta lista es solo informativa.
      </p>
    </Card>
  )
}
