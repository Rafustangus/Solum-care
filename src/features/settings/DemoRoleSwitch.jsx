import { useState } from 'react'
import { ArrowLeftRight, FlaskConical } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { DEMO_ACCOUNTS, isDemoMode } from '../../lib/demo'

export function DemoRoleSwitch() {
  const { user, login } = useAuth()
  const { pushToast } = useNotifications()
  const [switching, setSwitching] = useState(false)

  if (!isDemoMode || !user) return null

  const targetRole = user.role === 'artist' ? 'client' : 'artist'
  const target = DEMO_ACCOUNTS[targetRole]
  const targetLabel = targetRole === 'artist' ? 'estudio' : 'cliente'

  async function handleSwitch() {
    setSwitching(true)
    try {
      await login(target.email, target.password, true)
      pushToast({
        title: `Vista ${targetLabel}`,
        message: `Has cambiado a la cuenta demo de ${target.label.replace('Entrar como ', '')}.`,
        tone: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'No se pudo cambiar de rol',
        message: error.message || 'Inténtalo de nuevo.',
        tone: 'warning'
      })
    } finally {
      setSwitching(false)
    }
  }

  return (
    <Card className="border-olive/25 bg-olive/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-olive-deep" />
        <h3 className="font-display text-xl leading-none text-coffee">Modo demo</h3>
      </div>
      <p className="text-xs leading-relaxed text-coffee-soft">
        Cambia entre la vista cliente y estudio sin cerrar sesión. Solo aparece en la demo y no
        existe en producción.
      </p>
      <Button
        variant="secondary"
        className="mt-3 w-full"
        loading={switching}
        onClick={handleSwitch}
      >
        <ArrowLeftRight className="h-4 w-4" />
        Ver como {targetLabel}
      </Button>
    </Card>
  )
}
