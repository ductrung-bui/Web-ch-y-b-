import { Router } from 'express'
import { query, queryOne } from '../db.js'

const router = Router()

/** GET /api/articles — kinhnghim */
router.get('/', async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : null
  const articles = await query(
    `SELECT id, slug, title, excerpt, cover_image, author_name, published_at
     FROM articles WHERE status = 'published' ORDER BY published_at DESC${
       limit ? ` LIMIT ${limit}` : ''
     }`,
  )
  res.json({ articles })
})

router.get('/:slug', async (req, res) => {
  const article = await queryOne(
    `SELECT * FROM articles WHERE slug = :slug AND status = 'published'`,
    { slug: req.params.slug },
  )
  if (!article) return res.status(404).json({ error: 'Không tìm thấy bài viết' })
  res.json({ article })
})

export default router
