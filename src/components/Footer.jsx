function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Álex Rivera</p>
      <div className="social-links">
        <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.behance.net" target="_blank" rel="noreferrer">Behance</a>
      </div>
      <a href="#inicio">Volver arriba ↑</a>
    </footer>
  )
}

export default Footer
