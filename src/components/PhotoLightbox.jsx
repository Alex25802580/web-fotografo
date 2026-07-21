import { useEffect } from 'react'

function PhotoLightbox({ photos, activeIndex, onClose, onChange }) {
  const activePhoto = photos[activeIndex]

  useEffect(() => {
    if (!activePhoto) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + photos.length) % photos.length)
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % photos.length)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePhoto, activeIndex, onChange, onClose, photos.length])

  if (!activePhoto) return null

  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Fotografía ampliada" onClick={onClose}>
      <button className="photo-lightbox-close" type="button" onClick={onClose} aria-label="Cerrar imagen">Cerrar</button>

      {photos.length > 1 && (
        <button
          className="photo-lightbox-arrow photo-lightbox-arrow--previous"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange((activeIndex - 1 + photos.length) % photos.length)
          }}
          aria-label="Fotografía anterior"
        >
          ←
        </button>
      )}

      <img
        src={activePhoto.publicUrl || activePhoto.src}
        alt={activePhoto.alt_text || activePhoto.alt || ''}
        onClick={(event) => event.stopPropagation()}
      />

      {photos.length > 1 && (
        <button
          className="photo-lightbox-arrow photo-lightbox-arrow--next"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange((activeIndex + 1) % photos.length)
          }}
          aria-label="Fotografía siguiente"
        >
          →
        </button>
      )}

      <p className="photo-lightbox-counter">{activeIndex + 1} / {photos.length}</p>
    </div>
  )
}

export default PhotoLightbox
