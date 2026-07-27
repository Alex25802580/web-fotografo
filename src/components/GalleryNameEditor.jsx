import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function GalleryNameEditor() {
  const [galleries, setGalleries] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadGalleries = async () => {
    const { data, error: loadError } = await supabase
      .from('galleries')
      .select('id, title, categories(name)')
      .order('position')

    if (loadError) {
      setError(loadError.message)
      return
    }

    setGalleries(data || [])
  }

  useEffect(() => {
    loadGalleries()
  }, [])

  const startEditing = (gallery) => {
    setEditingId(gallery.id)
    setDraftName(gallery.title)
    setError('')
    setNotice('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setDraftName('')
  }

  const saveName = async (gallery) => {
    const title = draftName.trim()

    if (!title) {
      setError('El nombre de la galería es obligatorio.')
      return
    }

    if (title === gallery.title) {
      cancelEditing()
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    const { error: updateError } = await supabase
      .from('galleries')
      .update({ title })
      .eq('id', gallery.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setGalleries((current) => current.map((item) => (
      item.id === gallery.id ? { ...item, title } : item
    )))
    setEditingId(null)
    setDraftName('')
    setNotice(`Galería renombrada a “${title}”.`)
  }

  return (
    <div className="admin-dashboard admin-gallery-name-editor">
      <section className="admin-card admin-list-card">
        <h2>Editar nombres de galerías</h2>
        <p className="admin-help">Puedes cambiar el nombre visible de cualquier galería. La URL actual se mantiene para no romper enlaces.</p>

        {notice && <p className="admin-message admin-message--success">{notice}</p>}
        {error && <p className="admin-message admin-message--error">{error}</p>}

        {galleries.length === 0 ? (
          <p>No hay galerías todavía.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {galleries.map((gallery) => (
                  <tr key={gallery.id}>
                    <td>
                      {editingId === gallery.id ? (
                        <input
                          className="admin-inline-name-input"
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') saveName(gallery)
                            if (event.key === 'Escape') cancelEditing()
                          }}
                          autoFocus
                        />
                      ) : gallery.title}
                    </td>
                    <td>{gallery.categories?.name || '—'}</td>
                    <td>
                      {editingId === gallery.id ? (
                        <div className="admin-inline-actions">
                          <button type="button" className="admin-link-button" disabled={saving} onClick={() => saveName(gallery)}>
                            {saving ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button type="button" className="admin-link-button" disabled={saving} onClick={cancelEditing}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="admin-link-button" onClick={() => startEditing(gallery)}>
                          Editar nombre
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default GalleryNameEditor
