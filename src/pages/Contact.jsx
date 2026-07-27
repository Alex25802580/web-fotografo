import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maqrlwlw'

function Contact() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const { t } = useLanguage()

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
        const message = data?.errors?.map((item) => item.message).join(' ') || t.contact.error
        throw new Error(message)
      }

      form.reset()
      setStatus('success')
    } catch (submitError) {
      setStatus('error')
      setError(submitError.message || t.contact.retry)
    }
  }

  return (
    <section className="text-page contact-page" aria-labelledby="contact-title">
      <form className="contact-form" onSubmit={handleSubmit} aria-label={t.contact.formLabel}>
        <h1 id="contact-title">{t.contact.title}</h1>

        <label>
          {t.contact.name}
          <input type="text" name="name" autoComplete="name" required />
        </label>

        <label>
          {t.contact.email}
          <input type="email" name="email" autoComplete="email" required />
        </label>

        <label>
          {t.contact.phone}
          <input type="tel" name="phone" autoComplete="tel" />
        </label>

        <label>
          {t.contact.message}
          <textarea name="message" rows="6" required />
        </label>

        <input type="hidden" name="_subject" value={t.contact.subject} />

        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t.contact.sending : t.contact.send}
        </button>

        {status === 'success' && (
          <p className="form-notice" role="status">
            {t.contact.success}
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
