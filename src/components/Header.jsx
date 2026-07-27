import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()
  const { language, setLanguage, t } = useLanguage()

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

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="site-header">
      <Link className="brand" to="/">Diego Carrasco</Link>

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
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            {item.label}
          </NavLink>
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
