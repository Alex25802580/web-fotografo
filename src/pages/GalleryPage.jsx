import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PhotoLightbox from '../components/PhotoLightbox'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function GalleryPage() {
  const { gallerySlug } = useParams()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true)
      setError('')
      setActivePhotoIndex(null)

      const { data: galleryData, error: galleryError } = await supabase
        .from('galleries')
        .select('*, categories(name, slug)')
        .eq('slug', gallerySlug)
        .eq('published', true)
        .single()

      if (galleryError) {
        setError('No se ha encontrado esta galería.')
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
        setError(photosError.message)
        setLoading(false)
        return
      }

      setGallery(galleryData)
      setPhotos(
        (photoData || []).map((photo) => ({
          ...photo,
          publicUrl: supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
        })),
      )
      setLoading(false)
    }

    loadGallery()
  }, [gallerySlug])

  if (loading) return <main className="public-status-page">Cargando…</main>
  if (error) return <main className="public-status-page">{error}</main>

  return (
    <main className="gallery-page gallery-page--photos-only">
      {photos.length === 0 ? (
        <p className="empty-gallery-message">Esta galería todavía no tiene fotografías publicadas.</p>
      ) : (
        <section className="photo-grid" aria-label={gallery?.title}>
          {photos.map((photo, index) => (
            <button
              className="photo-grid-item"
              type="button"
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              aria-label={`Abrir fotografía ${index + 1}`}
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
