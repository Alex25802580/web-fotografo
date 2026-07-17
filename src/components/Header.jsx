import { useEffect, useState } from 'react'

const links = [
  { label: 'Trabajo', href: '#trabajo' },
  { label: 'Sobre mí', href: '#sobre-mi' },
  { label: 'Contacto', href: '#contacto' },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Inicio">
        <span>Álex</span> <span>Rivera</span>
      </a>

      <button
        className="menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav id="main-navigation" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Principal">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default Header
