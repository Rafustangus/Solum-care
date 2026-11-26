import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, Sparkles, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { generateId } from '../../lib/crypto'
import { hasPhotoForDay } from '../../lib/healing'
import { compressPhoto, validatePhotoFile } from '../../lib/image'
import { putPhoto } from '../../services/photoStore'

export function PhotoUpload({ client, day }) {
  const { addPhoto } = useAppData()
  const { pushToast, notify } = useNotifications()
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const alreadyUploaded = hasPhotoForDay(client.photos, day)

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview]
  )

  function selectFile(nextFile) {
    if (!nextFile) return
    const validation = validatePhotoFile(nextFile)
    if (validation) {
      setError(validation)
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setError('')
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
  }

  function handleFileChange(event) {
    selectFile(event.target.files?.[0])
    event.target.value = ''
  }

  function clearSelection() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setError('')
  }

  async function handleUpload() {
    if (!file) {
      setError('Selecciona o haz una foto primero.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const compressed = await compressPhoto(file)
      const storageKey = generateId('media')
      await putPhoto(storageKey, compressed.dataUrl)
      addPhoto(client.id, { day, storageKey, note: note.trim() })
      clearSelection()
      setNote('')
      pushToast({
        title: 'Foto enviada',
        message: `La evidencia del día ${day} queda en revisión del estudio.`,
        tone: 'success'
      })
      await notify({
        title: 'Foto enviada al estudio',
        body: `La evidencia del día ${day} queda pendiente de revisión.`,
        tag: `solumcare-photo-client-${client.id}-${day}`
      })
    } catch (uploadError) {
      setError(uploadError.message || 'No se pudo guardar la foto.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-clay">
            Evidencia del día {day}
          </p>
          <h3 className="mt-0.5 font-display text-[1.5rem] leading-none text-coffee">
            Sube una foto clara
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-coffee-soft">
            Luz natural, sin filtros y con la zona limpia y seca.
          </p>
        </div>
        {alreadyUploaded ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-olive/18 px-2.5 py-1 text-[0.62rem] font-bold text-olive-deep">
            <Check className="h-3 w-3" />
            subida
          </span>
        ) : null}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-coffee/10 bg-cream-deep">
          <img src={preview} alt="Vista previa de la foto" className="h-52 w-full object-cover" />
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-coffee/70 text-cream backdrop-blur transition hover:bg-coffee"
            aria-label="Quitar foto seleccionada"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2.5 py-1 text-[0.62rem] font-bold text-coffee">
            Lista para enviar
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-coffee/20 bg-cream/70 px-4 py-7 text-center">
          <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/18 text-olive-deep">
            <Camera className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-coffee">Aún no hay foto seleccionada</p>
          <p className="mt-0.5 max-w-[16rem] text-xs leading-relaxed text-coffee-soft">
            Haz una foto en el momento o elige una de tu galería.
          </p>
          <div className="mt-4 flex w-full gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              Cámara
            </Button>
            <Button
              variant="cream"
              className="flex-1"
              onClick={() => galleryRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Galería
            </Button>
          </div>
        </div>
      )}

      {preview ? (
        <div className="mt-3">
          <Textarea
            label="Nota para el estudio (opcional)"
            rows={2}
            placeholder="Ej. Hoy noto menos rojo en el borde."
            maxLength={180}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button variant="cream" className="flex-1" onClick={clearSelection} disabled={uploading}>
              Cambiar
            </Button>
            <Button className="flex-[1.4]" onClick={handleUpload} loading={uploading}>
              <Sparkles className="h-4 w-4" />
              Enviar al estudio
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
      ) : null}
    </Card>
  )
}
