import { projects } from '../data/projects'

function PortfolioGrid() {
  return (
    <section className="section portfolio" id="trabajo" aria-labelledby="work-title">
      <div className="section-heading">
        <p className="section-index">01 / Trabajo seleccionado</p>
        <h2 id="work-title">Una mirada atenta<br />a lo cotidiano.</h2>
      </div>

      <div className="project-grid">
        {projects.map((project, index) => (
          <article className={`project project--${index + 1}`} key={project.id}>
            <a href="#contacto" aria-label={`Consultar proyecto ${project.title}`}>
              <div className="project-image-wrap">
                <img
                  src={project.image}
                  alt=""
                  className="project-image"
                  style={{ objectPosition: project.position }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="project-meta">
                <h3>{project.title}</h3>
                <p>{project.category} · {project.year}</p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PortfolioGrid
