import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tripsApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function HomePage() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    tripsApi
      .categories()
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await tripsApi.list({
        q: q || undefined,
        category: category === 'all' ? undefined : category,
      })
      setTrips(data.trips || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Trang chủ</h2>
      <div className="data-page__controls">
        <input
          className="data-page__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm chuyến đi"
        />
        <select
          className="data-page__select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Tất cả</option>
          {categories.map((c) => (
            <option key={c.id} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="data-page__button" onClick={load}>
          Lọc
        </button>
      </div>

      {loading && <p>Đang tải…</p>}
      {error && <p className="data-page__error">{error}</p>}
      {!loading && !error && trips.length === 0 && (
        <p className="data-page__empty">Chưa có chuyến đi phù hợp. Bạn thử đổi bộ lọc hoặc từ khóa.</p>
      )}
      <div className="data-grid">
        {trips.map((t) => (
          <article key={t.id} className="data-card">
            <h3 className="data-card__title">
              <Link to={`/chuyen-di/${t.id}`}>{t.title}</Link>
            </h3>
            <p className="data-card__meta">
              {Number(t.base_price).toLocaleString('vi-VN')}đ - {t.current_participants}/
              {t.max_participants} người
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

