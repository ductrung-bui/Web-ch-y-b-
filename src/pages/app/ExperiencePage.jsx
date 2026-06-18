import { useEffect, useState } from 'react'
import { articlesApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function ExperiencePage() {
  const [articles, setArticles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    articlesApi
      .list()
      .then((d) => setArticles(d.articles || []))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Kinh nghiệm</h2>
      {error && <p className="data-page__error">{error}</p>}
      {!error && articles.length === 0 && <p className="data-page__empty">Chưa có bài viết.</p>}
      <div className="data-grid">
        {articles.map((a) => (
          <article key={a.id} className="data-card">
            <h3 className="data-card__title">{a.title}</h3>
            <p className="data-card__meta">
              {a.published_at ? new Date(a.published_at).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

