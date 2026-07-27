import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatFileSize, optimizeImage } from '../lib/imageProcessing'

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
  const [savingCoverId, setSavingCoverId] = useState(null)
  const [editingGalleryId, setEditingGalleryId] = useState(null)
  const [editingGalleryTitle, setEditingGalleryTitle] = useState('')
  const [savingGalleryName, setSavingGalleryName] = useState(false)
  const [deletingGalleryId, setDeletingGalleryId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    slug: '',
    categoryId: '',
    position: 0,
    published: true,
  })

  const [photoForm, setPhotoForm] = useState({
    galleryId: '',
    altText: '',
    position: 0,
    featured: false,
    published: true,
    files: [],
  })

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
      setGalleryForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoriesResult.data?.[0]?.id || '',
      }))
      setPhotoForm((current) => ({
        ...current,
        galleryId: current.galleryId || galleriesResult.data?.[0]?.id || '',
      }))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const showSuccess = (message) => {
    setNotice(message)
    setError('')
    window.setTimeout(() => setNotice(''), 4000)
  }

  const handleCreateGallery = async (event) => {
    event.preventDefault()
    const title = galleryForm.title.trim()

    if (!title) {
      setError('El nombre de la galería es obligatorio.')
      return
    }

    setSavingGallery(true)
    setError('')

    const { error: insertError } = await supabase.from('galleries').insert({
      category_id: Number(galleryForm.categoryId),
      title,
      slug: galleryForm.slug.trim() || createSlug(title),
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

  const startEditingGallery = (gallery) => {
    setEditingGalleryId(gallery.id)
    setEditingGalleryTitle(gallery.title)
    setError('')
  }

  const cancelEditingGallery = () => {
    setEditingGalleryId(null)
    setEditingGalleryTitle('')
  }

  const handleRenameGallery = async (gallery) => {
    const title = editingGalleryTitle.trim()

    if (!title) {
      setError('El nombre de la galería es obligatorio.')
      return
    }

    if (title === gallery.title) {
      cancelEditingGallery()
      return
    }

    setSavingGalleryName(true)
    setError('')

    const { error: updateError } = await supabase
      .from('galleries')
      .update({ title })
      .eq('id', gallery.id)

    setSavingGalleryName(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    cancelEditingGallery()
    showSuccess(`Galería renombrada a “${title}”.`)
    await loadData()
  }

  const handleDeleteGallery = async (gallery) => {
    if (!window.confirm(`¿Estás seguro de eliminar la galería “${gallery.title}”? Se eliminarán también todas sus fotografías.`)) return

    setDeletingGalleryId(gallery.id)
    setError('')

    const galleryPhotos = photos.filter((photo) => photo.gallery_id === gallery.id)
    const storagePaths = galleryPhotos.map((photo) => photo.storage_path).filter(Boolean)

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove(storagePaths)

      if (storageError) {
        setDeletingGalleryId(null)
        setError(storageError.message)
        return
      }
    }

    if (galleryPhotos.length > 0) {
      const { error: photosDeleteError } = await supabase
        .from('photos')
        .delete()
        .eq('gallery_id', gallery.id)

      if (photosDeleteError) {
        setDeletingGalleryId(null)
        setError(photosDeleteError.message)
        return
      }
    }

    const { error: galleryDeleteError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', gallery.id)

    setDeletingGalleryId(null)

    if (galleryDeleteError) {
      setError(galleryDeleteError.message)
      return
    }

    if (editingGalleryId === gallery.id) cancelEditingGallery()
    showSuccess('Galería y fotografías eliminadas.')
    await loadData()
  }

  const handleSetGalleryCover = async (photo) => {
    const gallery = galleryById[photo.gallery_id]
    if (!gallery) return

    setSavingCoverId(photo.id)
    setError('')

    const { error: updateError } = await supabase
      .from('galleries')
      .update({ cover_photo_id: photo.id })
      .eq('id', gallery.id)

    setSavingCoverId(null)

    if (updateError) {
      setError(updateError.message)
      return
    }

    showSuccess(`Portada de “${gallery.title}” actualizada.`)
    await loadData()
  }

  const handleFilesChange = (event) => {
    setPhotoForm((current) => ({ ...current, files: Array.from(event.target.files || []) }))
  }

  const removeSelectedFile = (indexToRemove) => {
    setPhotoForm((current) => ({
      ...current,
      files: current.files.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleUploadPhotos = async (event) => {
    event.preventDefault()

    if (photoForm.files.length === 0) {
      setError('Selecciona al menos una imagen.')
      return
    }

    const gallery = galleryById[photoForm.galleryId]
    if (!gallery) {
      setError('Selecciona una galería válida.')
      return
    }

    setUploading(true)
    setError('')
    setNotice('')

    const failedFiles = []
    let uploadedCount = 0

    for (let index = 0; index < photoForm.files.length; index += 1) {
      const originalFile = photoForm.files[index]
      setUploadProgress(`Procesando y subiendo ${index + 1} de ${photoForm.files.length}: ${originalFile.name}`)

      try {
        const optimizedFile = await optimizeImage(originalFile)
        const path = `${gallery.slug}/${crypto.randomUUID()}-${safeFilename(optimizedFile.name)}`
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, optimizedFile, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { error: insertError } = await supabase.from('photos').insert({
          gallery_id: photoForm.galleryId,
          storage_path: path,
          alt_text: photoForm.altText.trim() || originalFile.name.replace(/\.[^.]+$/, ''),
          position: Number(photoForm.position) + index,
          featured: photoForm.featured,
          published: photoForm.published,
        })

        if (insertError) {
          await supabase.storage.from(BUCKET).remove([path])
          throw insertError
        }

        uploadedCount += 1
      } catch (uploadError) {
        failedFiles.push(`${originalFile.name}: ${uploadError.message}`)
      }
    }

    setUploading(false)
    setUploadProgress('')
    setPhotoForm((current) => ({
      ...current,
      altText: '',
      position: 0,
      featured: false,
      files: [],
    }))
    setFileInputKey((current) => current + 1)

    if (failedFiles.length > 0) {
      setError(`${uploadedCount} imágenes subidas. Fallaron: ${failedFiles.join(' · ')}`)
    } else {
      showSuccess(`${uploadedCount} ${uploadedCount === 1 ? 'fotografía subida' : 'fotografías subidas'} y optimizadas correctamente.`)
    }

    await loadData()
  }

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('¿Eliminar esta fotografía?')) return

    const gallery = galleryById[photo.gallery_id]
    if (gallery?.cover_photo_id === photo.id) {
      const { error: clearCoverError } = await supabase
        .from('galleries')
        .update({ cover_photo_id: null })
        .eq('id', gallery.id)

      if (clearCoverError) {
        setError(clearCoverError.message)
        return
      }
    }

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
            <label>
              Nombre de la galería
              <input value={galleryForm.title} onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })} required />
            </label>
            <label>
              Slug
              <input value={galleryForm.slug} onChange={(event) => setGalleryForm({ ...galleryForm, slug: event.target.value })} placeholder="Se genera automáticamente" />
            </label>
            <label>
              Categoría
              <select value={galleryForm.categoryId} onChange={(event) => setGalleryForm({ ...galleryForm, categoryId: event.target.value })} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label>
              Posición
              <input type="number" min="0" value={galleryForm.position} onChange={(event) => setGalleryForm({ ...galleryForm, position: event.target.value })} />
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={galleryForm.published} onChange={(event) => setGalleryForm({ ...galleryForm, published: event.target.checked })} />
              Publicada
            </label>
            <button disabled={savingGallery}>{savingGallery ? 'Guardando…' : 'Crear galería'}</button>
          </form>
        </article>

        <article className="admin-card">
          <h2>Subir fotografías</h2>
          <form className="admin-form" onSubmit={handleUploadPhotos}>
            <label>
              Galería
              <select value={photoForm.galleryId} onChange={(event) => setPhotoForm({ ...photoForm, galleryId: event.target.value })} disabled={galleries.length === 0} required>
                <option value="">{galleries.length ? 'Selecciona una galería' : 'Primero crea una galería'}</option>
                {galleries.map((gallery) => <option key={gallery.id} value={gallery.id}>{gallery.title}</option>)}
              </select>
            </label>
            <label>
              Imágenes
              <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFilesChange} required />
            </label>
            <p className="admin-help">Puedes seleccionar muchas fotos a la vez. Se redimensionan a un máximo de 2400 px y se convierten a WebP antes de subirlas.</p>
            {photoForm.files.length > 0 && (
              <div className="admin-selected-files">
                {photoForm.files.map((file, index) => (
                  <div className="admin-selected-file" key={`${file.name}-${file.lastModified}`}>
                    <span>{file.name} · {formatFileSize(file.size)}</span>
                    <button type="button" onClick={() => removeSelectedFile(index)}>Quitar</button>
                  </div>
                ))}
              </div>
            )}
            <label>
              Texto alternativo común (opcional)
              <input value={photoForm.altText} onChange={(event) => setPhotoForm({ ...photoForm, altText: event.target.value })} placeholder="Si se deja vacío se usa el nombre del archivo" />
            </label>
            <label>
              Posición inicial
              <input type="number" min="0" value={photoForm.position} onChange={(event) => setPhotoForm({ ...photoForm, position: event.target.value })} />
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={photoForm.featured} onChange={(event) => setPhotoForm({ ...photoForm, featured: event.target.checked })} />
              Destacadas en portada
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={photoForm.published} onChange={(event) => setPhotoForm({ ...photoForm, published: event.target.checked })} />
              Publicadas
            </label>
            {uploadProgress && <p className="admin-upload-progress">{uploadProgress}</p>}
            <button disabled={uploading || galleries.length === 0 || photoForm.files.length === 0}>
              {uploading ? 'Procesando…' : `Subir ${photoForm.files.length || ''} ${photoForm.files.length === 1 ? 'fotografía' : 'fotografías'}`}
            </button>
          </form>
        </article>
      </section>

      <section className="admin-card admin-list-card">
        <h2>Galerías</h2>
        {loading ? <p>Cargando…</p> : galleries.length === 0 ? <p>No hay galerías todavía.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Categoría</th><th>Portada</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {galleries.map((gallery) => {
                  const isEditing = editingGalleryId === gallery.id
                  const isDeleting = deletingGalleryId === gallery.id

                  return (
                    <tr key={gallery.id}>
                      <td>
                        {isEditing ? (
                          <input
                            className="admin-inline-name-input"
                            value={editingGalleryTitle}
                            onChange={(event) => setEditingGalleryTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') handleRenameGallery(gallery)
                              if (event.key === 'Escape') cancelEditingGallery()
                            }}
                            autoFocus
                          />
                        ) : gallery.title}
                      </td>
                      <td>{gallery.categories?.name || '—'}</td>
                      <td>{gallery.cover_photo_id ? 'Elegida' : 'Primera foto'}</td>
                      <td>{gallery.published ? 'Publicada' : 'Oculta'}</td>
                      <td>
                        <div className="admin-photo-actions">
                          {isEditing ? (
                            <>
                              <button type="button" className="admin-link-button" disabled={savingGalleryName} onClick={() => handleRenameGallery(gallery)}>
                                {savingGalleryName ? 'Guardando…' : 'Guardar'}
                              </button>
                              <button type="button" className="admin-link-button" disabled={savingGalleryName} onClick={cancelEditingGallery}>Cancelar</button>
                            </>
                          ) : (
                            <button type="button" className="admin-link-button" onClick={() => startEditingGallery(gallery)}>Editar</button>
                          )}
                          <button type="button" className="admin-link-button" disabled={isDeleting} onClick={() => handleDeleteGallery(gallery)}>
                            {isDeleting ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card admin-list-card">
        <h2>Fotografías ({photos.length})</h2>
        <p className="admin-help">Para escoger la portada de una galería, pulsa “Usar como portada” en una de sus fotografías.</p>
        {loading ? <p>Cargando…</p> : photos.length === 0 ? <p>No hay fotografías todavía.</p> : (
          <div className="admin-photo-list">
            {photos.map((photo) => {
              const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path)
              const gallery = galleryById[photo.gallery_id]
              const isCover = gallery?.cover_photo_id === photo.id

              return (
                <article key={photo.id} className={isCover ? 'admin-photo-row is-cover' : 'admin-photo-row'}>
                  <img src={data.publicUrl} alt={photo.alt_text || ''} />
                  <div>
                    <strong>{gallery?.title || 'Galería'}</strong>
                    <p>{isCover ? 'Portada de galería · ' : ''}{photo.featured ? 'Destacada en Home · ' : ''}{photo.published ? 'Publicada' : 'Oculta'}</p>
                  </div>
                  <div className="admin-photo-actions">
                    <button type="button" className="admin-link-button" disabled={isCover || savingCoverId === photo.id} onClick={() => handleSetGalleryCover(photo)}>
                      {isCover ? 'Portada actual' : savingCoverId === photo.id ? 'Guardando…' : 'Usar como portada'}
                    </button>
                    <button type="button" className="admin-link-button" onClick={() => handleDeletePhoto(photo)}>Eliminar</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard
