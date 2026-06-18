import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query, queryOne, execute } from '../db.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { removeUserAvatarFiles, saveUserAvatar } from '../avatarStorage.js'

const router = Router()

/** POST /api/auth/register — dangky */
router.post('/register', async (req, res) => {
  const { email, password, fullName, phone } = req.body
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Thiếu email, mật khẩu hoặc họ tên' })
  }
  const exists = await queryOne('SELECT id FROM users WHERE email = :email', { email })
  if (exists) return res.status(409).json({ error: 'Email đã được đăng ký' })

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await execute(
    `INSERT INTO users (role_id, email, password_hash, full_name, phone, email_verified_at)
     VALUES (1, :email, :passwordHash, :fullName, :phone, NULL)`,
    { email, passwordHash, fullName, phone: phone || null },
  )
  const user = await queryOne(
    'SELECT id, email, full_name, phone, role_id FROM users WHERE id = :id',
    { id: result.insertId },
  )
  const token = signToken(user)
  res.status(201).json({ token, user: mapUser(user) })
})

/** POST /api/auth/login — dangnhap */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
  }
  const user = await queryOne(
    `SELECT id, email, password_hash, full_name, phone, avatar_url, role_id, status
     FROM users WHERE email = :email`,
    { email },
  )
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
  }
  const hash = user.password_hash || ''
  if (!hash.startsWith('$2')) {
    return res.status(500).json({
      error:
        'Mật khẩu trong database chưa được mã hóa. Chạy file database/fix-passwords.sql trong MySQL Workbench.',
    })
  }
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })

  const token = signToken(user)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await query(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, expires_at)
     VALUES (:userId, :tokenHash, :ip, :expiresAt)`,
    {
      userId: user.id,
      tokenHash,
      ip: req.ip,
      expiresAt: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
    },
  )
  res.json({ token, user: mapUser(user) })
})

/** POST /api/auth/logout — dangxuat */
router.post('/logout', requireAuth, async (req, res) => {
  const header = req.headers.authorization
  const token = header.slice(7)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await query(
    `UPDATE user_sessions SET revoked_at = NOW()
     WHERE user_id = :userId AND token_hash = :tokenHash AND revoked_at IS NULL`,
    { userId: req.user.id, tokenHash },
  )
  res.json({ ok: true })
})

/** GET /api/auth/me */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: mapUser(req.user) })
})

/** POST /api/auth/forgot-password — nhapemailkhoiphuc */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Nhập email' })
  const user = await queryOne('SELECT id FROM users WHERE email = :email', { email })
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (:userId, :tokenHash, :expiresAt)`,
      {
        userId: user.id,
        tokenHash,
        expiresAt: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
      },
    )
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        message: 'Đã gửi hướng dẫn khôi phục (dev: dùng resetToken bên dưới)',
        resetToken: rawToken,
      })
    }
  }
  res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận hướng dẫn khôi phục' })
})

/** POST /api/auth/reset-password — khoiphucmatkhau */
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu mới' })
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const row = await queryOne(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = :tokenHash AND used_at IS NULL AND expires_at > NOW()`,
    { tokenHash },
  )
  if (!row) return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })

  const passwordHash = await bcrypt.hash(password, 10)
  await query('UPDATE users SET password_hash = :hash WHERE id = :id', {
    hash: passwordHash,
    id: row.user_id,
  })
  await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = :id', {
    id: row.id,
  })
  res.json({ message: 'Đã đổi mật khẩu thành công' })
})

/** PUT /api/auth/profile — cập nhật họ tên, SĐT */
router.put('/profile', requireAuth, async (req, res) => {
  const fullName = String(req.body.fullName || '').trim()
  const phone = String(req.body.phone || '').trim()

  if (!fullName) {
    return res.status(400).json({ error: 'Họ và tên không được để trống' })
  }

  await query(
    `UPDATE users SET full_name = :fullName, phone = :phone WHERE id = :id`,
    { fullName, phone: phone || null, id: req.user.id },
  )

  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role_id
     FROM users u WHERE u.id = :id`,
    { id: req.user.id },
  )
  res.json({ user: mapUser(user) })
})

/** PUT /api/auth/avatar — tải ảnh đại diện (data URL base64) */
router.put('/avatar', requireAuth, async (req, res) => {
  try {
    const avatarUrl = await saveUserAvatar(req.user.id, req.body?.dataUrl)
    await query('UPDATE users SET avatar_url = :avatarUrl WHERE id = :id', {
      avatarUrl,
      id: req.user.id,
    })
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role_id
       FROM users u WHERE u.id = :id`,
      { id: req.user.id },
    )
    res.json({ user: mapUser(user), message: 'Đã cập nhật ảnh đại diện' })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Không lưu được ảnh' })
  }
})

/** DELETE /api/auth/avatar — xóa ảnh đại diện */
router.delete('/avatar', requireAuth, async (req, res) => {
  await removeUserAvatarFiles(req.user.id)
  await query('UPDATE users SET avatar_url = NULL WHERE id = :id', { id: req.user.id })
  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role_id
     FROM users u WHERE u.id = :id`,
    { id: req.user.id },
  )
  res.json({ user: mapUser(user), message: 'Đã xóa ảnh đại diện' })
})

/** PUT /api/auth/change-password — thaydoimatkhau */
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Thiếu mật khẩu' })
  }
  if (confirmPassword != null && confirmPassword !== newPassword) {
    return res.status(400).json({ error: 'Xác nhận mật khẩu không khớp' })
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'Mật khẩu mới tối thiểu 8 ký tự' })
  }
  const user = await queryOne('SELECT password_hash FROM users WHERE id = :id', {
    id: req.user.id,
  })
  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' })

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await query('UPDATE users SET password_hash = :hash WHERE id = :id', {
    hash: passwordHash,
    id: req.user.id,
  })
  res.json({ message: 'Đã thay đổi mật khẩu' })
})

function mapUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    avatarUrl: u.avatar_url?.trim() || null,
    roleId: u.role_id,
    roleCode: u.role_code,
  }
}

export default router
