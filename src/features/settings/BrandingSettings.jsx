import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Toggle } from '../../components/ui/Toggle'
import { useBranding } from '../../context/BrandingContext'
import { useNotifications } from '../../context/NotificationContext'
import { assetUrl } from '../../lib/assets'
import { compressLogo } from '../../lib/image'
import { isValidName } from '../../lib/validation'

export function BrandingSettings() {
  const {
    studioName,
    logoDataUrl,
    showName,
    updateBranding,
    resetBranding
  } = useBranding()
  const { pushToast } = useNotifications()
  const fileRef = useRef(null)
  const [name, setName] = useState(studioName)
  const [visible, setVisible] = useState(showName)
  const [logo, setLogo] = useState(logoDataUrl)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(studioName)
    setVisible(showName)
    setLogo(logoDataUrl)
  }, [studioName, showName, logoDataUrl])

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    try {
      const compressed = await compressLogo(file)
      setLogo(compressed.dataUrl)
    } catch (fileError) {
      setError(fileError.message || 'No se pudo procesar el logo.')
    }
  }

  function save() {
    if (!isValidName(name)) {
      setError('El nombre del estudio debe tener entre 2 y 40 caracteres.')
      return
    }
    setError('')
    updateBranding({
      studioName: name.trim(),
      showName: visible,
      logoDataUrl: logo
    })
    pushToast({
      title: 'Marca actualizada',
      message: 'El nuevo logo y nombre se aplican al instante en la app.',
      tone: 'success'
    })
  }

  function reset() {
    resetBranding()
    setName('Solum-care')
    setVisible(true)
    setLogo(null)
    setError('')
    pushToast({
      title: 'Marca restaurada',
      message: 'Volvemos a la identidad base de Solum-care.',
      tone: 'info'
    })
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <ImagePlus className="h-4 w-4 text-clay" />
        <h3 className="font-display text-xl leading-none text-coffee">Marca del estudio</h3>
      </div>

      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-coffee/10 bg-cream/70 p-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cream-deep">
          <img
            src={logo || assetUrl('logo.png')}
            alt="Vista previa del logo"
            className="max-h-12 max-w-14 object-contain"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-none text-coffee">
            {visible ? name || 'Solum-care' : 'Solo logo'}
          </p>
          <p className="mt-1 text-xs text-coffee-soft">
            {logo ? 'Logo personalizado' : 'Logo base de Solum-care'}
          </p>
          <div className="mt-2 flex gap-1.5">
            <Button size="sm" variant="cream" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-3.5 w-3.5" />
              Subir
            </Button>
            {logo ? (
              <Button size="sm" variant="ghost" onClick={() => setLogo(null)}>
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <div className="space-y-3">
        <Input
          label="Nombre del estudio"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          hint="Sustituye a “Solum-care” en la cabecera, el login y el título."
        />
        <Toggle
          checked={visible}
          onChange={setVisible}
          label="Mostrar el nombre junto al logo"
          description="Si lo desactivas, solo se verá el símbolo."
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-rust/8 px-3 py-2 text-xs font-medium text-rust">{error}</p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Button variant="cream" className="flex-1" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Restaurar
        </Button>
        <Button className="flex-[1.4]" onClick={save}>
          <Save className="h-4 w-4" />
          Guardar marca
        </Button>
      </div>

      <p className="mt-2 text-[0.66rem] leading-relaxed text-coffee-soft">
        El icono de la app instalada (PWA) se genera en el despliegue; para actualizarlo hay que
        volver a publicar. El logo y el nombre internos cambian al instante.
      </p>
    </Card>
  )
}
