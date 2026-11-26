import { Camera, LockKeyhole, MessageCircle, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Logo } from '../../components/shared/Logo'
import { useAppData } from '../../context/AppDataContext'
import { getHealingDay } from '../../lib/healing'
import { whatsappUrl } from '../../lib/platform'

export function PhotoGate({ client, onOpenPhotos }) {
  const { settings } = useAppData()
  const healing = getHealingDay(client.startDate, client.durationDays)
  const whatsapp = String(settings?.studioWhatsApp || '').replace(/[^\d]/g, '')
  const email = settings?.studioEmail || 'hola@solumcare.app'

  return (
    <div className="phone-scroll mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-y-auto px-5 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/12 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-clay-deep">
          <LockKeyhole className="h-3 w-3" />
          Bloqueado
        </span>
      </div>

      <div className="mt-8 flex flex-1 flex-col justify-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clay/12 text-clay-deep">
          <Camera className="h-7 w-7" />
        </span>
        <p className="mt-5 text-center text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
          Seguimiento pendiente
        </p>
        <h1 className="mt-1 text-center font-display text-[2.15rem] leading-[1.02] tracking-[-0.035em] text-coffee">
          Hoy toca subir tu foto
        </h1>
        <p className="mx-auto mt-3 max-w-[19rem] text-center text-sm leading-relaxed text-coffee-soft">
          El estudio necesita ver la evolución del día {healing.day} de {healing.total}. Hasta
          entonces, el resto de la app queda bloqueado.
        </p>

        <Card className="mt-6 p-4">
          <p className="text-xs font-bold text-coffee">¿Qué necesitas?</p>
          <p className="mt-1 text-xs leading-relaxed text-coffee-soft">
            Haz una foto con luz natural, sin filtros y con la zona limpia y seca. Si no puedes
            hacerla ahora, contacta con el estudio para avisar.
          </p>
          <Button size="lg" className="mt-3 w-full" onClick={onOpenPhotos}>
            <Camera className="h-4 w-4" />
            Subir foto ahora
          </Button>
        </Card>

        <div className="mt-3 space-y-2">
          {whatsapp ? (
            <a
              href={whatsappUrl(
                settings.studioWhatsApp,
                `Hola, no puedo subir la foto del día ${healing.day}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-coffee/15 px-5 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
            >
              <MessageCircle className="h-4 w-4 text-olive-deep" />
              Avisar por WhatsApp
            </a>
          ) : null}
          <a
            href={`mailto:${email}?subject=${encodeURIComponent('Foto pendiente')}`}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-coffee/15 px-5 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
          >
            <Mail className="h-4 w-4 text-olive-deep" />
            Escribir al estudio
          </a>
        </div>

        <p className="mt-5 text-center text-[0.66rem] leading-relaxed text-coffee-soft">
          Este bloqueo protege tu seguimiento y se desactiva en cuanto subas la evidencia del
          día.
        </p>
      </div>
    </div>
  )
}
