import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addonsApi, bookingsApi } from '../../../api/endpoints.js'
import { useBooking } from '../../../context/BookingContext.jsx'
import '../pages-data.css'

export default function StepAddonsPage() {
  const navigate = useNavigate()
  const { bookingId, tripId } = useBooking()
  const [addons, setAddons] = useState([])
  const [qty, setQty] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    addonsApi
      .list(tripId || undefined)
      .then((d) => setAddons(d.addons || []))
      .catch((e) => setError(e.message))
  }, [tripId])

  if (!bookingId) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>Chưa có booking. Quay lại bước chọn thời gian.</p>
        <button className="data-page__button" onClick={() => navigate('/chon-thoi-gian-chuyen-di')}>
          Quay lại
        </button>
      </div>
    )
  }

  const set = (id, value) => {
    setQty((q) => ({ ...q, [id]: Math.max(0, Number(value || 0)) }))
  }

  const next = async () => {
    const items = Object.entries(qty)
      .filter(([, q]) => Number(q) > 0)
      .map(([addonServiceId, quantity]) => ({ addonServiceId: Number(addonServiceId), quantity }))
    await bookingsApi.setAddons(bookingId, items)
    navigate('/dien-thong-tin')
  }

  return (
    <div className="data-page">
      <h2 className="data-page__title">Dịch vụ bổ sung</h2>
      {error && <p className="data-page__error">{error}</p>}
      <ul style={{ paddingLeft: '1.2rem' }}>
        {addons.map((a) => (
          <li key={a.id} style={{ margin: '0.4rem 0' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <strong>{a.name}</strong>
              <span>{Number(a.price).toLocaleString('vi-VN')}đ</span>
              <input
                className="data-page__input"
                type="number"
                min={0}
                value={qty[a.id] ?? 0}
                onChange={(e) => set(a.id, e.target.value)}
                style={{ width: 80 }}
              />
            </div>
          </li>
        ))}
      </ul>
      <button className="data-page__button" onClick={next}>
        Tiếp theo: Thông tin
      </button>
    </div>
  )
}

