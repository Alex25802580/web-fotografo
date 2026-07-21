import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'
const layouts = ['wide', 'portrait', 'medium', 'small', 'portrait', 'medium']

function GalleryPage() {
  const { gallerySlug } = useParams()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true)
      setError('')

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
    <main className="gallery-page">
      <header className="gallery-heading">
        <p>{gallery?.categories?.name}</p>
        <h1>{gallery?.title}</h1>
      </header>

      {photos.length === 0 ? (
        <p className="empty-gallery-message">Esta galería todavía no tiene fotografías publicadas.</p>
      ) : (
        <section className="gallery-sequence" aria-label={gallery?.title}>
          {photos.map((photo, index) => (
            <figure className={`gallery-item gallery-item--${layouts[index % layouts.length]}`} key={photo.id}>
              <img
                src={photo.publicUrl}
                alt={photo.alt_text || `${gallery?.title} ${index + 1}`}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </figure>
          ))}
        </section>
      )}
    </main>
  )
}

export default GalleryPage
