import { useEffect, useState } from 'react'

const navigation = [
  { label: 'Overview', href: '#selected-work' },
  { label: 'Weddings', href: '#weddings' },
  { label: 'Couples', href: '#couples' },
  { label: 'Editorial', href: '#editorial' },
  { label: 'Personal', href: '#personal' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

function Header() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', isOpen)
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={() => setIsOpen(false)}>Diego Carrasco</a>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{isOpen ? 'Close' : 'Menu'}</span>
      </button>

      <nav id="navigation" className={isOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
        {navigation.map((item) => (
          <a key={item.label} href={item.href} onClick={() => setIsOpen(false)}>{item.label}</a>
        ))}
      </nav>
    </header>
  )
}

export default Header
