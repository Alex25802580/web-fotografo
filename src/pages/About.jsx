import portrait from '../assets/about/diego-carrasco.png'

function About() {
  return (
    <section className="text-page about-page" aria-labelledby="about-title">
      <div className="about-layout">
        <figure className="about-portrait">
          <img src={portrait} alt="Retrato de Diego Carrasco" />
        </figure>
        <div>
          <p className="page-kicker">About</p>
          <h1 id="about-title">Lo extraordinario<br />vive en lo real.</h1>
          <div className="about-text">
            <p>
              Soy Diego Carrasco, fotógrafo de bodas con una mirada documental y profundamente
              personal. Me interesan los gestos que suceden sin aviso, la luz imperfecta y todo
              aquello que hace que una celebración pertenezca de verdad a quienes la viven.
            </p>
            <p>
              Mi trabajo se aleja de las fórmulas clásicas y de las imágenes construidas para
              repetir lo que ya conocemos. No busco convertir una boda en una sesión de poses,
              sino acompañarla con atención y crear un relato honesto, vivo y lleno de matices.
            </p>
            <p>
              Cada historia pide su propio ritmo. Por eso combino retratos serenos, escenas
              espontáneas, detalles inesperados y momentos imperfectos que, con el tiempo,
              terminan siendo los más importantes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
