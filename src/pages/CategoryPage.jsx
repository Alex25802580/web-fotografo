import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

function CategoryPage() {
  const { categorySlug } = useParams()
  const [category, setCategory] = useState(null)
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true)
      setError('')

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single()

      if (categoryError) {
        setError('No se ha encontrado esta categoría.')
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
        setError(galleriesError.message)
        setLoading(false)
        return
      }

      const galleryIds = (galleryData || []).map((gallery) => gallery.id)
      let photos = []

      if (galleryIds.length > 0) {
        const { data: photosData, error: photosError } = await supabase
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

        photos = photosData || []
      }

      const galleriesWithCover = (galleryData || []).map((gallery) => {
        const coverPhoto = photos.find((photo) => photo.gallery_id === gallery.id)
        const coverPath = gallery.cover_path || coverPhoto?.storage_path
        const coverUrl = coverPath
          ? supabase.storage.from(BUCKET).getPublicUrl(coverPath).data.publicUrl
          : null

        return { ...gallery, coverUrl }
      })

      setCategory(categoryData)
      setGalleries(galleriesWithCover)
      setLoading(false)
    }

    loadCategory()
  }, [categorySlug])

  if (loading) return <main className="public-status-page">Cargando…</main>
  if (error) return <main className="public-status-page">{error}</main>

  return (
    <main className="category-page">
      <header className="category-heading">
        <p>Portfolio</p>
        <h1>{category?.name}</h1>
      </header>

      {galleries.length === 0 ? (
        <p className="empty-gallery-message">Todavía no hay galerías publicadas.</p>
      ) : (
        <section className="gallery-cards" aria-label={`Galerías de ${category?.name}`}>
          {galleries.map((gallery) => (
            <Link className="gallery-card" to={`/gallery/${gallery.slug}`} key={gallery.id}>
              {gallery.coverUrl ? (
                <img src={gallery.coverUrl} alt={gallery.title} loading="lazy" />
              ) : (
                <div className="gallery-card-placeholder" aria-hidden="true" />
              )}
              <h2>{gallery.title}</h2>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}

export default CategoryPage
