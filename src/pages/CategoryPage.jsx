import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { translations, useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function CategoryPage() {
  const { categorySlug: routeSlug } = useParams()
  const location = useLocation()
  const { language } = useLanguage()
  const copy = translations[language].gallery
  const categorySlug = routeSlug || location.pathname.replace(/^\//, '')
  const [categoryName, setCategoryName] = useState('')
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true)
      setErrorKey('')

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
        .select('*')
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
          .select('id, gallery_id, storage_path, alt_text, position, published')
          .in('gallery_id', galleryIds)
          .eq('published', true)
          .order('position')

        if (photosError) {
          setErrorKey('categoryNotFound')
          setLoading(false)
          return
        }

        photoData = data || []
      }

      const photosByGallery = photoData.reduce((accumulator, photo) => {
        if (!accumulator[photo.gallery_id]) accumulator[photo.gallery_id] = []
        accumulator[photo.gallery_id].push(photo)
        return accumulator
      }, {})

      const preparedGalleries = (galleryData || []).map((gallery) => {
        const galleryPhotos = photosByGallery[gallery.id] || []
        const coverPhoto = galleryPhotos.find((photo) => photo.id === gallery.cover_photo_id) || galleryPhotos[0] || null

        return {
          ...gallery,
          coverPhoto: coverPhoto
            ? {
                ...coverPhoto,
                publicUrl: supabase.storage.from(BUCKET).getPublicUrl(coverPhoto.storage_path).data.publicUrl,
              }
            : null,
        }
      })

      setCategoryName(categoryData.name)
      setGalleries(preparedGalleries)
      setLoading(false)
    }

    loadCategory()
  }, [categorySlug])

  if (loading) {
    return (
      <main className="public-status-page public-status-page--loading" role="status" aria-label={copy.loading}>
        <span className="loading-spinner" aria-hidden="true" />
      </main>
    )
  }

  if (errorKey) return <main className="public-status-page">{copy[errorKey]}</main>

  return (
    <main className="category-page category-page--galleries">
      {galleries.length === 0 ? (
        <p className="empty-gallery-message" key={language}>{copy.emptyCategory}</p>
      ) : (
        <section className="gallery-card-grid" aria-label={`${categoryName} ${copy.galleriesLabel}`}>
          {galleries.map((gallery) => (
            <Link className="gallery-card" to={`/gallery/${gallery.slug}`} key={gallery.id}>
              <div className="gallery-card-image">
                {gallery.coverPhoto ? (
                  <img
                    src={gallery.coverPhoto.publicUrl}
                    alt={gallery.coverPhoto.alt_text || gallery.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="gallery-card-placeholder" aria-hidden="true" />
                )}
              </div>
              <h2>{gallery.title}</h2>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}

export default CategoryPage
