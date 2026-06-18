import { Router } from 'express'
import { query, queryOne, execute } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { enrichBooking } from '../dataText.js'
import {
  confirmBookingSeats,
  holdSeatsForBooking,
  isDraftBooking,
  releaseBookingSeats,
} from '../bookingSeats.js'

const router = Router()
router.use(requireAuth)

function bookingDetailSql() {
  return `
    SELECT b.*, t.id AS trip_id, t.title AS trip_title, t.destination, t.pickup_point,
           t.duration_label, t.thumbnail_url, c.code AS category_code,
           s.departure_at, s.return_at, s.price AS schedule_price
    FROM bookings b
    JOIN trip_schedules s ON s.id = b.trip_schedule_id
    JOIN trips t ON t.id = s.trip_id
    LEFT JOIN trip_categories c ON c.id = t.category_id`
}

/** GET /api/bookings/my — thongtinvedadat, lichsuchuyendi, thongtinvedahuy */
router.get('/my', async (req, res) => {
  const { status } = req.query
  let sql = `${bookingDetailSql()} WHERE b.user_id = :userId`
  const params = { userId: req.user.id }

  if (status === 'active') {
    sql += ` AND b.status IN ('paid','confirmed','completed')`
  } else if (status === 'cancelled') {
    sql += ` AND b.status IN ('cancelled','refunded')`
  } else if (status === 'history') {
    sql += ` AND b.status IN ('completed','cancelled','refunded')`
  }
  sql += ' ORDER BY b.created_at DESC'

  const bookings = await query(sql, params)
  res.json({ bookings: bookings.map(enrichBooking) })
})

/** GET /api/bookings/:id */
router.get('/:id', async (req, res) => {
  const booking = await queryOne(
    `${bookingDetailSql()} WHERE b.id = :id AND b.user_id = :userId`,
    { id: req.params.id, userId: req.user.id },
  )
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy vé' })

  const passengers = await query(
    'SELECT * FROM passengers WHERE booking_id = :id ORDER BY passenger_order',
    { id: booking.id },
  )
  const addons = await query(
    `SELECT ba.*, a.name FROM booking_addons ba
     JOIN addon_services a ON a.id = ba.addon_service_id WHERE ba.booking_id = :id`,
    { id: booking.id },
  )
  const seats = await query(
    `SELECT s.seat_number FROM booking_seats bs
     JOIN seats s ON s.id = bs.seat_id WHERE bs.booking_id = :id`,
    { id: booking.id },
  )
  const payment = await queryOne(
    'SELECT * FROM payments WHERE booking_id = :id ORDER BY id DESC LIMIT 1',
    { id: booking.id },
  )
  res.json({ booking: enrichBooking(booking), passengers, addons, seats, payment })
})

/** POST /api/bookings — bắt đầu đặt vé (draft) */
router.post('/', async (req, res) => {
  const { tripScheduleId, ticketCount = 1 } = req.body
  if (!tripScheduleId) {
    return res.status(400).json({ error: 'Chọn lịch chuyến đi' })
  }

  const schedule = await queryOne(
    'SELECT * FROM trip_schedules WHERE id = :id AND status = \'open\'',
    { id: tripScheduleId },
  )
  if (!schedule) return res.status(404).json({ error: 'Lịch chuyến không khả dụng' })

  const code = `BK${Date.now()}`
  const ticketAmount = Number(schedule.price) * Number(ticketCount)
  const result = await execute(
    `INSERT INTO bookings (
      booking_code, user_id, trip_schedule_id, status,
      ticket_count, ticket_amount, addon_amount, total_amount
    ) VALUES (
      :code, :userId, :scheduleId, 'draft',
      :ticketCount, :ticketAmount, 0, :ticketAmount
    )`,
    {
      code,
      userId: req.user.id,
      scheduleId: tripScheduleId,
      ticketCount,
      ticketAmount,
    },
  )

  const booking = await queryOne('SELECT * FROM bookings WHERE id = :id', {
    id: result.insertId,
  })
  res.status(201).json({ booking })
})

/** PUT /api/bookings/:id/seats */
router.put('/:id/seats', async (req, res) => {
  const { seatIds } = req.body
  const booking = await getOwnBooking(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy' })
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Chọn ít nhất một ghế' })
  }

  if (!isDraftBooking(booking)) {
    return res.status(400).json({ error: 'Không thể đổi ghế ở trạng thái này' })
  }

  const schedule = await queryOne(
    'SELECT price FROM trip_schedules WHERE id = :id',
    { id: booking.trip_schedule_id },
  )
  const unitPrice = Number(schedule?.price || 0)
  const ticketCount = seatIds.length
  const ticketAmount = unitPrice * ticketCount

  await holdSeatsForBooking(booking.id, booking.trip_schedule_id, seatIds)

  const numbers = []
  for (const seatId of seatIds) {
    const s = await queryOne('SELECT seat_number FROM seats WHERE id = :id', { id: seatId })
    if (s) numbers.push(s.seat_number)
  }
  const label = numbers.join(', ')
  await query(
    `UPDATE bookings SET
       ticket_count = :count,
       ticket_amount = :ticketAmount,
       total_amount = :ticketAmount + COALESCE(addon_amount, 0),
       selected_seats_label = :label
     WHERE id = :id`,
    {
      count: ticketCount,
      ticketAmount,
      label,
      id: booking.id,
    },
  )

  const updated = await queryOne('SELECT * FROM bookings WHERE id = :id', { id: booking.id })
  res.json({ booking: updated })
})

