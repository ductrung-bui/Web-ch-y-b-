import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

/** GET /api/testimonials — lời khen trang chủ */
router.get('/', async (_req, res) => {
  try {
    const testimonials = await query(
      `SELECT id, author_name, trip_title, quote, avatar_url, rating
       FROM customer_testimonials
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`,
    )
    res.json({ testimonials })
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ testimonials: [] })
    }
    throw err
  }
})

export default router
