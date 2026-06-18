import { Router } from 'express'
import { query, queryOne } from '../db.js'

const router = Router()

/** GET /api/content/pages — index */
router.get('/pages', async (_req, res) => {
  const pages = await query(
    `SELECT slug, title, body_html, meta_json, updated_at
     FROM content_pages WHERE published = 1 ORDER BY id`,
  )
  res.json({ pages })
})

router.get('/pages/:slug', async (req, res) => {
  const page = await queryOne(
    `SELECT slug, title, body_html, meta_json FROM content_pages
     WHERE slug = :slug AND published = 1`,
    { slug: req.params.slug },
  )
  if (!page) return res.status(404).json({ error: 'Không tìm thấy trang' })
  res.json({ page })
})

/** GET /api/content/contacts — footer */
router.get('/contacts', async (_req, res) => {
  const contacts = await query(
    `SELECT type, label, value FROM support_contacts
     WHERE is_active = 1 ORDER BY sort_order`,
  )
  res.json({ contacts })
})

export default router
