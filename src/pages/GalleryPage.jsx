import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PhotoLightbox from '../components/PhotoLightbox'
import { translations, useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { getPortfolioPublicUrl } from '../lib/portfolioStorage'

function GalleryPage() {
  const { gallerySlug } = useParams()
  const { language } = useLanguage()
  const copy = translations[language].gallery
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState('')

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true)
      setErrorKey('')
      setActivePhotoIndex(null)

      const { data: galleryData, error: galleryError } = await supabase
        .from('galleries')
        .select('*, categories(name, slug)')
        .eq('slug', gallerySlug)
        .eq('published', true)
        .single()

      if (galleryError) {
        setErrorKey('galleryNotFound')
        setLoading(false)
        return
      }

      const { data: photoData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', galleryData.id)
        .eq('published', true)
        .order('position')

      if (photosError) {
        setErrorKey('galleryNotFound')
        setLoading(false)
        return
      }

      setGallery(galleryData)
      setPhotos(
        (photoData || []).map((photo) => ({
          ...photo,
          publicUrl: getPortfolioPublicUrl(photo.storage_path),
        })),
      )
      setLoading(false)
    }

    loadGallery()
  }, [gallerySlug])

  if (loading) {
    return (
      <main className="public-status-page public-status-page--loading" role="status" aria-label={copy.loading}>
        <span className="loading-spinner" aria-hidden="true" />
      </main>
    )
  }

  if (errorKey) return <main className="public-status-page">{copy[errorKey]}</main>

  return (
    <main className="gallery-page gallery-page--photos-only">
      {photos.length === 0 ? (
        <p className="empty-gallery-message" key={language}>{copy.emptyGallery}</p>
      ) : (
        <section className="photo-grid" aria-label={gallery?.title}>
          {photos.map((photo, index) => (
            <button
              className="photo-grid-item"
              type="button"
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              aria-label={`${copy.openPhoto} ${index + 1}`}
            >
              <img
                src={photo.publicUrl}
                alt={photo.alt_text || `${gallery?.title} ${index + 1}`}
                loading={index < 6 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
        </section>
      )}

      <PhotoLightbox
        photos={photos}
        activeIndex={activePhotoIndex}
        onClose={() => setActivePhotoIndex(null)}
        onChange={setActivePhotoIndex}
      />
    </main>
  )
}

export default GalleryPage
