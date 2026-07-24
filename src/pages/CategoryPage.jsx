import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import PhotoLightbox from '../components/PhotoLightbox'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function CategoryPage() {
  const { categorySlug: routeSlug } = useParams()
  const location = useLocation()
  const categorySlug = routeSlug || location.pathname.replace(/^\//, '')
  const [categoryName, setCategoryName] = useState('')
  const [photos, setPhotos] = useState([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true)
      setError('')
      setActivePhotoIndex(null)

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', categorySlug)
        .single()

      if (categoryError) {
        setError('No se ha encontrado esta categoría.')
        setLoading(false)
        return
      }

      const { data: galleryData, error: galleriesError } = await supabase
        .from('galleries')
        .select('id, position')
        .eq('category_id', categoryData.id)
        .eq('published', true)
        .order('position')

      if (galleriesError) {
        setError(galleriesError.message)
        setLoading(false)
        return
      }

      const galleryIds = (galleryData || []).map((gallery) => gallery.id)
      let photoData = []

      if (galleryIds.length > 0) {
        const { data, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .in('gallery_id', galleryIds)
          .eq('published', true)
          .order('position')

        if (photosError) {
          setError(photosError.message)
          setLoading(false)
          return
        }

        const galleryOrder = Object.fromEntries(
          (galleryData || []).map((gallery, index) => [gallery.id, index]),
        )

        photoData = (data || []).sort((first, second) => {
          const galleryDifference = galleryOrder[first.gallery_id] - galleryOrder[second.gallery_id]
          return galleryDifference || first.position - second.position
        })
      }

      setCategoryName(categoryData.name)
      setPhotos(
        photoData.map((photo) => ({
          ...photo,
          publicUrl: supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
        })),
      )
      setLoading(false)
    }

    loadCategory()
  }, [categorySlug])

  if (loading) return <main className="public-status-page">Cargando…</main>
  if (error) return <main className="public-status-page">{error}</main>

  return (
    <main className="category-page category-page--photos-only">
      {photos.length === 0 ? (
        <p className="empty-gallery-message">Todavía no hay fotografías publicadas.</p>
      ) : (
        <section className="photo-grid" aria-label={`Fotografías de ${categoryName}`}>
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
                alt={photo.alt_text || `Fotografía ${index + 1}`}
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

export default CategoryPage
