import Header from './components/Header'
import Hero from './components/Hero'
import PortfolioGrid from './components/PortfolioGrid'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PortfolioGrid />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
