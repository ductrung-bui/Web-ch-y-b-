import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../../api/endpoints.js'
import { useBooking } from '../../../context/BookingContext.jsx'
import '../pages-data.css'

export default function StepPaymentPage() {
  const navigate = useNavigate()
  const { bookingId, clearDraft } = useBooking()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    bookingsApi
      .get(bookingId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [bookingId])

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

  const pay = async () => {
    setPaying(true)
    setError('')
    try {
      const res = await bookingsApi.pay(bookingId, 'bank_transfer')
      setMessage(res.message || 'Đã tạo thanh toán')
      clearDraft()
    } catch (e) {
      setError(e.message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="data-page">
      <h2 className="data-page__title">Thanh toán</h2>
      {loading && <p>Đang tải…</p>}
      {error && <p className="data-page__error">{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {data?.booking && (
        <>
          <p>
            Chuyến: <strong>{data.booking.trip_title}</strong>
          </p>
          <p>
            Thời gian: {new Date(data.booking.departure_at).toLocaleString('vi-VN')}
          </p>
          <p>Ghế: {data.booking.selected_seats_label || '(chưa chọn)'}</p>
          <p>
            Tổng: <strong>{Number(data.booking.total_amount).toLocaleString('vi-VN')}đ</strong>
          </p>
        </>
      )}
      <button className="data-page__button" onClick={pay} disabled={paying}>
        {paying ? 'Đang tạo thanh toán…' : 'Xác nhận thanh toán'}
      </button>
      <p style={{ marginTop: '0.75rem' }}>
        Sau khi thanh toán, vào <strong>Vé của tôi</strong> để xem trạng thái.
      </p>
    </div>
  )
}

