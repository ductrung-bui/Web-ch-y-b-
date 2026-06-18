import { Router } from 'express'
import { query, queryOne } from '../db.js'
import { optionalAuth } from '../middleware/auth.js'
import { ensureSeatsForSchedule } from '../scheduleSeats.js'

const router = Router()

/** GET /api/schedules/calendar — lchtrongthng */
router.get('/calendar', async (req, res) => {
  const { month } = req.query
  let sql = `
    SELECT s.id, s.trip_id, s.departure_at, s.price, s.month_label, s.status,
           t.title AS trip_title
    FROM trip_schedules s
    JOIN trips t ON t.id = s.trip_id
    WHERE 1=1`
  const params = {}
  if (month) {
    sql += ' AND s.month_label = :month'
    params.month = month
  }
  sql += ' ORDER BY s.departure_at'
  const schedules = await query(sql, params)
  res.json({ schedules })
})

/** GET /api/schedules/:scheduleId/seats — manhinhchonvitrighengoi */
router.get('/:scheduleId/seats', optionalAuth, async (req, res) => {
  const scheduleId = req.params.scheduleId
  let bookingId = req.query.bookingId ? Number(req.query.bookingId) : null

  if (bookingId && req.user) {
    const own = await queryOne(
      `SELECT id, status FROM bookings WHERE id = :id AND user_id = :userId`,
      { id: bookingId, userId: req.user.id },
    )
    if (!own) {
      bookingId = null
    } else if (['draft', 'pending_payment'].includes(own.status)) {
      await query(
        `UPDATE seats s
         INNER JOIN booking_seats bs ON bs.seat_id = s.id
         SET s.status = 'held'
         WHERE bs.booking_id = :bookingId
           AND s.trip_schedule_id = :scheduleId
           AND s.status = 'booked'`,
        { bookingId, scheduleId },
      )
    }
  } else {
    bookingId = null
  }

  await ensureSeatsForSchedule(scheduleId)

  const seatParams = { scheduleId, bookingId: bookingId || 0 }
  const seats = await query(
    `SELECT s.id, s.seat_number, s.seat_row, s.seat_col, s.is_door, s.status,
            CASE WHEN bs.booking_id IS NOT NULL THEN 1 ELSE 0 END AS is_mine
     FROM seats s
     LEFT JOIN booking_seats bs
       ON bs.seat_id = s.id AND bs.booking_id = :bookingId
     WHERE s.trip_schedule_id = :scheduleId
     ORDER BY s.seat_number`,
    seatParams,
  )

  const schedule = await queryOne(
    `SELECT s.*, t.title AS trip_title,
            (SELECT COUNT(*) FROM seats st
             WHERE st.trip_schedule_id = s.id AND st.status = 'available') AS available_seats
     FROM trip_schedules s
     JOIN trips t ON t.id = s.trip_id WHERE s.id = :id`,
    { id: scheduleId },
  )
  res.json({ schedule, seats })
})

export default router
