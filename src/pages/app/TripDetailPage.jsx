import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tripsApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function TripDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    tripsApi
      .detail(id)
      .then(setData)
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="data-page data-page__error">{error}</p>
  if (!data?.trip) return <p className="data-page">Đang tải…</p>

  const { trip, schedules } = data
  return (
    <div className="data-page">
      <h2 className="data-page__title">{trip.title}</h2>
      <p>
        Giá vé: <strong>{Number(trip.base_price).toLocaleString('vi-VN')}đ</strong>
      </p>
      {trip.destination && <p>Điểm đến: {trip.destination}</p>}
      {trip.duration_label && <p>Thời gian: {trip.duration_label}</p>}
      <p>
        <Link to={`/chon-thoi-gian-chuyen-di?tripId=${trip.id}`}>Đặt vé</Link>
      </p>

      <h3>Lịch khởi hành</h3>
      <div className="data-grid">
        {(schedules || []).map((s) => (
          <article key={s.id} className="data-card">
            <p className="data-card__meta">
              {new Date(s.departure_at).toLocaleString('vi-VN')} - {Number(s.price).toLocaleString('vi-VN')}
              đ
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

