import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import Overview from './pages/Overview'
import About from './pages/About'
import Contact from './pages/Contact'
import CategoryPage from './pages/CategoryPage'
import GalleryPage from './pages/GalleryPage'
import './public-gallery.css'

const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminHomePhotos = lazy(() => import('./pages/AdminHomePhotos'))
const NotFound = lazy(() => import('./pages/NotFound'))

function AdminPage() {
  return (
    <>
      <AdminDashboard />
      <AdminHomePhotos />
    </>
  )
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Header />}
      <Suspense fallback={<main className="route-loading" aria-label="Loading" />}>
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
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
      <ScrollToTop />
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
