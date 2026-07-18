import Header from './components/Header'
import EditorialGallery from './components/EditorialGallery'

function App() {
  return (
    <>
      <Header />
      <main>
        <section className="intro" aria-label="Portfolio introduction">
          <p>Photographer</p>
          <a className="intro-scroll" href="#selected-work">Selected work ↓</a>
        </section>

        <EditorialGallery />
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Diego Carrasco</p>
        <p>Portfolio preview</p>
      </footer>
    </>
  )
}

export default App
