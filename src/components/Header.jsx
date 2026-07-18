import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Overview', to: '/' },
  { label: 'Weddings', to: '/#selected-work' },
  { label: 'Couples', to: '/#selected-work' },
  { label: 'Editorial', to: '/#selected-work' },
  { label: 'Personal', to: '/#selected-work' },
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
          <NavLink key={item.label} to={item.to} onClick={() => setIsOpen(false)}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Header
