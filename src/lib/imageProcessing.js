const MAX_IMAGE_SIZE = 3400
const WEBP_QUALITY = 0.92

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`No se ha podido leer ${file.name}`))
    }

    image.src = url
  })

const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('No se ha podido convertir la imagen a WebP.'))
      },
      'image/webp',
      WEBP_QUALITY,
    )
  })

export const optimizeImage = async (file) => {
  const image = await loadImage(file)
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight)

  // Si ya es un WebP dentro del tamaño máximo, evitamos recomprimirlo.
  if (file.type === 'image/webp' && longestSide <= MAX_IMAGE_SIZE) {
    return file
  }

  const scale = Math.min(1, MAX_IMAGE_SIZE / longestSide)
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('El navegador no permite procesar la imagen.')

  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  const blob = await canvasToBlob(canvas)
  const baseName = file.name.replace(/\.[^.]+$/, '')

  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

export const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
