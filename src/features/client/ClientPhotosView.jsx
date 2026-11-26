import { useState } from 'react'
import { AlertTriangle, Camera, MessageCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAppData } from '../../context/AppDataContext'
import { getFrequency, getHealingDay, isPhotoPending } from '../../lib/healing'
import { PhotoGallery } from './PhotoGallery'
import { PhotoUpload } from './PhotoUpload'
import { ReportProblemSheet } from './ReportProblemSheet'

export function ClientPhotosView({ client }) {
  const { settings } = useAppData()
  const [reportOpen, setReportOpen] = useState(false)

  if (!client) return null

  const healing = getHealingDay(client.startDate, client.durationDays)
  const day = Math.max(1, healing.day)
  const pending = isPhotoPending(client, healing.day)
  const frequency = getFrequency(client.photoFrequency)
  const whatsapp = String(settings?.studioWhatsApp || '').replace(/[^\d]/g, '')

  return (
    <div className="phone-scroll mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:pt-6">
      <div className="mb-4">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-clay">
          Seguimiento visual
        </p>
        <h1 className="mt-0.5 font-display text-[2rem] leading-[1] tracking-[-0.035em] text-coffee">
          Fotos del día {day}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-coffee-soft">
          Frecuencia marcada por el estudio: <strong>{frequency.label.toLowerCase()}</strong>.
        </p>
      </div>

      {pending ? (
        <Card className="mb-3 border-clay/30 bg-clay/10 p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay-deep">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-clay-deep">Hoy toca subir tu foto</p>
              <p className="mt-0.5 text-xs leading-relaxed text-coffee-soft">
                El estudio necesita ver la evolución del día {day}.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <PhotoUpload client={client} day={day} />

      <div className="mt-5">
        <PhotoGallery photos={client.photos} />
      </div>

      <div className="mt-5 space-y-2">
        <Button
          variant="outline"
          className="w-full border-rust/25 text-rust hover:bg-rust/6"
          onClick={() => setReportOpen(true)}
        >
          <AlertTriangle className="h-4 w-4" />
          Reportar problema
        </Button>
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-coffee/15 bg-transparent px-5 text-sm font-semibold text-coffee transition hover:bg-cream-deep/70"
          >
            <MessageCircle className="h-4 w-4 text-olive-deep" />
            Hablar con el estudio
          </a>
        ) : null}
      </div>

      <ReportProblemSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        client={client}
      />
    </div>
  )
}
