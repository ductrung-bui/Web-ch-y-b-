import { Router } from 'express'
import { query, queryOne } from '../db.js'
import { optionalAuth } from '../middleware/auth.js'
import { normalizeTripRow } from '../dataText.js'
import { readSeatStatsForSchedule } from '../scheduleSeats.js'

const router = Router()

/** GET /api/trips/categories */
router.get('/categories/list', async (_req, res) => {
  const categories = await query(
    'SELECT id, code, name, sort_order FROM trip_categories ORDER BY sort_order',
  )
  res.json({ categories })
})

/** GET /api/trips — mnhnhtrangch (tìm kiếm, lọc) */
router.get('/', optionalAuth, async (req, res) => {
  const { category, q, status = 'open' } = req.query
  let sql = `
    SELECT t.id, t.slug, t.title, t.destination, t.short_description,
           t.base_price, t.max_participants, t.current_participants,
           t.duration_label, t.thumbnail_url, t.status,
           c.code AS category_code, c.name AS category_name,
           (SELECT ts.id FROM trip_schedules ts
            WHERE ts.trip_id = t.id AND ts.status = 'open'
            ORDER BY ts.departure_at ASC LIMIT 1) AS next_schedule_id
    FROM trips t
    LEFT JOIN trip_categories c ON c.id = t.category_id
    WHERE t.status = :status`
  const params = { status }

  if (category && category !== 'all') {
    sql += ' AND c.code = :category'
    params.category = category
  }
  if (q) {
    sql += ' AND (t.title LIKE :search OR t.destination LIKE :search)'
    params.search = `%${q}%`
  }
  sql += ' ORDER BY t.id DESC'

  const trips = await query(sql, params)
  const enriched = []
  for (const row of trips) {
    const stats = await readSeatStatsForSchedule(row.next_schedule_id)
    enriched.push(normalizeTripRow({ ...row, ...stats }))
  }
  res.json({ trips: enriched })
})

/** GET /api/trips/:id — mnhnhchititchuyni */
router.get('/:id', async (req, res) => {
  const trip = await queryOne(
    `SELECT t.*, c.name AS category_name, c.code AS category_code
     FROM trips t LEFT JOIN trip_categories c ON c.id = t.category_id
     WHERE t.id = :id OR t.slug = :id`,
    { id: req.params.id },
  )
  if (!trip) return res.status(404).json({ error: 'Không tìm thấy chuyến đi' })

  const schedules = await query(
    `SELECT s.id, s.departure_at, s.return_at, s.price, s.total_seats, s.booked_seats,
            s.status, s.month_label,
            (SELECT COUNT(*) FROM seats st
             WHERE st.trip_schedule_id = s.id AND st.status = 'available') AS available_seats
     FROM trip_schedules s
     WHERE s.trip_id = :tripId AND s.status = 'open'
     ORDER BY s.departure_at`,
    { tripId: trip.id },
  )
  res.json({ trip: normalizeTripRow(trip), schedules })
})

/** GET /api/trips/:id/schedules — manhinhchonthoigianchuyendi */
router.get('/:id/schedules', async (req, res) => {
  const trip = await queryOne('SELECT id FROM trips WHERE id = :id OR slug = :id', {
    id: req.params.id,
  })
  if (!trip) return res.status(404).json({ error: 'Không tìm thấy chuyến' })

  const schedules = await query(
    `SELECT * FROM trip_schedules WHERE trip_id = :tripId ORDER BY departure_at`,
    { tripId: trip.id },
  )
  res.json({ schedules })
})

export default router
