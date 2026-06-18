import { AUTH_CHEVRON_URL } from '../constants/siteAssets.js'

const SHELL_CLASS = 'teleport-nav-shell'
const RIGHT_CLASS = 'teleport-nav-right'
const AUTH_SLOT_ATTR = 'data-teleport-auth-slot'

/** Figma đặt vé bước 1 dùng header-auth-elm1/2 — không khớp header-auth-elm trang chủ */
function isPlaceholderAuthClass(className) {
  return /header-auth-elm\d/i.test(String(className))
}

function hidePlaceholderAuthBlocks(page) {
  page.querySelectorAll('[class*="header-auth-elm"]').forEach((el) => {
    if (!isPlaceholderAuthClass(el.className)) return
    el.style.display = 'none'
    el.setAttribute('aria-hidden', 'true')
  })
}

/**
 * Khối avatar + chevron giống trang chủ. Tạo slot nếu HTML chỉ có Sign in / Register.
 */
export function resolveHeaderAuth(page) {
  const candidates = [...page.querySelectorAll('[class*="header-auth-elm"]')]
  const existing = candidates.find((el) => !isPlaceholderAuthClass(el.className))
  if (existing) return existing

  hidePlaceholderAuthBlocks(page)

  let slot = page.querySelector(`[${AUTH_SLOT_ATTR}]`)
  if (slot) return slot

  const frame343 = page.querySelector('[class*="frame343-elm"]')
  if (!frame343) return null

  if (!slot) {
    slot = document.createElement('div')
    slot.setAttribute(AUTH_SLOT_ATTR, '1')
    slot.className = 'teleport-unified-header-auth-elm'

    const avatar = document.createElement('div')
    avatar.className = 'teleport-unified-avatar-elm'

    const chevron = document.createElement('img')
    chevron.className = 'teleport-unified-chevrondown-elm'
    chevron.src = AUTH_CHEVRON_URL
    chevron.alt = ''
    slot.appendChild(avatar)
    slot.appendChild(chevron)
    frame343.appendChild(slot)
  }

  return slot
}

function syncNavHeight(page, shell) {
  const set = () => {
    const h = Math.ceil(shell.getBoundingClientRect().height)
    page.style.setProperty('--teleport-nav-height', `${h}px`)
  }
  set()
  if (shell.dataset.navHeightBound === '1') return
  shell.dataset.navHeightBound = '1'
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(set)
    ro.observe(shell)
  }
  window.addEventListener('resize', set)
}

/**
 * Gộp header: full width, logo trái — menu + avatar phải.
 * Thanh nav cố định trên cùng, tách khỏi nội dung trang.
 */
export function unifyHeaderLayout(page) {
  const header = page.querySelector('[class*="header-elm"]')
  const bar = page.querySelector('[class*="header-default-elm"]')
  const navList = page.querySelector('[class*="navigation-pill-list-elm"]')
  const auth = resolveHeaderAuth(page)

  if (!header || !bar || !navList) return

  hidePlaceholderAuthBlocks(page)

  header.classList.add('teleport-header-unified')
  bar.classList.add('teleport-nav-bar')

  let shell = page.querySelector(`.${SHELL_CLASS}`)
  if (!shell) {
    shell = document.createElement('div')
    shell.className = SHELL_CLASS
    page.prepend(shell)
  }
  if (header.parentElement !== shell) {
    shell.appendChild(header)
  }

  let right = bar.querySelector(`.${RIGHT_CLASS}`)
  if (!right) {
    right = document.createElement('div')
    right.className = RIGHT_CLASS
    bar.appendChild(right)
  }

  if (navList.parentElement !== right) {
    right.appendChild(navList)
  }
  if (auth && auth.parentElement !== right) {
    right.appendChild(auth)
  }

  const frame343 = header.querySelector('[class*="frame343-elm"]')
  if (frame343) {
    frame343.style.display = 'none'
    frame343.setAttribute('aria-hidden', 'true')
  }

  header.style.width = '100%'
  header.style.maxWidth = 'none'
  header.style.margin = '0'
  bar.style.width = '100%'
  bar.style.maxWidth = 'none'

  page.classList.add('teleport-page--has-fixed-nav')
  syncNavHeight(page, shell)
}

/** Gọi lại sau khi inject menu (chiều cao nav có thể đổi) */
export function refreshNavLayout(page) {
  const shell = page.querySelector(`.${SHELL_CLASS}`)
  if (shell) syncNavHeight(page, shell)
}
