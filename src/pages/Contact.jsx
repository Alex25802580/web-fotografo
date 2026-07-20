import { useState } from 'react'

function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="text-page contact-page" aria-labelledby="contact-title">
      <form className="contact-form" onSubmit={handleSubmit} aria-label="Formulario de contacto">
        <h1 id="contact-title">Contacto</h1>
        <label>
          Nombre
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Teléfono
          <input type="tel" name="phone" autoComplete="tel" />
        </label>
        <label>
          Mensaje
          <textarea name="message" rows="6" required />
        </label>
        <button type="submit">Enviar consulta</button>
        {submitted && <p className="form-notice" role="status">Formulario preparado. Conectaremos el envío en una fase posterior.</p>}
      </form>
    </section>
  )
}

export default Contact
