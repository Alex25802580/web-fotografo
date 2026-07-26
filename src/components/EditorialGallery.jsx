import { useEffect, useState } from 'react'
import PhotoLightbox from './PhotoLightbox'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function EditorialGallery() {
  const [photographs, setPhotographs] = useState([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPhotographs = async () => {
      setLoading(true)

      const { data, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('position')
        .limit(24)

      if (photosError) {
        setError(photosError.message)
      } else {
        setPhotographs(
          (data || []).map((photo) => ({
            ...photo,
            publicUrl: supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
          })),
        )
      }

      setLoading(false)
    }

    loadPhotographs()
  }, [])

  if (loading) {
    return (
      <section className="public-status-page public-status-page--loading" role="status" aria-label="Loading photographs">
        <span className="loading-spinner" aria-hidden="true" />
      </section>
    )
  }
  if (error) return <section className="public-status-page">{error}</section>
  if (photographs.length === 0) {
    return <section className="public-status-page">There are no featured photographs yet.</section>
  }

  return (
    <section className="editorial-gallery" id="selected-work" aria-label="Selected photographs">
      <div className="photo-grid photo-grid--home">
        {photographs.map((photo, index) => (
          <button
            className="photo-grid-item"
            type="button"
            key={photo.id}
            onClick={() => setActivePhotoIndex(index)}
            aria-label={`Open photograph ${index + 1}`}
          >
            <img
              src={photo.publicUrl}
              alt={photo.alt_text || `Photograph ${index + 1}`}
              loading={index < 6 ? 'eager' : 'lazy'}
            />
          </button>
        ))}
      </div>

      <PhotoLightbox
        photos={photographs}
        activeIndex={activePhotoIndex}
        onClose={() => setActivePhotoIndex(null)}
        onChange={setActivePhotoIndex}
      />
    </section>
  )
}

export default EditorialGallery