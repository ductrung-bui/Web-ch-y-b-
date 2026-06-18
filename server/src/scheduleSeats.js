import { query, queryOne } from './db.js'

const DEFAULT_ROWS = 10
const DEFAULT_COLS = 4
const GRID_SIZE = DEFAULT_ROWS * DEFAULT_COLS

function nextFreeSeatNumber(occupiedNumbers) {
  for (let n = 1; n <= GRID_SIZE; n += 1) {
    const key = String(n)
    if (!occupiedNumbers.has(key)) return key
  }
  return null
}

export async function syncScheduleSeatStats(scheduleId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS total,
            SUM(status = 'booked') AS booked,
            SUM(status = 'available') AS available
     FROM seats WHERE trip_schedule_id = :scheduleId`,
    { scheduleId },
  )
  if (!row?.total) return row
  await query(
    `UPDATE trip_schedules
     SET total_seats = :total, booked_seats = :booked
     WHERE id = :scheduleId`,
    {
      scheduleId,
      total: Number(row.total),
      booked: Number(row.booked || 0),
    },
  )
  return row
}

/** Bổ sung ô trống trên lưới — tránh trùng seat_number (seed có ghế 31–34) */
export async function ensureSeatsForSchedule(scheduleId) {
  if (!scheduleId) return

  const existing = await query(
    `SELECT seat_row, seat_col, seat_number FROM seats WHERE trip_schedule_id = :scheduleId`,
    { scheduleId },
  )
  const occupiedRc = new Set(
    existing.map((s) => `${Number(s.seat_row)}-${Number(s.seat_col)}`),
  )
  const occupiedNumbers = new Set(existing.map((s) => String(s.seat_number)))

  for (let row = 1; row <= DEFAULT_ROWS; row += 1) {
    for (let col = 1; col <= DEFAULT_COLS; col += 1) {
      if (occupiedRc.has(`${row}-${col}`)) continue

      let seatNumber = String((row - 1) * DEFAULT_COLS + col)
      if (occupiedNumbers.has(seatNumber)) {
        seatNumber = nextFreeSeatNumber(occupiedNumbers)
        if (!seatNumber) continue
      }

      await query(
        `INSERT INTO seats (trip_schedule_id, seat_number, seat_row, seat_col, status)
         VALUES (:scheduleId, :seatNumber, :row, :col, 'available')`,
        { scheduleId, seatNumber, row, col },
      )
      occupiedRc.add(`${row}-${col}`)
      occupiedNumbers.add(seatNumber)
    }
  }
  await syncScheduleSeatStats(scheduleId)
}

async function countSeatsFromTable(scheduleId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS seat_total,
            SUM(status = 'booked') AS seat_booked,
            SUM(status = 'available') AS seat_available
     FROM seats WHERE trip_schedule_id = :scheduleId`,
    { scheduleId },
  )
  return {
    seat_total: Number(row?.seat_total || 0),
    seat_booked: Number(row?.seat_booked || 0),
    seat_available: Number(row?.seat_available || 0),
  }
}

/** Trang chủ / danh sách — chỉ đọc, không INSERT (tránh 500 + chậm) */
export async function readSeatStatsForSchedule(scheduleId) {
  if (!scheduleId) {
    return { seat_total: 0, seat_booked: 0, seat_available: 0 }
  }

  const fromSeats = await countSeatsFromTable(scheduleId)
  if (fromSeats.seat_total > 0) return fromSeats

  const sched = await queryOne(
    `SELECT total_seats, booked_seats FROM trip_schedules WHERE id = :scheduleId`,
    { scheduleId },
  )
  if (!sched) {
    return { seat_total: 0, seat_booked: 0, seat_available: 0 }
  }

  const total = Number(sched.total_seats) || 0
  const booked = Number(sched.booked_seats) || 0
  return {
    seat_total: total,
    seat_booked: booked,
    seat_available: Math.max(0, total - booked),
  }
}

/** Màn chọn ghế — đảm bảo đủ lưới rồi đếm */
export async function loadSeatStatsForSchedule(scheduleId) {
  if (!scheduleId) {
    return { seat_total: 0, seat_booked: 0, seat_available: 0 }
  }
  await ensureSeatsForSchedule(scheduleId)
  return countSeatsFromTable(scheduleId)
}
