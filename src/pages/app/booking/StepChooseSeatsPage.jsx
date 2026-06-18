import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi, schedulesApi } from '../../../api/endpoints.js'
import { useBooking } from '../../../context/BookingContext.jsx'
import '../pages-data.css'

export default function StepChooseSeatsPage() {
  const navigate = useNavigate()
  const { bookingId, scheduleId } = useBooking()
  const [seats, setSeats] = useState([])
  const [picked, setPicked] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!scheduleId) return
    setError('')
    schedulesApi
      .seats(scheduleId)
      .then((d) => setSeats(d.seats || []))
      .catch((e) => setError(e.message))
  }, [scheduleId])

  if (!bookingId || !scheduleId) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>Chưa có thông tin đặt vé. Quay lại bước chọn thời gian.</p>
        <button className="data-page__button" onClick={() => navigate('/chon-thoi-gian-chuyen-di')}>
          Quay lại
        </button>
      </div>
    )
  }

  const toggle = (id) => {
    const seat = seats.find((s) => s.id === id)
    if (!seat || seat.status !== 'available') return
    const next = new Set(picked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setPicked(next)
  }

  const next = async () => {
    const ids = Array.from(picked)
    await bookingsApi.setSeats(bookingId, ids)
    navigate('/dich-vu-bo-sung')
  }

  return (
    <div className="data-page">
      <h2 className="data-page__title">Chọn vị trí ghế</h2>
      {error && <p className="data-page__error">{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {seats.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            disabled={s.status !== 'available'}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: picked.has(s.id) ? '#2874de' : s.status === 'available' ? '#fff' : '#eee',
              color: picked.has(s.id) ? '#fff' : '#111',
              cursor: s.status === 'available' ? 'pointer' : 'not-allowed',
            }}
          >
            {s.seat_number}
          </button>
        ))}
      </div>
      <p>Đã chọn: {picked.size}</p>
      <button className="data-page__button" onClick={next} disabled={picked.size === 0}>
        Tiếp theo: Dịch vụ bổ sung
      </button>
    </div>
  )
}

