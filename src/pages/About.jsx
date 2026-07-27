import portrait from '../assets/about/diego-carrasco.png'
import { useLanguage } from '../context/LanguageContext'

function About() {
  const { t } = useLanguage()

  return (
    <section className="text-page about-page" aria-labelledby="about-title">
      <div className="about-layout">
        <figure className="about-portrait">
          <img src={portrait} alt={t.about.imageAlt} />
        </figure>
        <div className="about-content">
          <h1 id="about-title">{t.about.titleTop}<br />{t.about.titleBottom}</h1>
          <div className="about-text">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
