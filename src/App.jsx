import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import Overview from './pages/Overview'
import About from './pages/About'
import Contact from './pages/Contact'
import CategoryPage from './pages/CategoryPage'
import GalleryPage from './pages/GalleryPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import './admin.css'
import './admin-upload.css'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAdminDashboard = location.pathname === '/admin'

  return (
    <>
      {!isAdminRoute && <Header />}
      {isAdminDashboard && <Link className="admin-home-button" to="/">Home</Link>}
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/weddings" element={<CategoryPage />} />
        <Route path="/personal" element={<CategoryPage />} />
        <Route path="/category/:categorySlug" element={<CategoryPage />} />
        <Route path="/gallery/:gallerySlug" element={<GalleryPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
      <ScrollToTop />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
