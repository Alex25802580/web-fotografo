import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import PhotoLightbox from '../components/PhotoLightbox'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function CategoryPage() {
  const { categorySlug: routeSlug } = useParams()
  const location = useLocation()
  const { t } = useLanguage()
  const categorySlug = routeSlug || location.pathname.replace(/^\//, '')
  const [categoryName, setCategoryName] = useState('')
  const [photos, setPhotos] = useState([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true)
      setErrorKey('')
      setActivePhotoIndex(null)

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', categorySlug)
        .single()

      if (categoryError) {
        setErrorKey('categoryNotFound')
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
        setErrorKey('categoryNotFound')
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
          setErrorKey('categoryNotFound')
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

  if (loading) {
    return (
      <main className="public-status-page public-status-page--loading" role="status" aria-label={t.gallery.loading}>
        <span className="loading-spinner" aria-hidden="true" />
      </main>
    )
  }
  if (errorKey) return <main className="public-status-page">{t.gallery[errorKey]}</main>

  return (
    <main className="category-page category-page--photos-only">
      {photos.length === 0 ? (
        <p className="empty-gallery-message">{t.gallery.emptyCategory}</p>
      ) : (
        <section className="photo-grid" aria-label={`${categoryName} ${t.gallery.photosLabel}`}>
          {photos.map((photo, index) => (
            <button
              className="photo-grid-item"
              type="button"
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              aria-label={`${t.gallery.openPhoto} ${index + 1}`}
            >
              <img
                src={photo.publicUrl}
                alt={photo.alt_text || `${t.gallery.photo} ${index + 1}`}
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
