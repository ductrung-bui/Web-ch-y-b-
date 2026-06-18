import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../../api/endpoints.js'
import { useBooking } from '../../../context/BookingContext.jsx'
import '../pages-data.css'

export default function StepPassengersPage() {
  const navigate = useNavigate()
  const { bookingId } = useBooking()
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    // lấy ticket_count từ booking
    bookingsApi
      .get(bookingId)
      .then((d) => setBooking(d.booking))
      .catch((e) => setError(e.message))
  }, [bookingId])

  const count = Number(booking?.ticket_count || 1)

  const [passengers, setPassengers] = useState([])
  useEffect(() => {
    setPassengers((prev) => {
      const next = [...prev]
      while (next.length < count) next.push({ fullName: '', phone: '', email: '', idNumber: '', dateOfBirth: '' })
      return next.slice(0, count)
    })
  }, [count])

  const canSubmit = useMemo(
    () => passengers.length > 0 && passengers.every((p) => (p.fullName || '').trim().length > 1),
    [passengers],
  )

  if (!bookingId) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>Chưa có booking.</p>
        <button className="data-page__button" onClick={() => navigate('/chon-thoi-gian-chuyen-di')}>
          Quay lại
        </button>
      </div>
    )
  }

  const update = (idx, key, value) => {
    setPassengers((arr) => arr.map((p, i) => (i === idx ? { ...p, [key]: value } : p)))
  }

  const next = async () => {
    setSaving(true)
    setError('')
    try {
      await bookingsApi.setPassengers(bookingId, passengers)
      navigate('/thanh-toan')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="data-page">
      <h2 className="data-page__title">Thông tin hành khách</h2>
      {error && <p className="data-page__error">{error}</p>}
      {passengers.map((p, idx) => (
        <div key={idx} style={{ margin: '0.75rem 0', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 8 }}>
          <strong>Hành khách {idx + 1}</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              placeholder="Họ và tên"
              value={p.fullName}
              onChange={(e) => update(idx, 'fullName', e.target.value)}
              style={{ padding: '0.5rem' }}
            />
            <input
              placeholder="Số điện thoại"
              value={p.phone}
              onChange={(e) => update(idx, 'phone', e.target.value)}
              style={{ padding: '0.5rem' }}
            />
            <input
              placeholder="Email"
              value={p.email}
              onChange={(e) => update(idx, 'email', e.target.value)}
              style={{ padding: '0.5rem' }}
            />
            <input
              placeholder="CCCD"
              value={p.idNumber}
              onChange={(e) => update(idx, 'idNumber', e.target.value)}
              style={{ padding: '0.5rem' }}
            />
            <input
              placeholder="Ngày sinh (YYYY-MM-DD)"
              value={p.dateOfBirth}
              onChange={(e) => update(idx, 'dateOfBirth', e.target.value)}
              style={{ padding: '0.5rem' }}
            />
          </div>
        </div>
      ))}
      <button className="data-page__button" onClick={next} disabled={!canSubmit || saving}>
        {saving ? 'Đang lưu…' : 'Tiếp theo: Thanh toán'}
      </button>
    </div>
  )
}

