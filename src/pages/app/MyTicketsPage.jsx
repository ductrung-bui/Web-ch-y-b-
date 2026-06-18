import { useEffect, useState } from 'react'
import { bookingsApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function MyTicketsPage() {
  const [tab, setTab] = useState('active')
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    bookingsApi
      .mine(tab === 'active' ? 'active' : 'cancelled')
      .then((d) => setBookings(d.bookings || []))
      .catch((e) => setError(e.message))
  }, [tab])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Vé của tôi</h2>
      <div className="data-page__controls">
        <button className="data-page__button" onClick={() => setTab('active')} disabled={tab === 'active'}>
          Hiện tại
        </button>
        <button
          className="data-page__button"
          onClick={() => setTab('cancelled')}
          disabled={tab === 'cancelled'}
        >
          Đã hủy
        </button>
      </div>
      {error && <p className="data-page__error">{error}</p>}
      {!error && bookings.length === 0 && <p className="data-page__empty">Bạn chưa có vé nào.</p>}
      <div className="data-grid">
        {bookings.map((b) => (
          <article key={b.id} className="data-card">
            <h3 className="data-card__title">{b.trip_title}</h3>
            <p className="data-card__meta">
              {new Date(b.departure_at).toLocaleDateString('vi-VN')} - {b.status}
              {b.selected_seats_label ? ` - ghế ${b.selected_seats_label}` : ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

