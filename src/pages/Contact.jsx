import { useState } from 'react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maqrlwlw'

function Contact() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.errors?.map((item) => item.message).join(' ') || 'The message could not be sent.'
        throw new Error(message)
      }

      form.reset()
      setStatus('success')
    } catch (submitError) {
      setStatus('error')
      setError(submitError.message || 'The message could not be sent. Please try again.')
    }
  }

  return (
    <section className="text-page contact-page" aria-labelledby="contact-title">
      <form className="contact-form" onSubmit={handleSubmit} aria-label="Contact form">
        <h1 id="contact-title">Contact</h1>

        <label>
          Name
          <input type="text" name="name" autoComplete="name" required />
        </label>

        <label>
          Email
          <input type="email" name="email" autoComplete="email" required />
        </label>

        <label>
          Phone
          <input type="tel" name="phone" autoComplete="tel" />
        </label>

        <label>
          Message
          <textarea name="message" rows="6" required />
        </label>

        <input type="hidden" name="_subject" value="New enquiry from Diego Carrasco's website" />

        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>

        {status === 'success' && (
          <p className="form-notice" role="status">
            Message sent successfully. Thank you for getting in touch.
          </p>
        )}

        {status === 'error' && (
          <p className="form-notice form-notice--error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

export default Contact