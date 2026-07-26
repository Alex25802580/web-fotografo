import portrait from '../assets/about/diego-carrasco.png'

function About() {
  return (
    <section className="text-page about-page" aria-labelledby="about-title">
      <div className="about-layout">
        <figure className="about-portrait">
          <img src={portrait} alt="Portrait of Diego Carrasco" />
        </figure>
        <div className="about-content">
          <h1 id="about-title">The extraordinary<br />lives in the real.</h1>
          <div className="about-text">
            <p>
              I’m Diego Carrasco, a wedding photographer with a documentary and deeply personal
              approach. I’m drawn to gestures that happen without warning, imperfect light, and
              everything that makes a celebration truly belong to the people living it.
            </p>
            <p>
              My work moves away from classic formulas and images built to repeat what we already
              know. I’m not interested in turning a wedding into a posed photo session, but in
              following it closely and creating an honest, vivid story full of nuance.
            </p>
            <p>
              Every story has its own rhythm. That’s why I combine quiet portraits, spontaneous
              scenes, unexpected details, and imperfect moments that often become the ones that
              matter most with time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About