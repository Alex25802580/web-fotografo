import { useEffect, useRef } from 'react'

const TEMP_DOWNLOAD_URL = 'https://www.swisstransfer.com/d/9ed412f9-9ad5-4a67-803f-7e3bf53dfc14'

function ChevronIcon({ direction }) {
  const points = direction === 'previous' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

function PhotoLightbox({ photos, activeIndex, onClose, onChange }) {
  const activePhoto = photos[activeIndex]
  const touchStartX = useRef(null)

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

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || photos.length < 2) return

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = touchEndX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(distance) < 45) return
    if (distance > 0) onChange((activeIndex - 1 + photos.length) % photos.length)
    else onChange((activeIndex + 1) % photos.length)
  }

  return (
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged photograph"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <a
        className="photo-lightbox-download"
        href={TEMP_DOWNLOAD_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Download high-resolution photograph"
        title="Download high-resolution photograph"
        onClick={(event) => event.stopPropagation()}
      >
        <DownloadIcon />
      </a>

      <button className="photo-lightbox-close" type="button" onClick={onClose} aria-label="Close image">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {photos.length > 1 && (
        <button
          className="photo-lightbox-arrow photo-lightbox-arrow--previous"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange((activeIndex - 1 + photos.length) % photos.length)
          }}
          aria-label="Previous photograph"
        >
          <ChevronIcon direction="previous" />
        </button>
      )}

      <div className="photo-lightbox-stage">
        <img
          key={activePhoto.id || activePhoto.publicUrl || activePhoto.src}
          src={activePhoto.publicUrl || activePhoto.src}
          alt={activePhoto.alt_text || activePhoto.alt || ''}
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {photos.length > 1 && (
        <button
          className="photo-lightbox-arrow photo-lightbox-arrow--next"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange((activeIndex + 1) % photos.length)
          }}
          aria-label="Next photograph"
        >
          <ChevronIcon direction="next" />
        </button>
      )}

      <p className="photo-lightbox-counter">
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
        <span aria-hidden="true">—</span>
        <span>{String(photos.length).padStart(2, '0')}</span>
      </p>
    </div>
  )
}

export default PhotoLightbox
