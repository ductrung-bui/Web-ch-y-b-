import { useEffect, useState } from 'react'
import { contentApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function IntroPage() {
  const [pages, setPages] = useState([])
  const [contacts, setContacts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([contentApi.pages(), contentApi.contacts()])
      .then(([pagesData, contactsData]) => {
        setPages(pagesData.pages || [])
        setContacts(contactsData.contacts || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Giới thiệu</h2>
      {error && <p className="data-page__error">{error}</p>}

      <div className="data-grid" style={{ marginBottom: '0.75rem' }}>
        {pages.map((page) => (
          <article key={page.id || page.slug} className="data-card">
            <h3 className="data-card__title">{page.title || page.slug}</h3>
            <p className="data-card__meta">{page.summary || 'Nội dung giới thiệu'}</p>
          </article>
        ))}
      </div>

      <div className="data-grid">
        {contacts.map((contact) => (
          <article key={contact.id || contact.type} className="data-card">
            <h3 className="data-card__title">{contact.label || contact.type || 'Liên hệ'}</h3>
            <p className="data-card__meta">{contact.value || contact.content || '-'}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