/** PUT /api/bookings/:id/addons — dichvubosung */
router.put('/:id/addons', async (req, res) => {
  const { items } = req.body
  const booking = await getOwnBooking(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy' })

  await query('DELETE FROM booking_addons WHERE booking_id = :id', { id: booking.id })
  let addonTotal = 0
  for (const item of items || []) {
    const addon = await queryOne('SELECT * FROM addon_services WHERE id = :id', {
      id: item.addonServiceId,
    })
    if (!addon) continue
    const qty = item.quantity || 1
    const lineTotal = Number(addon.price) * qty
    addonTotal += lineTotal
    await execute(
      `INSERT INTO booking_addons (booking_id, addon_service_id, quantity, unit_price, line_total)
       VALUES (:bookingId, :addonId, :qty, :unitPrice, :lineTotal)`,
      {
        bookingId: booking.id,
        addonId: addon.id,
        qty,
        unitPrice: addon.price,
        lineTotal,
      },
    )
  }
  await query(
    `UPDATE bookings SET addon_amount = :addon, total_amount = ticket_amount + :addon WHERE id = :id`,
    { addon: addonTotal, id: booking.id },
  )
  const updated = await queryOne('SELECT * FROM bookings WHERE id = :id', { id: booking.id })
  res.json({ booking: updated })
})

/** PUT /api/bookings/:id/passengers — manhinhdienthongtin */
router.put('/:id/passengers', async (req, res) => {
  const { passengers } = req.body
  const booking = await getOwnBooking(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy' })

  await query('DELETE FROM passengers WHERE booking_id = :id', { id: booking.id })
  let order = 1
  for (const p of passengers || []) {
    await execute(
      `INSERT INTO passengers (booking_id, passenger_order, full_name, phone, email, id_number, date_of_birth)
       VALUES (:bookingId, :order, :fullName, :phone, :email, :idNumber, :dob)`,
      {
        bookingId: booking.id,
        order: order++,
        fullName: p.fullName,
        phone: p.phone || null,
        email: p.email || null,
        idNumber: p.idNumber || null,
        dob: p.dateOfBirth || null,
      },
    )
  }
  res.json({ ok: true })
})

/** POST /api/bookings/:id/pay — manhinhthanhtoan: xác nhận đặt vé, ghế held → booked */
router.post('/:id/pay', async (req, res) => {
  const { method = 'bank_transfer' } = req.body
  const booking = await getOwnBooking(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy' })

  if (!isDraftBooking(booking)) {
    return res.status(400).json({ error: 'Đơn đặt vé đã được xử lý' })
  }

  const seatRow = await queryOne(
    'SELECT COUNT(*) AS cnt FROM booking_seats WHERE booking_id = :id',
    { id: booking.id },
  )
  if (!Number(seatRow?.cnt)) {
    return res.status(400).json({ error: 'Chưa chọn ghế' })
  }

  const passengerRow = await queryOne(
    'SELECT COUNT(*) AS cnt FROM passengers WHERE booking_id = :id',
    { id: booking.id },
  )
  if (!Number(passengerRow?.cnt)) {
    return res.status(400).json({ error: 'Chưa nhập thông tin hành khách' })
  }

  await confirmBookingSeats(booking.id, booking.trip_schedule_id)

  const payResult = await execute(
    `INSERT INTO payments (booking_id, amount, method, status, transaction_ref, paid_at)
     VALUES (:bookingId, :amount, :method, 'pending', :ref, NULL)`,
    {
      bookingId: booking.id,
      amount: booking.total_amount,
      method,
      ref: `TXN-${Date.now()}`,
    },
  )

  await query(
    `UPDATE bookings SET status = 'confirmed' WHERE id = :id`,
    { id: booking.id },
  )
  await execute(
    `INSERT INTO booking_status_logs (booking_id, from_status, to_status, note, created_by)
     VALUES (:bookingId, :fromS, 'confirmed', 'Khách xác nhận đặt vé', :userId)`,
    { bookingId: booking.id, fromS: booking.status, userId: req.user.id },
  )

  res.json({
    paymentId: payResult.insertId,
    message:
      'Đặt vé thành công! Ghế đã được giữ. Vui lòng chuyển khoản theo thông tin bên trên.',
  })
})

/** POST /api/bookings/:id/cancel — hủy vé */
router.post('/:id/cancel', async (req, res) => {
  const { reason } = req.body
  const booking = await getOwnBooking(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy' })
  if (!['paid', 'confirmed', 'pending_payment'].includes(booking.status)) {
    return res.status(400).json({ error: 'Không thể hủy vé ở trạng thái này' })
  }

  await query(
    `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW() WHERE id = :id`,
    { id: booking.id },
  )
  await releaseBookingSeats(booking.id, booking.trip_schedule_id)
  await execute(
    `INSERT INTO booking_status_logs (booking_id, from_status, to_status, note, created_by)
     VALUES (:bookingId, :fromS, 'cancelled', :note, :userId)`,
    {
      bookingId: booking.id,
      fromS: booking.status,
      note: reason || 'Khách hủy vé',
      userId: req.user.id,
    },
  )
  res.json({ message: 'Đã hủy vé' })
})

async function getOwnBooking(id, userId) {
  return queryOne(
    'SELECT * FROM bookings WHERE id = :id AND user_id = :userId',
    { id, userId },
  )
}

export default router
