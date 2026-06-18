import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { queryOne } from '../db.js'

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, roleId: user.role_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  )
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập' })
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret)
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role_id, r.code AS role_code
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = :id AND u.status = 'active'`,
      { id: payload.sub },
    )
    if (!user) return res.status(401).json({ error: 'Tài khoản không hợp lệ' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' })
  }
}

export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()
  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret)
    req.user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role_id
       FROM users u WHERE u.id = :id AND u.status = 'active'`,
      { id: payload.sub },
    )
  } catch {
    /* ignore */
  }
  next()
}
