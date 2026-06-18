import { applyHistoryCardIcons } from './accountIcons.js'
import { resolveTripImageUrl } from './tripImages.js'
import { normalizeTripTitle } from './dataText.js'

export const HISTORY_LIST_SELECTOR = '[class*="frame405-elm"]'
export const HISTORY_CARD_SELECTOR =
  '[class*="frame402-elm"], [class*="frame403-elm"], [class*="frame404-elm"]'

function historyCardTemplate(listRoot) {
  return listRoot?.querySelector(HISTORY_CARD_SELECTOR) ?? null
}

function ensureHistoryCardCount(listRoot, count) {
  if (!listRoot || count <= 0) return []

  let cards = [...listRoot.querySelectorAll(HISTORY_CARD_SELECTOR)]
  const template = cards[0] || historyCardTemplate(listRoot)
  if (!template) return []

  while (cards.length < count) {
    const clone = template.cloneNode(true)
    listRoot.appendChild(clone)
    cards = [...listRoot.querySelectorAll(HISTORY_CARD_SELECTOR)]
  }

  return cards
}

export function fillHistoryCard(card, booking, index = 0) {
  const imageHost = card.querySelector('[class*="image-elm"]')
  if (imageHost) {
    const trip = {
      id: booking.trip_id,
      title: booking.trip_title,
      category_code: booking.category_code,
      thumbnail_url: booking.thumbnail_url,
    }
    const imageUrl = resolveTripImageUrl(trip, index)
    imageHost.style.backgroundImage = `url("${imageUrl}")`
    imageHost.style.backgroundPosition = 'center'
    imageHost.style.backgroundSize = 'cover'
    imageHost.style.backgroundRepeat = 'no-repeat'
    imageHost.style.backgroundColor = 'transparent'
  }

  const content = card.querySelector('[class*="frame400-elm"]')
  if (!content) return

  const blocks = [...content.children]
  const titleSpan = blocks[0]?.querySelector('span')
  const dateSpan = blocks[1]?.querySelector('span')
  const statusSpan = content.querySelector('[class*="frame398-elm"] span')

  const rawTitle = normalizeTripTitle(booking.trip_title || '')
  if (titleSpan) {
    titleSpan.textContent = rawTitle.startsWith('Chuyến đi')
      ? rawTitle
      : rawTitle
        ? `Chuyến đi ${rawTitle}`
        : 'Chuyến đi'
  }

  if (dateSpan) {
    dateSpan.textContent = booking.departure_at
      ? `Ngày ${new Date(booking.departure_at).toLocaleDateString('vi-VN')}`
      : 'Ngày đang cập nhật'
  }

  if (statusSpan) {
    statusSpan.textContent = booking.status_label || booking.status || ''
    statusSpan.classList.remove('history-card__status--completed', 'history-card__status--cancelled')
    if (booking.status === 'completed') {
      statusSpan.classList.add('history-card__status--completed')
    } else if (booking.status === 'cancelled' || booking.status === 'refunded') {
      statusSpan.classList.add('history-card__status--cancelled')
    }
  }

  card.dataset.bookingId = booking.id ? String(booking.id) : ''
  card.classList.add('history-trip-card')
  applyHistoryCardIcons(card, booking)
}

export function fillHistorySlots(listRoot, bookings) {
  if (!listRoot) return

  const items = Array.isArray(bookings) ? bookings : []
  const cards = ensureHistoryCardCount(listRoot, Math.max(items.length, 1))

  cards.forEach((card, index) => {
    if (index < items.length) {
      card.style.display = ''
      card.hidden = false
      fillHistoryCard(card, items[index], index)
    } else {
      card.style.display = 'none'
      card.hidden = true
      delete card.dataset.bookingId
    }
  })

  let emptyEl = listRoot.querySelector('.history-list__empty')
  if (items.length === 0) {
    cards.forEach((card) => {
      card.style.display = 'none'
      card.hidden = true
    })
    if (!emptyEl) {
      emptyEl = document.createElement('p')
      emptyEl.className = 'history-list__empty'
      listRoot.appendChild(emptyEl)
    }
    emptyEl.textContent = 'Chưa có lịch sử chuyến đi.'
    emptyEl.hidden = false
  } else if (emptyEl) {
    emptyEl.hidden = true
  }
}
