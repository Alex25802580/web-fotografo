import Header from './components/Header'
import EditorialGallery from './components/EditorialGallery'

function App() {
  return (
    <>
      <Header />
      <main>
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
