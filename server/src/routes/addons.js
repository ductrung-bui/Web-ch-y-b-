import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

/** GET /api/addons — dichvubosung */
router.get('/', async (req, res) => {
  const { tripId } = req.query
  let sql = `SELECT * FROM addon_services WHERE is_active = 1`
  const params = {}
  if (tripId) {
    sql += ' AND (trip_id = :tripId OR trip_id IS NULL)'
    params.tripId = tripId
  }
  sql += ' ORDER BY id'
  const addons = await query(sql, params)
  res.json({ addons })
})

export default router
