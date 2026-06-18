import { query, queryOne } from './db.js'
import { syncScheduleSeatStats } from './scheduleSeats.js'

const DRAFT_STATUSES = ['draft', 'pending_payment']

/** Trả ghế của đơn nháp/chờ TT về available trước khi gán lại */
export async function releaseBookingSeats(bookingId, scheduleId) {
  const rows = await query(
    `SELECT bs.seat_id FROM booking_seats bs
     JOIN seats s ON s.id = bs.seat_id
     WHERE bs.booking_id = :bookingId AND s.trip_schedule_id = :scheduleId`,
    { bookingId, scheduleId },
  )
  for (const row of rows) {
    await query(
      `UPDATE seats SET status = 'available'
       WHERE id = :seatId AND trip_schedule_id = :scheduleId
         AND status IN ('held', 'booked')`,
      { seatId: row.seat_id, scheduleId },
    )
  }
  await query('DELETE FROM booking_seats WHERE booking_id = :bookingId', { bookingId })
  await syncScheduleSeatStats(scheduleId)
}

/** Giữ chỗ tạm (held) — chỉ chuyển booked khi thanh toán xác nhận */
export async function holdSeatsForBooking(bookingId, scheduleId, seatIds) {
  await releaseBookingSeats(bookingId, scheduleId)
  for (const seatId of seatIds) {
    await query(
      `INSERT INTO booking_seats (booking_id, seat_id) VALUES (:bookingId, :seatId)`,
      { bookingId, seatId },
    )
    await query(
      `UPDATE seats SET status = 'held'
       WHERE id = :seatId AND trip_schedule_id = :scheduleId
         AND status = 'available'`,
      { seatId, scheduleId },
    )
  }
  await syncScheduleSeatStats(scheduleId)
}

/** Sau thanh toán / xác nhận — held → booked */
export async function confirmBookingSeats(bookingId, scheduleId) {
  await query(
    `UPDATE seats s
     INNER JOIN booking_seats bs ON bs.seat_id = s.id
     SET s.status = 'booked'
     WHERE bs.booking_id = :bookingId AND s.trip_schedule_id = :scheduleId
       AND s.status = 'held'`,
    { bookingId, scheduleId },
  )
  await syncScheduleSeatStats(scheduleId)
}

export async function isDraftBooking(booking) {
  return booking && DRAFT_STATUSES.includes(booking.status)
}
