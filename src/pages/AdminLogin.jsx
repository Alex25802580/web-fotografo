import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(undefined)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('No se ha podido iniciar sesión. Revisa el correo y la contraseña.')
      return
    }

    const destination = location.state?.from?.pathname || '/admin'
    navigate(destination, { replace: true })
  }

  if (session) return <Navigate to="/admin" replace />

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <p className="admin-eyebrow">Diego Carrasco</p>
        <h1>Panel de administración</h1>
        <p className="admin-intro">
          Acceso privado para gestionar galerías y fotografías.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="admin-message admin-message--error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLogin
