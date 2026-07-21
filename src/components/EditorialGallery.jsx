import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'
const layouts = [
  'wide', 'portrait', 'medium', 'small', 'portrait',
  'medium', 'wide', 'small', 'portrait', 'medium',
  'small', 'wide', 'portrait', 'medium', 'small',
  'medium', 'portrait', 'wide', 'small', 'medium',
]

function EditorialGallery() {
  const [photographs, setPhotographs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPhotographs = async () => {
      setLoading(true)
      setError('')

      const { data, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('position')
        .limit(20)

      if (photosError) {
        setError(photosError.message)
      } else {
        setPhotographs(
          (data || []).map((photo, index) => ({
            ...photo,
            src: supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
            layout: layouts[index % layouts.length],
          })),
        )
      }

      setLoading(false)
    }

    loadPhotographs()
  }, [])

  if (loading) return <section className="public-status-page">Cargando portfolio…</section>
  if (error) return <section className="public-status-page">{error}</section>
  if (photographs.length === 0) {
    return <section className="public-status-page">Todavía no hay fotografías destacadas.</section>
  }

  return (
    <section className="editorial-gallery" id="selected-work" aria-label="Selección fotográfica">
      <div className="gallery-sequence">
        {photographs.map((photo, index) => (
          <figure className={`gallery-item gallery-item--${photo.layout}`} key={photo.id}>
            <img
              src={photo.src}
              alt={photo.alt_text || `Fotografía ${index + 1}`}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          </figure>
        ))}
      </div>
    </section>
  )
}

export default EditorialGallery
