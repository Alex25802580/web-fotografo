import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BUCKET = 'PORTFOLIO'

const createSlug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const safeFilename = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')

function AdminDashboard() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [galleries, setGalleries] = useState([])
  const [photos, setPhotos] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingGallery, setSavingGallery] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [galleryForm, setGalleryForm] = useState({ title: '', slug: '', categoryId: '', position: 0, published: true })
  const [photoForm, setPhotoForm] = useState({ galleryId: '', altText: '', position: 0, featured: false, published: true, file: null })

  const galleryById = useMemo(
    () => Object.fromEntries(galleries.map((gallery) => [gallery.id, gallery])),
    [galleries],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')

    const [categoriesResult, galleriesResult, photosResult] = await Promise.all([
      supabase.from('categories').select('*').order('position'),
      supabase.from('galleries').select('*, categories(name)').order('position'),
      supabase.from('photos').select('*').order('position'),
    ])

    const firstError = categoriesResult.error || galleriesResult.error || photosResult.error

    if (firstError) {
      setError(firstError.message)
    } else {
      setCategories(categoriesResult.data || [])
      setGalleries(galleriesResult.data || [])
      setPhotos(photosResult.data || [])
      setGalleryForm((current) => ({ ...current, categoryId: current.categoryId || categoriesResult.data?.[0]?.id || '' }))
      setPhotoForm((current) => ({ ...current, galleryId: current.galleryId || galleriesResult.data?.[0]?.id || '' }))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const showSuccess = (message) => {
    setNotice(message)
    setError('')
    window.setTimeout(() => setNotice(''), 3000)
  }

  const handleCreateGallery = async (event) => {
    event.preventDefault()
    setSavingGallery(true)
    setError('')

    const { error: insertError } = await supabase.from('galleries').insert({
      category_id: Number(galleryForm.categoryId),
      title: galleryForm.title.trim(),
      slug: galleryForm.slug || createSlug(galleryForm.title),
      position: Number(galleryForm.position),
      published: galleryForm.published,
    })

    setSavingGallery(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setGalleryForm((current) => ({ ...current, title: '', slug: '', position: 0 }))
    showSuccess('Galería creada correctamente.')
    await loadData()
  }

  const handleDeleteGallery = async (gallery) => {
    if (!window.confirm(`¿Eliminar la galería “${gallery.title}”?`)) return

    const { error: deleteError } = await supabase.from('galleries').delete().eq('id', gallery.id)

    if (deleteError) {
      setError(deleteError.message.includes('foreign key') ? 'No puedes borrar una galería que todavía contiene fotografías.' : deleteError.message)
      return
    }

    showSuccess('Galería eliminada.')
    await loadData()
  }

  const handleUploadPhoto = async (event) => {
    event.preventDefault()

    if (!photoForm.file) {
      setError('Selecciona una imagen.')
      return
    }

    const gallery = galleryById[photoForm.galleryId]
    if (!gallery) {
      setError('Selecciona una galería válida.')
      return
    }

    setUploading(true)
    setError('')

    const path = `${gallery.slug}/${crypto.randomUUID()}-${safeFilename(photoForm.file.name)}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, photoForm.file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setUploading(false)
      setError(uploadError.message)
      return
    }

    const { error: insertError } = await supabase.from('photos').insert({
      gallery_id: photoForm.galleryId,
      storage_path: path,
      alt_text: photoForm.altText.trim() || null,
      position: Number(photoForm.position),
      featured: photoForm.featured,
      published: photoForm.published,
    })

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([path])
      setUploading(false)
      setError(insertError.message)
      return
    }

    setPhotoForm((current) => ({ ...current, altText: '', position: 0, featured: false, file: null }))
    event.currentTarget.reset()
    setUploading(false)
    showSuccess('Fotografía subida correctamente.')
    await loadData()
  }

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('¿Eliminar esta fotografía?')) return

    const { error: storageError } = await supabase.storage.from(BUCKET).remove([photo.storage_path])
    if (storageError) {
      setError(storageError.message)
      return
    }

    const { error: deleteError } = await supabase.from('photos').delete().eq('id', photo.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }

    showSuccess('Fotografía eliminada.')
    await loadData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-toolbar">
        <div>
          <p className="admin-eyebrow">Diego Carrasco</p>
          <h1>Administración</h1>
        </div>
        <button type="button" className="admin-secondary-button" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {notice && <p className="admin-message admin-message--success">{notice}</p>}
      {error && <p className="admin-message admin-message--error">{error}</p>}

      <section className="admin-grid">
        <article className="admin-card">
          <h2>Nueva galería</h2>
          <form className="admin-form" onSubmit={handleCreateGallery}>
            <label>Título<input value={galleryForm.title} onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })} required /></label>
            <label>Slug<input value={galleryForm.slug} onChange={(event) => setGalleryForm({ ...galleryForm, slug: event.target.value })} placeholder="Se genera automáticamente" /></label>
            <label>Categoría<select value={galleryForm.categoryId} onChange={(event) => setGalleryForm({ ...galleryForm, categoryId: event.target.value })} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Posición<input type="number" min="0" value={galleryForm.position} onChange={(event) => setGalleryForm({ ...galleryForm, position: event.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={galleryForm.published} onChange={(event) => setGalleryForm({ ...galleryForm, published: event.target.checked })} /> Publicada</label>
            <button disabled={savingGallery}>{savingGallery ? 'Guardando…' : 'Crear galería'}</button>
          </form>
        </article>

        <article className="admin-card">
          <h2>Subir fotografía</h2>
          <form className="admin-form" onSubmit={handleUploadPhoto}>
            <label>Galería<select value={photoForm.galleryId} onChange={(event) => setPhotoForm({ ...photoForm, galleryId: event.target.value })} required>{galleries.map((gallery) => <option key={gallery.id} value={gallery.id}>{gallery.title}</option>)}</select></label>
            <label>Imagen<input type="file" accept="image/*" onChange={(event) => setPhotoForm({ ...photoForm, file: event.target.files?.[0] || null })} required /></label>
            <label>Texto alternativo<input value={photoForm.altText} onChange={(event) => setPhotoForm({ ...photoForm, altText: event.target.value })} /></label>
            <label>Posición<input type="number" min="0" value={photoForm.position} onChange={(event) => setPhotoForm({ ...photoForm, position: event.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={photoForm.featured} onChange={(event) => setPhotoForm({ ...photoForm, featured: event.target.checked })} /> Destacada en portada</label>
            <label className="admin-check"><input type="checkbox" checked={photoForm.published} onChange={(event) => setPhotoForm({ ...photoForm, published: event.target.checked })} /> Publicada</label>
            <button disabled={uploading || galleries.length === 0}>{uploading ? 'Subiendo…' : 'Subir fotografía'}</button>
          </form>
        </article>
      </section>

      <section className="admin-card admin-list-card">
        <h2>Galerías</h2>
        {loading ? <p>Cargando…</p> : galleries.length === 0 ? <p>No hay galerías todavía.</p> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Título</th><th>Categoría</th><th>Estado</th><th></th></tr></thead><tbody>{galleries.map((gallery) => <tr key={gallery.id}><td>{gallery.title}</td><td>{gallery.categories?.name || '—'}</td><td>{gallery.published ? 'Publicada' : 'Oculta'}</td><td><button type="button" className="admin-link-button" onClick={() => handleDeleteGallery(gallery)}>Eliminar</button></td></tr>)}</tbody></table></div>
        )}
      </section>

      <section className="admin-card admin-list-card">
        <h2>Fotografías ({photos.length})</h2>
        {loading ? <p>Cargando…</p> : photos.length === 0 ? <p>No hay fotografías todavía.</p> : (
          <div className="admin-photo-list">{photos.map((photo) => { const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path); return <article key={photo.id} className="admin-photo-row"><img src={data.publicUrl} alt={photo.alt_text || ''} /><div><strong>{galleryById[photo.gallery_id]?.title || 'Galería'}</strong><p>{photo.featured ? 'Destacada · ' : ''}{photo.published ? 'Publicada' : 'Oculta'}</p></div><button type="button" className="admin-link-button" onClick={() => handleDeletePhoto(photo)}>Eliminar</button></article> })}</div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard
