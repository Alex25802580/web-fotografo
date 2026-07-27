import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { formatFileSize, optimizeImage } from '../lib/imageProcessing'

const BUCKET = 'PORTFOLIO'
const HOME_FOLDER = 'home'

const safeFilename = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')

function AdminHomePhotos() {
  const [photos, setPhotos] = useState([])
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [inputKey, setInputKey] = useState(0)
  const [mountNode, setMountNode] = useState(null)

  useEffect(() => {
    const dashboard = document.querySelector('.admin-dashboard')
    const topGrid = dashboard?.querySelector('.admin-grid')
    if (!dashboard || !topGrid) return undefined

    let node = dashboard.querySelector('.admin-home-photos-mount')
    if (!node) {
      node = document.createElement('div')
      node.className = 'admin-home-photos-mount'
      topGrid.insertAdjacentElement('afterend', node)
    }

    setMountNode(node)

    return () => {
      if (node?.parentNode) node.parentNode.removeChild(node)
    }
  }, [])

  const loadPhotos = async () => {
    const { data, error: loadError } = await supabase
      .from('home_photos')
      .select('*')
      .order('position')

    if (loadError) {
      setError(loadError.message)
      return
    }

    setPhotos(data || [])
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!files.length) return

    setUploading(true)
    setError('')
    setNotice('')

    const failed = []

    for (let index = 0; index < files.length; index += 1) {
      const originalFile = files[index]

      try {
        const optimizedFile = await optimizeImage(originalFile)
        const path = `${HOME_FOLDER}/${crypto.randomUUID()}-${safeFilename(optimizedFile.name)}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, optimizedFile, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { error: insertError } = await supabase.from('home_photos').insert({
          storage_path: path,
          alt_text: originalFile.name.replace(/\.[^.]+$/, ''),
          position: photos.length + index,
          published: true,
        })

        if (insertError) {
          await supabase.storage.from(BUCKET).remove([path])
          throw insertError
        }
      } catch (uploadError) {
        failed.push(`${originalFile.name}: ${uploadError.message}`)
      }
    }

    setUploading(false)
    setFiles([])
    setInputKey((current) => current + 1)

    if (failed.length) {
      setError(`Algunas fotografías no se pudieron subir: ${failed.join(' · ')}`)
    } else {
      setNotice('Fotografías de portada subidas correctamente.')
    }

    await loadPhotos()
  }

  const handleDelete = async (photo) => {
    if (!window.confirm('¿Eliminar esta fotografía de portada?')) return

    const { error: storageError } = await supabase.storage.from(BUCKET).remove([photo.storage_path])
    if (storageError) {
      setError(storageError.message)
      return
    }

    const { error: deleteError } = await supabase.from('home_photos').delete().eq('id', photo.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setNotice('Fotografía de portada eliminada.')
    await loadPhotos()
  }

  if (!mountNode) return null

  return createPortal(
    <section className="admin-card admin-list-card">
      <h2>Fotografías de portada</h2>
      <p className="admin-help">Estas fotografías son independientes de Weddings y Personal. Solo se muestran en Home.</p>

      {notice && <p className="admin-message admin-message--success">{notice}</p>}
      {error && <p className="admin-message admin-message--error">{error}</p>}

      <form className="admin-form" onSubmit={handleUpload}>
        <label>
          Imágenes para Home
          <input
            key={inputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
        </label>
        {files.length > 0 && (
          <div className="admin-selected-files">
            {files.map((file) => (
              <div className="admin-selected-file" key={`${file.name}-${file.lastModified}`}>
                <span>{file.name} · {formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
        <button disabled={uploading || !files.length}>{uploading ? 'Procesando…' : 'Subir fotografías de portada'}</button>
      </form>

      {photos.length > 0 && (
        <div className="admin-photo-list">
          {photos.map((photo) => {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path)
            return (
              <article key={photo.id} className="admin-photo-row">
                <img src={data.publicUrl} alt={photo.alt_text || ''} />
                <div>
                  <strong>Home</strong>
                  <p>{photo.published ? 'Publicada' : 'Oculta'}</p>
                </div>
                <div className="admin-photo-actions">
                  <button type="button" className="admin-link-button" onClick={() => handleDelete(photo)}>Eliminar</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>,
    mountNode,
  )
}

export default AdminHomePhotos
