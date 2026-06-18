import { resolveTripImageUrl } from './tripImages.js'

export const TRIP_IMAGE_PLACEHOLDER = '/icons/trip-image.svg'

const CATEGORY_PLACEHOLDER = {
  same_day: '/icons/category/same-day.svg',
  overnight: '/icons/category/overnight.svg',
  trail: '/icons/category/trail.svg',
  camping: '/icons/category/camping.svg',
  race: '/icons/category/race.svg',
  default: TRIP_IMAGE_PLACEHOLDER,
}

export function categoryPlaceholderIcon(trip) {
  const code = trip?.category_code
  return CATEGORY_PLACEHOLDER[code] || CATEGORY_PLACEHOLDER.default
}

function isBrokenAssetUrl(url) {
  if (!url || typeof url !== 'string') return true
  const u = url.trim()
  return !u || /favicon\.svg/i.test(u)
}

function setSlotLoaded(slot, loaded, iconUrl) {
  slot.classList.toggle('trip-image-slot--loaded', loaded)
  slot.classList.toggle('trip-image-slot--placeholder', !loaded)

  let icon = slot.querySelector('.trip-image-slot__icon')
  if (!loaded) {
    if (!icon) {
      icon = document.createElement('img')
      icon.className = 'trip-image-slot__icon'
      icon.alt = ''
      icon.setAttribute('aria-hidden', 'true')
      icon.draggable = false
      slot.appendChild(icon)
    }
    icon.src = iconUrl || TRIP_IMAGE_PLACEHOLDER
    slot.style.removeProperty('background-image')
  } else if (icon) {
    icon.remove()
  }
}

/** Ô ảnh nền Teleport — hiện icon khi URL lỗi / thiếu */
export function bindTripImageSlot(slot, url, iconUrl = TRIP_IMAGE_PLACEHOLDER) {
  if (!slot) return
  slot.classList.add('trip-image-slot')

  if (isBrokenAssetUrl(url)) {
    setSlotLoaded(slot, false, iconUrl)
    return
  }

  const probe = new Image()
  probe.onload = () => {
    slot.style.setProperty('background-image', `url("${url}")`, 'important')
    slot.style.backgroundPosition = 'center'
    slot.style.backgroundSize = 'cover'
    setSlotLoaded(slot, true)
  }
  probe.onerror = () => {
    setSlotLoaded(slot, false, iconUrl)
  }
  probe.src = url
}

export function applyTripDetailGallery(root, trip) {
  const gallery = root.querySelector('[class*="framenh-elm"]')
  if (!gallery) return

  const icon = categoryPlaceholderIcon(trip)
  const main = gallery.querySelector('[class*="image-elm1"]')
  const thumbs = [...gallery.querySelectorAll('[class*="frame104-elm"] [class*="image-elm"]')]

  bindTripImageSlot(main, resolveTripImageUrl(trip, 0), icon)
  thumbs.forEach((el, i) => bindTripImageSlot(el, resolveTripImageUrl(trip, i + 1), icon))
}

export function applyTripCardImageHost(host, trip, index = 0) {
  if (!host) return
  bindTripImageSlot(host, resolveTripImageUrl(trip, index), categoryPlaceholderIcon(trip))
}

/** Mũi tên accordion — Figma dùng chevron 24×24 */
export function applyTripDetailIcons(page) {
  if (!page) return

  page.querySelectorAll('img[class*="triangle-elm"]').forEach((img) => {
    img.src = '/icons/chevron-down.svg'
    img.alt = ''
  })
}
