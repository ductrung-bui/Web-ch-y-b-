import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { pingDatabase } from './db.js'
import authRoutes from './routes/auth.js'
import contentRoutes from './routes/content.js'
import articlesRoutes from './routes/articles.js'
import tripsRoutes from './routes/trips.js'
import schedulesRoutes from './routes/schedules.js'
import addonsRoutes from './routes/addons.js'
import bookingsRoutes from './routes/bookings.js'
import testimonialsRoutes from './routes/testimonials.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

app.use('/api', (_req, res, next) => {
  const end = res.end.bind(res)
  res.end = (body, ...args) => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    return end(body, ...args)
  }
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mountain-web-api' })
})

app.get('/api/health/db', async (_req, res) => {
  try {
    const ok = await pingDatabase()
    res.json({ ok, database: config.db.database })
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/trips', tripsRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/addons', addonsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/testimonials', testimonialsRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Lỗi máy chủ', detail: err.message })
})

app.listen(config.port, () => {
  console.log(`API http://localhost:${config.port}`)
  console.log(`Database: ${config.db.database}@${config.db.host}:${config.db.port}`)
})
