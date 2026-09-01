import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const getHomeVariant = (search) => {
  const value = new URLSearchParams(search).get('home')
  return ['1', '2', '3', '4', '5'].includes(value) ? value : '1'
}

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const homeVariant = getHomeVariant(location.search)
  const isHome = location.pathname === '/'

  const navigation = [
    { label: t.nav.home, to: '/' },
    { label: t.nav.weddings, to: '/weddings' },
    { label: t.nav.personal, to: '/personal' },
    { label: t.nav.about, to: '/about' },
    { label: t.nav.contact, to: '/contact' },
  ]

  useEffect(() => {
    document.body.classList.toggle('menu-open', isOpen)
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  const handleVariantChange = (event) => {
    const value = event.target.value
    setIsOpen(false)
    navigate(`/?home=${value}`)
  }

  return (
    <header className={`site-header${isHome ? ` home-preview-variant-${homeVariant}` : ''}`}>
      <Link className="brand" to="/" aria-label="Vladimir Studios home" onClick={() => setIsOpen(false)}>
        <img className="brand-logo" src="/vladimir-studios-logo.svg" alt="Vladimir Studios" />
      </Link>

      <button
        className={isOpen ? 'menu-toggle is-open' : 'menu-toggle'}
        type="button"
        aria-expanded={isOpen}
        aria-controls="navigation"
        aria-label={isOpen ? t.menu.close : t.menu.open}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav id="navigation" className={isOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
        {navigation.map((item, index) => (
          <span className="navigation-item-wrap" key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>

            {index === 0 && (
              <label className="home-preview-select-wrap" aria-label="Home design preview">
                <select value={homeVariant} onChange={handleVariantChange}>
                  <option value="1">01</option>
                  <option value="2">02</option>
                  <option value="3">03</option>
                  <option value="4">04</option>
                  <option value="5">05</option>
                </select>
              </label>
            )}
          </span>
        ))}

        <label className="language-select-wrap" aria-label="Language">
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="ca">CAT</option>
          </select>
        </label>
      </nav>
    </header>
  )
}

export default Header
