/**
 * Sửa password_hash plain text → bcrypt (Password@123)
 * Chạy: node server/scripts/fix-passwords.mjs
 */
import bcrypt from 'bcryptjs'
import { execute, query } from '../src/db.js'

const DEFAULT_PASSWORD = 'Password@123'

const users = await query('SELECT id, email, password_hash FROM users')
const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

let fixed = 0
const force = process.argv.includes('--force')

for (const u of users) {
  const needsFix = force || !u.password_hash?.startsWith('$2')
  if (!needsFix) {
    const ok = await bcrypt.compare(DEFAULT_PASSWORD, u.password_hash)
    if (ok) continue
  }
  await execute('UPDATE users SET password_hash = :h WHERE id = :id', {
    h: hash,
    id: u.id,
  })
  console.log('Đã sửa:', u.email)
  fixed++
}

console.log(
  fixed
    ? `Xong. Mật khẩu: ${DEFAULT_PASSWORD}`
    : `Tất cả user đã dùng bcrypt và khớp ${DEFAULT_PASSWORD}.`,
)
process.exit(0)
