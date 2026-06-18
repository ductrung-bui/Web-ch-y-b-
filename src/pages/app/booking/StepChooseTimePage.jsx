import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingsApi, tripsApi } from '../../../api/endpoints.js'
import { useBooking } from '../../../context/BookingContext.jsx'
import '../pages-data.css'

export default function StepChooseTimePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setDraft } = useBooking()
  const tripId = params.get('tripId') || '1'

  const [trip, setTrip] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    tripsApi
      .detail(tripId)
      .then((d) => {
        setTrip(d.trip)
        setSchedules(d.schedules || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [tripId])

  const next = async () => {
    if (!selected) return
    const { booking } = await bookingsApi.create({ tripScheduleId: Number(selected), ticketCount: 1 })
    setDraft({ bookingId: booking.id, tripId: Number(tripId), scheduleId: Number(selected) })
    navigate('/chon-vi-tri-ghe')
  }

  return (
    <div className="data-page">
      <h2 className="data-page__title">Chọn thời gian</h2>
      {loading && <p>Đang tải…</p>}
      {error && <p className="data-page__error">{error}</p>}
      {trip && (
        <p>
          <strong>{trip.title}</strong>
        </p>
      )}
      <div className="data-grid">
        {schedules.map((s) => (
          <article key={s.id} className="data-card">
            <label>
              <input
                type="radio"
                name="schedule"
                value={s.id}
                checked={String(selected) === String(s.id)}
                onChange={(e) => setSelected(e.target.value)}
              />{' '}
              {new Date(s.departure_at).toLocaleString('vi-VN')} -{' '}
              {Number(s.price).toLocaleString('vi-VN')}đ
            </label>
          </article>
        ))}
      </div>
      <button className="data-page__button" onClick={next} disabled={!selected}>
        Tiếp theo: Chọn ghế
      </button>
    </div>
  )
}

