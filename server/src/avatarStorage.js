import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const AVATAR_PUBLIC_DIR = path.resolve(__dirname, '../../public/avatars/users')

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_BYTES = 2 * 1024 * 1024

export function ensureAvatarDir() {
  fs.mkdirSync(AVATAR_PUBLIC_DIR, { recursive: true })
}

export function parseAvatarDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') {
    throw new Error('Dữ liệu ảnh không hợp lệ')
  }
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(
    dataUrl.trim(),
  )
  if (!match) {
    throw new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP')
  }
  const mime = match[1].toLowerCase()
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length) throw new Error('File ảnh rỗng')
  if (buffer.length > MAX_BYTES) {
    throw new Error('Ảnh tối đa 2MB')
  }
  return { mime, buffer, ext: MIME_EXT[mime] }
}

export function avatarFilePrefix(userId) {
  return `user-${userId}-`
}

export async function removeUserAvatarFiles(userId) {
  ensureAvatarDir()
  const prefix = avatarFilePrefix(userId)
  const files = await fs.promises.readdir(AVATAR_PUBLIC_DIR)
  await Promise.all(
    files
      .filter((name) => name.startsWith(prefix))
      .map((name) => fs.promises.unlink(path.join(AVATAR_PUBLIC_DIR, name))),
  )
}

export async function saveUserAvatar(userId, dataUrl) {
  const { buffer, ext } = parseAvatarDataUrl(dataUrl)
  ensureAvatarDir()
  await removeUserAvatarFiles(userId)
  const filename = `${avatarFilePrefix(userId)}${Date.now()}.${ext}`
  await fs.promises.writeFile(path.join(AVATAR_PUBLIC_DIR, filename), buffer)
  return `/avatars/users/${filename}`
}
