function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true" />
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow">Fotografía documental y editorial</p>
        <h1 id="hero-title">Historias que<br />permanecen.</h1>
        <a className="text-link text-link--light" href="#trabajo">
          Ver proyectos <ArrowIcon />
        </a>
      </div>
      <p className="hero-location">Madrid · Disponible internacionalmente</p>
      <a className="scroll-cue" href="#trabajo" aria-label="Ir al trabajo seleccionado">
        <span />
      </a>
    </section>
  )
}

export default Hero
