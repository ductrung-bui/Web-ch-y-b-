import { useEffect, useState } from 'react'
import { bookingsApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function HistoryPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    bookingsApi
      .mine('history')
      .then((d) => setBookings(d.bookings || []))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Lịch sử</h2>
      {error && <p className="data-page__error">{error}</p>}
      {!error && bookings.length === 0 && <p className="data-page__empty">Chưa có lịch sử chuyến đi.</p>}
      <div className="data-grid">
        {bookings.map((b) => (
          <article key={b.id} className="data-card">
            <h3 className="data-card__title">{b.trip_title}</h3>
            <p className="data-card__meta">
              {b.booking_code} - {b.status}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

