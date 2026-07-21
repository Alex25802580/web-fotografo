import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'
const layouts = [
  'wide', 'portrait', 'medium', 'small', 'portrait',
  'medium', 'wide', 'small', 'portrait', 'medium',
  'small', 'wide', 'portrait', 'medium', 'small',
]

function CategoryPage() {
  const { categorySlug: routeSlug } = useParams()
  const location = useLocation()
  const categorySlug = routeSlug || location.pathname.replace(/^\//, '')
  const [category, setCategory] = useState(null)
  const [photographs, setPhotographs] = useState([])
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
        .select('id, slug, position')
        .eq('category_id', categoryData.id)
        .eq('published', true)
        .order('position')

      if (galleriesError) {
        setError(galleriesError.message)
        setLoading(false)
        return
      }

      const galleries = galleryData || []
      const galleryIds = galleries.map((gallery) => gallery.id)

      if (galleryIds.length === 0) {
        setCategory(categoryData)
        setPhotographs([])
        setLoading(false)
        return
      }

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

      const galleryById = Object.fromEntries(galleries.map((gallery) => [gallery.id, gallery]))
      const orderedPhotos = (photosData || [])
        .map((photo) => ({
          ...photo,
          gallery: galleryById[photo.gallery_id],
        }))
        .sort((a, b) => {
          const galleryDifference = (a.gallery?.position || 0) - (b.gallery?.position || 0)
          return galleryDifference || a.position - b.position
        })
        .map((photo, index) => ({
          ...photo,
          src: supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
          layout: layouts[index % layouts.length],
        }))

      setCategory(categoryData)
      setPhotographs(orderedPhotos)
      setLoading(false)
    }

    loadCategory()
  }, [categorySlug])

  if (loading) return <main className="public-status-page">Cargando…</main>
  if (error) return <main className="public-status-page">{error}</main>

  return (
    <main className="category-page" aria-label={category?.name || 'Categoría fotográfica'}>
      {photographs.length === 0 ? (
        <p className="empty-gallery-message">Todavía no hay fotografías publicadas.</p>
      ) : (
        <section className="gallery-sequence category-photo-grid">
          {photographs.map((photo, index) => (
            <Link
              className={`gallery-item gallery-item--${photo.layout}`}
              to={`/gallery/${photo.gallery.slug}`}
              key={photo.id}
              aria-label={`Abrir galería ${photo.gallery.slug}`}
            >
              <img
                src={photo.src}
                alt={photo.alt_text || `Fotografía ${index + 1}`}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}

export default CategoryPage
