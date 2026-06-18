import { useEffect, useState } from 'react'
import { schedulesApi } from '../../api/endpoints.js'
import './pages-data.css'

export default function CalendarPage() {
  const [month, setMonth] = useState('')
  const [schedules, setSchedules] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const d = await schedulesApi.calendar(month || undefined)
      setSchedules(d.schedules || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="data-page">
      <h2 className="data-page__title">Lịch trong tháng</h2>
      <div className="data-page__controls">
        <input
          className="data-page__input"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="Ví dụ: Tháng 4"
        />
        <button className="data-page__button" onClick={load}>
          Xem
        </button>
      </div>
      {error && <p className="data-page__error">{error}</p>}
      {!error && schedules.length === 0 && <p className="data-page__empty">Chưa có lịch chạy.</p>}
      <div className="data-grid">
        {schedules.map((s) => (
          <article key={s.id} className="data-card">
            <h3 className="data-card__title">{s.trip_title}</h3>
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

