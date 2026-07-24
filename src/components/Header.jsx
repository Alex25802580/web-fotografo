import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Weddings', to: '/weddings' },
  { label: 'Personal', to: '/personal' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function Header() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', isOpen)
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={() => setIsOpen(false)}>Diego Carrasco</Link>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>

      <nav id="navigation" className={isOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
        {navigation.map((item) => (
          <Link key={item.label} to={item.to} onClick={() => setIsOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export default Header
