const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ACCEPTED_PHOTO_PREFIX = 'image/'

export const LOGO_MAX_BYTES = 2 * 1024 * 1024
export const PHOTO_MAX_BYTES = 12 * 1024 * 1024

export function fileSizeLabel(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function validateLogoFile(file) {
  if (!file) return 'Selecciona una imagen.'
  if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
    return 'Formato no válido. Usa PNG, JPG o WebP.'
  }
  if (file.size > LOGO_MAX_BYTES) {
    return `El logo supera ${fileSizeLabel(LOGO_MAX_BYTES)}.`
  }
  return null
}

export function validatePhotoFile(file) {
  if (!file) return 'Selecciona una foto.'
  if (!String(file.type).startsWith(ACCEPTED_PHOTO_PREFIX)) {
    return 'El archivo debe ser una imagen.'
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return `La foto supera ${fileSizeLabel(PHOTO_MAX_BYTES)}.`
  }
  return null
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo abrir la imagen.'))
    image.src = src
  })
}

export async function compressImage(
  file,
  { maxDimension = 1100, quality = 0.75, background = '#EFECE6' } = {}
) {
  const dataUrl = await readFileAsDataURL(file)
  const image = await loadImage(dataUrl)
  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * ratio))
  const height = Math.max(1, Math.round(image.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, width, height)
  }

  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  const outputType = file.type === 'image/png' && !background ? 'image/png' : 'image/jpeg'
  const compressed = canvas.toDataURL(outputType, quality)

  return {
    dataUrl: compressed,
    width,
    height,
    size: Math.round((compressed.length * 3) / 4)
  }
}

export async function compressLogo(file) {
  const error = validateLogoFile(file)
  if (error) throw new Error(error)
  return compressImage(file, {
    maxDimension: 512,
    quality: 0.9,
    background: null
  })
}

export async function compressPhoto(file) {
  const error = validatePhotoFile(file)
  if (error) throw new Error(error)
  return compressImage(file, {
    maxDimension: 1200,
    quality: 0.72,
    background: '#EFECE6'
  })
}
