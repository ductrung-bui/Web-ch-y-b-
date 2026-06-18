import { AUTH_CHEVRON_URL } from '../constants/siteAssets.js'
import { resolveHeaderAuth } from './teleportHeader.js'

/** Bảng màu nền avatar (giống Google — ổn định theo user) */
const AVATAR_BG_COLORS = [
  '#1a73e8',
  '#e8710a',
  '#0b8043',
  '#8e24aa',
  '#d50000',
  '#039be5',
  '#7cb342',
  '#c2185b',
  '#5e35b1',
  '#00897b',
  '#f4511e',
  '#3949ab',
]

const AVATAR_IMG_CLASS = 'teleport-user-avatar-img'
const AVATAR_INITIAL_CLASS = 'teleport-user-avatar-initial'

function isChevronImg(img) {
  return /chevrondown/i.test(img?.className || '')
}

/** Chuẩn hóa URL avatar từ API — null nếu rỗng hoặc không hợp lệ */
export function normalizeAvatarUrl(url) {
  if (url == null) return null
  const trimmed = String(url).trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null
  return trimmed
}

/** Một ký tự hiển thị trên avatar chữ */
export function avatarInitial(user) {
  const name = user?.fullName?.trim()
  if (name) {
    const word = name.split(/\s+/).find(Boolean) || name
    const ch = word.trim()[0]
    if (ch) return ch.toLocaleUpperCase('vi-VN')
  }
  const email = user?.email?.trim()
  if (email) {
    const local = email.split('@')[0] || email
    const ch = [...local].find((c) => /\S/.test(c))
    if (ch) return ch.toLocaleUpperCase('vi-VN')
  }
  return '?'
}

/** Màu nền cố định theo id / email / tên */
export function avatarBackgroundColor(user) {
  const seed =
    user?.id != null
      ? String(user.id)
      : user?.email || user?.fullName || 'guest'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_BG_COLORS[hash % AVATAR_BG_COLORS.length]
}

function clearInitialAvatar(box) {
  box.querySelector(`.${AVATAR_INITIAL_CLASS}`)?.remove()
  box.classList.remove('user-avatar--initial')
  box.style.removeProperty('background-color')
  box.style.removeProperty('color')
}

function removeAvatarPhoto(box) {
  box.querySelectorAll(`.${AVATAR_IMG_CLASS}`).forEach((el) => el.remove())
}

function showInitialAvatar(box, user) {
  clearInitialAvatar(box)
  removeAvatarPhoto(box)

  box.classList.remove('user-avatar--empty')
  box.classList.add('user-avatar--initial')

  const initial = avatarInitial(user)
  const bg = avatarBackgroundColor(user)

  let span = box.querySelector(`.${AVATAR_INITIAL_CLASS}`)
  if (!span) {
    span = document.createElement('span')
    span.className = AVATAR_INITIAL_CLASS
    span.setAttribute('aria-hidden', 'true')
    box.appendChild(span)
  }
  span.textContent = initial
  box.style.backgroundColor = bg
  box.style.color = '#fff'
  box.setAttribute('title', user?.fullName || user?.email || '')
}

function showGuestAvatar(box) {
  showInitialAvatar(box, { fullName: '?' })
  box.classList.add('user-avatar--empty')
}

function isMissingFigmaAsset(src) {
  if (!src) return true
  return /shapei\d|chevrondowni\d/i.test(src)
}

/** Sửa mũi tên dropdown — file Figma không có trong public */
export function fixAuthHeaderChevron(authBox) {
  if (!authBox) return

  authBox.querySelectorAll('img').forEach((img) => {
    if (!isChevronImg(img)) return
    if (isMissingFigmaAsset(img.getAttribute('src') || img.src)) {
      img.src = AUTH_CHEVRON_URL
    }
    img.alt = ''
    img.onerror = () => {
      if (img.dataset.chevronFallback === '1') return
      img.dataset.chevronFallback = '1'
      img.src = AUTH_CHEVRON_URL
    }
  })
}

/** Xóa ảnh placeholder / ảnh lỗi cạnh tên user trong header auth */
export function cleanupAuthBrokenImages(authBox) {
  if (!authBox) return

  authBox.querySelectorAll('[class*="avatar-elm"] [class*="shape-elm"]').forEach((el) => el.remove())

  authBox.querySelectorAll('img').forEach((img) => {
    if (isChevronImg(img)) return

    const avatarBox = img.closest('[class*="avatar-elm"]')
    if (avatarBox) {
      if (img.matches('[class*="shape-elm"]')) img.remove()
      return
    }

    img.remove()
  })

  authBox.querySelector('.teleport-nav-user-badge')?.querySelectorAll('img')?.forEach((el) => el.remove())

  fixAuthHeaderChevron(authBox)
}

function loadAvatarPhoto(box, user, url) {
  removeAvatarPhoto(box)
  clearInitialAvatar(box)
  box.classList.remove('user-avatar--empty')

  const probe = new Image()
  probe.onload = () => {
    if (!box.isConnected) return
    removeAvatarPhoto(box)
    clearInitialAvatar(box)

    const img = document.createElement('img')
    img.className = AVATAR_IMG_CLASS
    img.alt = user?.fullName || user?.email || 'Avatar'
    img.src = url
    box.appendChild(img)
  }
  probe.onerror = () => {
    if (!box.isConnected) return
    showInitialAvatar(box, user)
  }
  probe.src = url
}

/** Gắn avatar vào khung header Teleport (ảnh hoặc chữ + màu) */
export function applyHeaderAvatar(box, { isAuthenticated, user }) {
  if (!box) return

  box.querySelectorAll('[class*="shape-elm"]').forEach((el) => el.remove())
  removeAvatarPhoto(box)

  if (!isAuthenticated || !user) {
    showGuestAvatar(box)
    return
  }

  const url = normalizeAvatarUrl(user?.avatarUrl)
  if (!url) {
    showInitialAvatar(box, user)
    return
  }

  loadAvatarPhoto(box, user, url)
}

export function bindPageHeaderAvatars(page, { isAuthenticated, user }) {
  const auth = resolveHeaderAuth(page)
  if (!auth) return

  cleanupAuthBrokenImages(auth)

  const avatar =
    auth.querySelector('[class*="avatar-elm"]') ||
    auth.querySelector('[class*="shape-elm"]')?.parentElement
  if (avatar) applyHeaderAvatar(avatar, { isAuthenticated, user })
}
