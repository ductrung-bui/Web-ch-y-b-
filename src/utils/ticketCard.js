import { ACCOUNT_ICONS } from './accountIcons.js'
import { resolveTripImageUrl } from './tripImages.js'
import { normalizeTripTitle } from './dataText.js'

export const TICKET_LIST_SELECTOR = '[class*="frame391-elm1"]'
/** Chỉ thẻ vé trực tiếp trong list — tránh nhầm frame392-elm1 (sidebar). */
export const TICKET_CARD_SELECTOR =
  ':scope > [class*="frame390-elm"], :scope > [class*="frame391-elm2"], :scope > [class*="frame392-elm2"]'

const TICKET_TEXT_BLOCKS = [
  '[class*="text-elm24"]',
  '[class*="text-elm33"]',
  '[class*="text-elm42"]',
]

function ticketCardTemplate(listRoot) {
  return listRoot?.querySelector(TICKET_CARD_SELECTOR) ?? null
}

function ensureTicketCardCount(listRoot, count) {
  if (!listRoot || count <= 0) return []

  let cards = [...listRoot.querySelectorAll(TICKET_CARD_SELECTOR)]
  const template = cards[0] || ticketCardTemplate(listRoot)
  if (!template) return []

  while (cards.length < count) {
    const clone = template.cloneNode(true)
    listRoot.appendChild(clone)
    cards = [...listRoot.querySelectorAll(TICKET_CARD_SELECTOR)]
  }

  return cards
}

function formatDepartureDate(value) {
  if (!value) return 'Ngày khởi hành: đang cập nhật'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Ngày khởi hành: đang cập nhật'
  return `Ngày khởi hành: ${d.toLocaleDateString('vi-VN')}`
}

function isTicketTextBlock(el) {
  const cls = el?.className?.toString() || ''
  return (
    cls.includes('text-elm24') ||
    cls.includes('text-elm33') ||
    cls.includes('text-elm42')
  )
}

function findTicketTextBlock(card) {
  const imageHost = card.querySelector('[class*="image-elm"]')
  const next = imageHost?.nextElementSibling
  if (isTicketTextBlock(next)) return next

  for (const sel of TICKET_TEXT_BLOCKS) {
    const block = card.querySelector(sel)
    if (block) return block
  }
  return null
}

function bookingActionLabel(booking, showCancel) {
  if (showCancel) return 'Hủy vé'
  if (booking?.status === 'refunded') return 'Đã hoàn tiền'
  return booking?.status_label || 'Đã hủy'
}

function setLine(lines, index, text) {
  const line = lines[index]
  if (!line) return
  const value = text?.trim() || ''
  line.textContent = value
  line.style.display = value ? '' : 'none'
  line.hidden = !value
}

/** Thay toàn bộ markup Teleport trong nút — tránh lặp chữ (elm30/32/41/50). */
function renderActionButton(actionHost, text, showCancel) {
  const className = actionHost.className
  actionHost.replaceChildren()

  const wrap = document.createElement('span')
  wrap.className = 'ticket-card__action-icon-wrap'
  wrap.setAttribute('aria-hidden', 'true')

  const img = document.createElement('img')
  img.className = 'ticket-card__action-icon'
  img.width = 22
  img.height = 22
  img.decoding = 'async'
  img.alt = ''
  img.src = showCancel ? ACCOUNT_ICONS.cancelTicket : ACCOUNT_ICONS.ticketCancelled
  wrap.appendChild(img)

  const label = document.createElement('span')
  label.className = 'ticket-card__action-label'
  label.textContent = text

  actionHost.append(wrap, label)
  actionHost.className = className
}

export function fillTicketCard(card, booking, index = 0, { showCancel = true } = {}) {
  if (!card || !booking) return

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

  const textBlock = findTicketTextBlock(card)
  const lines = textBlock ? [...textBlock.querySelectorAll(':scope > span')] : []

  const rawTitle = normalizeTripTitle(booking.trip_title || '')
  const title = rawTitle.startsWith('Chuyến đi') ? rawTitle : rawTitle ? `Chuyến đi ${rawTitle}` : 'Chuyến đi'

  setLine(lines, 0, title)
  setLine(lines, 1, formatDepartureDate(booking.departure_at))
  setLine(
    lines,
    2,
    booking.selected_seats_label ? `Số ghế: ${booking.selected_seats_label}` : '',
  )
  setLine(lines, 3, booking.duration_label ? `Thời gian: ${booking.duration_label}` : '')
  setLine(
    lines,
    4,
    booking.pickup_point ? `Điểm xe đón: ${booking.pickup_point}` : '',
  )

  const actionBtn = card.querySelector('[class*="frame389-elm"]')
  const actionText = bookingActionLabel(booking, showCancel)

  if (actionBtn) {
    renderActionButton(actionBtn, actionText, showCancel)
    actionBtn.style.cursor = showCancel ? 'pointer' : 'default'
    actionBtn.classList.toggle('ticket-card__cancel', showCancel)
    actionBtn.classList.toggle('ticket-card__status', !showCancel)
    actionBtn.setAttribute('aria-label', actionText)
  }

  card.dataset.bookingId = booking.id ? String(booking.id) : ''
  card.classList.add('ticket-card')
}

export function fillTicketSlots(listRoot, bookings, options = {}) {
  if (!listRoot) return

  const items = Array.isArray(bookings) ? bookings.filter(Boolean) : []
  if (items.length > 0) {
    ensureTicketCardCount(listRoot, items.length)
  }
  const cards = [...listRoot.querySelectorAll(TICKET_CARD_SELECTOR)]
  const emptyMessage = options.emptyMessage || 'Chưa có vé nào.'

  cards.forEach((card, index) => {
    if (index < items.length) {
      card.style.display = ''
      card.hidden = false
      card.classList.add('ticket-card')
      fillTicketCard(card, items[index], index, options)
    } else {
      card.style.display = 'none'
      card.hidden = true
      card.classList.remove('ticket-card')
      delete card.dataset.bookingId
    }
  })

  let emptyEl = listRoot.querySelector('.ticket-list__empty')
  if (items.length === 0) {
    cards.forEach((card) => {
      card.style.display = 'none'
      card.hidden = true
    })
    if (!emptyEl) {
      emptyEl = document.createElement('p')
      emptyEl.className = 'ticket-list__empty'
      const tabs = listRoot.querySelector('[class*="frame387-elm"]')
      if (tabs?.nextSibling) {
        listRoot.insertBefore(emptyEl, tabs.nextSibling)
      } else {
        listRoot.appendChild(emptyEl)
      }
    }
    emptyEl.textContent = emptyMessage
    emptyEl.hidden = false
  } else if (emptyEl) {
    emptyEl.hidden = true
  }
}
