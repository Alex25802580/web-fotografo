import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './not-found.css'

const copy = {
  en: { title: 'Page not found', link: 'Back home' },
  es: { title: 'Página no encontrada', link: 'Volver al inicio' },
  ca: { title: 'Pàgina no trobada', link: 'Tornar a l’inici' },
}

function NotFound() {
  const { language } = useLanguage()
  const text = copy[language]

  return (
    <main className="not-found-page">
      <p>404</p>
      <h1>{text.title}</h1>
      <Link to="/">{text.link}</Link>
    </main>
  )
}

export default NotFound
