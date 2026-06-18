import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAGE_API_MAP } from '../api/endpoints.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSearchParams } from 'react-router-dom'
import { PAGE_DATA_LOADERS } from '../pageDataLoaders.js'

export function PageDataPanel({ slug }) {
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const meta = PAGE_API_MAP[slug]
  const loader = PAGE_DATA_LOADERS[slug]
  const needsAuth = [
    'thongtinvedadat',
    'thongtinvedahuy',
    'lichsuchuyendi',
    'thaydoimatkhau',
    'manhinhdienthongtin',
    'manhinhthanhtoan',
  ].includes(slug)

  useEffect(() => {
    if (!loader) return
    if (needsAuth && !isAuthenticated) return

    setLoading(true)
    setError(null)
    loader(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, params.toString(), isAuthenticated, loader, needsAuth])

  if (!loader && !meta?.action) return null

  return (
    <section className="page-data-panel" aria-label="Dữ liệu từ MySQL">
      <header className="page-data-panel__head">
        <strong>Dữ liệu MySQL</strong>
        {meta?.tables && (
          <span className="page-data-panel__tables">
            Bảng: {meta.tables.join(', ')}
          </span>
        )}
        {meta?.action && <span className="page-data-panel__action">{meta.action}</span>}
      </header>

      {needsAuth && !isAuthenticated && (
        <p>
          Cần đăng nhập — <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      )}
      {loading && <p>Đang tải…</p>}
      {error && <p className="page-data-panel__error">{error}</p>}
      {data && <DataPreview slug={slug} data={data} />}
    </section>
  )
}

function DataPreview({ slug, data }) {
  if (slug === 'mnhnhtrangch' && data.trips) {
    return (
      <ul className="page-data-panel__list">
        {data.trips.map((t) => (
          <li key={t.id}>
            <Link to={`/chi-tiet-chuyen-di?tripId=${t.id}`}>
              {t.title} — {Number(t.base_price).toLocaleString('vi-VN')}đ (
              {t.current_participants}/{t.max_participants})
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  if (slug === 'kinhnghim' && data.articles) {
    return (
      <ul className="page-data-panel__list">
        {data.articles.map((a) => (
          <li key={a.id}>
            {a.title} ({a.published_at})
          </li>
        ))}
      </ul>
    )
  }

  if (data.bookings) {
    return (
      <ul className="page-data-panel__list">
        {data.bookings.map((b) => (
          <li key={b.id}>
            {b.booking_code} — {b.trip_title} — <em>{b.status}</em>
            {b.selected_seats_label && ` — ghế ${b.selected_seats_label}`}
          </li>
        ))}
      </ul>
    )
  }

  if (data.trip) {
    return (
      <p>
        {data.trip.title} — {Number(data.trip.base_price).toLocaleString('vi-VN')}đ —{' '}
        {data.schedules?.length ?? 0} lịch khởi hành
      </p>
    )
  }

  return (
    <pre className="page-data-panel__json">
      {JSON.stringify(data, null, 2).slice(0, 1200)}
    </pre>
  )
}
