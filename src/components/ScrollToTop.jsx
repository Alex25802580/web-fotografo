import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { pathname } = useLocation()
  const hideButton = pathname === '/about' || pathname === '/contact'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 500)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (hideButton) return null

  return (
    <button
      className={isVisible ? 'scroll-top is-visible' : 'scroll-top'}
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  )
}

export default ScrollToTop