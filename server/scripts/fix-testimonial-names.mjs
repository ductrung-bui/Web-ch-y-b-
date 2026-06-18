/**
 * Cập nhật tên + avatar lời khen trong DB.
 * Chạy: npm run fix:testimonial-names
 */
import mysql from 'mysql2/promise'
import { config } from '../src/config.js'

const conn = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: 'utf8mb4',
})

await conn.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci')

const rows = [
  [1, 'Sơn Tùng MTP', '/avatars/testimonials/son-tung-3-8362.jpg'],
  [2, 'Bích Phương', '/avatars/testimonials/bich-phuong.webp'],
  [3, 'Quân A.P', '/avatars/testimonials/Quan-ap.png'],
]

for (const [id, name, avatar] of rows) {
  const [result] = await conn.execute(
    `UPDATE customer_testimonials SET author_name = ?, avatar_url = ? WHERE id = ?`,
    [name, avatar, id],
  )
  console.log(`id=${id} → ${name} (${result.affectedRows} row)`)
}

await conn.end()
console.log('Done.')
