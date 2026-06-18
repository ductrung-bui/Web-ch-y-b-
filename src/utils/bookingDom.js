import { bookingsApi } from '../api/endpoints.js'
import { BOOKING_FLOW } from '../navigationConfig.js'
import {
  addonsFromQtyMap,
  formatScheduleDateTime,
  formatSchedulePrice,
  normalizeBookingAddons,
  summarizeBookingAddons,
  tripDisplayTitle,
} from './bookingFormat.js'

export function setHostText(host, text) {
  if (!host) return
  const span = host.querySelector('span') || host
  const value = text ?? ''
  span.textContent = value
  if (value) span.setAttribute('title', value)
  else span.removeAttribute('title')
}

export function bindBookingClick(el, handler) {
  if (!el || el.dataset.bookingBound) return
  el.dataset.bookingBound = '1'
  el.classList.add('booking-clickable')
  el.style.cursor = 'pointer'
  el.addEventListener('click', handler)
}

export function findSpanByText(root, text) {
  return [...root.querySelectorAll('span')].find((s) => s.textContent.trim() === text)
}

export function closestNavHost(span) {
  return (
    span?.closest('button') ||
    span?.closest('[class*="frame267-elm"]') ||
    span?.closest('[class*="frame268-elm"]') ||
    span?.closest('[class*="frame269-elm"]') ||
    span?.parentElement?.parentElement
  )
}

export function withBookingQuery(path, searchParams, draft) {
  const next = new URLSearchParams(searchParams)
  if (draft?.tripId != null && draft.tripId !== '') {
    next.set('tripId', String(draft.tripId))
  }
  if (draft?.scheduleId != null && draft.scheduleId !== '') {
    next.set('scheduleId', String(draft.scheduleId))
  }
  if (draft?.bookingId != null && draft.bookingId !== '') {
    next.set('bookingId', String(draft.bookingId))
  }
  const qs = next.toString()
  return qs ? `${path}?${qs}` : path
}

export function fillSlotsInPlace(root, { itemSelector, items, fillItem }) {
  const cards = [...root.querySelectorAll(itemSelector)]
  cards.forEach((card, index) => {
    if (index < items.length) {
      card.style.display = ''
      card.hidden = false
      fillItem(card, items[index], index)
    } else {
      card.style.display = 'none'
      card.hidden = true
      card.classList.remove('booking-schedule-card--selected')
      delete card.dataset.scheduleId
    }
  })
}

export function bookingFlowFor(slug) {
  return BOOKING_FLOW[slug] || null
}

/** 3 dòng trong thẻ lịch: tên chuyến, giờ khởi hành, số ghế còn lại */
export function getScheduleCardLineSpans(card) {
  if (!card) return { title: null, date: null, seats: null }

  const rows = [...card.children].filter(
    (node) => node.matches?.('[class*="text-elm"]') && node.querySelector('span'),
  )

  const pickSpan = (row) => {
    if (!row) return null
    const spans = [...row.querySelectorAll('span')]
    return spans[spans.length - 1] || null
  }

  return {
    title: pickSpan(rows[0]),
    date: pickSpan(rows[1]),
    seats: pickSpan(rows[2]),
  }
}

export function findBookingSummaryRoot(page) {
  if (!page) return null
  return (
    page.querySelector('[class*="frame281-elm"]') ||
    page.querySelector('[class*="frame266-elm"]')
  )
}

function setSummaryField(summaryRoot, selectors, text) {
  for (const selector of selectors) {
    const el = summaryRoot.querySelector(selector)
    if (!el) continue
    el.textContent = text
    if (text) el.setAttribute('title', text)
    else el.removeAttribute('title')
    return el
  }
  return null
}

function addonInlineLabel(addons) {
  const summary = summarizeBookingAddons(normalizeBookingAddons(addons))
  if (summary.isEmpty) return 'Dịch vụ bổ sung: Không chọn'
  return summary.detail
    ? `Dịch vụ bổ sung: ${summary.countLabel} (${summary.detail})`
    : `Dịch vụ bổ sung: ${summary.countLabel}`
}

/** Khối giá trong box frame281 — dòng DVBS + tổng tiền (không thêm hàng mới) */
function setPassengerSummaryPriceBlock(summaryRoot, addonText, priceText) {
  const priceRow = summaryRoot.querySelector('[class*="text-elm54"]')
  if (!priceRow) {
    setSummaryField(summaryRoot, ['[class*="text-elm79"]', '[class*="text-elm56"]'], priceText)
    return
  }

  let addonSpan = priceRow.querySelector('.booking-summary-addon-inline')
  let priceSpan =
    priceRow.querySelector('[class*="text-elm56"]') ||
    priceRow.querySelector('.booking-summary-price-inline')

  if (!addonSpan || !priceSpan) {
    const stack = document.createElement('div')
    stack.className = 'booking-summary-price-stack'
    stack.innerHTML = `
      <span class="booking-summary-addon-inline"></span>
      <span class="booking-summary-price-inline"></span>
    `
    priceRow.innerHTML = ''
    priceRow.appendChild(stack)
    addonSpan = priceRow.querySelector('.booking-summary-addon-inline')
    priceSpan = priceRow.querySelector('.booking-summary-price-inline')
  }

  addonSpan.textContent = addonText
  addonSpan.setAttribute('title', addonText)
  priceSpan.textContent = priceText
  priceSpan.setAttribute('title', priceText)
}

/** Tóm tắt đơn — frame266 (dịch vụ) hoặc frame281 (thông tin hành khách) */
export function fillBookingOrderSummary(summaryRoot, booking, data, options = {}) {
  if (!summaryRoot || !booking) return

  const seats =
    data?.seats?.map((s) => s.seat_number).join(', ') ||
    booking.selected_seats_label ||
    '—'
  const title = tripDisplayTitle({ title: booking.trip_title })
  const dateText = formatScheduleDateTime(booking.departure_at)
  const ticketCount = Math.max(
    1,
    Number(booking.ticket_count) || 0,
    Array.isArray(data?.seats) ? data.seats.length : 0,
  )
  const seatLine = `Ghế đã chọn: ${seats} · ${ticketCount} vé`
  const addonText = addonInlineLabel(data?.addons)
  const total =
    options.previewTotal != null
      ? options.previewTotal
      : Number(booking.total_amount || 0)
  const priceText = formatSchedulePrice(total)

  const isPassengerBox = Boolean(summaryRoot.querySelector('[class*="text-elm47"]'))

  setSummaryField(summaryRoot, ['[class*="text-elm70"]', '[class*="text-elm47"]'], title)
  setSummaryField(summaryRoot, ['[class*="text-elm73"]', '[class*="text-elm50"]'], dateText)
  setSummaryField(
    summaryRoot,
    ['[class*="text-elm74"]', '[class*="text-elm53"]'],
    seatLine,
  )

  if (isPassengerBox) {
    setPassengerSummaryPriceBlock(summaryRoot, addonText, priceText)
  } else {
    setSummaryField(summaryRoot, ['[class*="text-elm76"]'], addonText)
    setSummaryField(summaryRoot, ['[class*="text-elm79"]', '[class*="text-elm56"]'], priceText)
  }

  summaryRoot.querySelector('.booking-order-addon-line')?.remove()
  summaryRoot.querySelector('.booking-order-ticket-line')?.remove()
}

/** Giữ box Teleport gốc — chỉ điền lại nội dung */
export function renderPassengerOrderSummary(container, booking, data) {
  if (!container || !booking) return
  container.classList.remove('booking-passenger-order-summary')
  fillBookingOrderSummary(container, booking, data)
}

export function resolveBookingTicketCount(booking, data) {
  const fromBooking = Number(booking?.ticket_count) || 0
  const fromSeats = Array.isArray(data?.seats) ? data.seats.length : 0
  return Math.max(1, fromBooking, fromSeats)
}

export async function loadBookingOrderSummary(page, bookingId, options = {}) {
  if (!bookingId) return null
  const { fillSummary = true } = options
  try {
    const data = await bookingsApi.get(bookingId)
    const b = data?.booking
    if (!b) return data

    if (fillSummary) {
      const summaryRoot = findBookingSummaryRoot(page)
      if (summaryRoot) fillBookingOrderSummary(summaryRoot, b, data, options)
    }

    return {
      ...data,
      baseTicketAmount: Number(b.ticket_amount || 0),
    }
  } catch {
    return null
  }
}

export function updateOrderSummaryPrice(page, total) {
  const priceText = formatSchedulePrice(total)
  const frame266 = page.querySelector('[class*="frame266-elm"]')
  const frame281 = page.querySelector('[class*="frame281-elm"]')
  if (frame266) {
    setSummaryField(frame266, ['[class*="text-elm79"]', '[class*="text-elm56"]'], priceText)
  }
  if (frame281) {
    const addonSpan = frame281.querySelector('.booking-summary-addon-inline')
    const addonText = addonSpan?.textContent || ''
    setPassengerSummaryPriceBlock(frame281, addonText, priceText)
  }
}

export function updateAddonPreviewTotal(page, baseTicketAmount, addonQty, addons) {
  let addonTotal = 0
  for (const [id, qty] of Object.entries(addonQty || {})) {
    const addon = addons.find((a) => Number(a.id) === Number(id))
    if (addon && Number(qty) > 0) {
      addonTotal += Number(addon.price) * Number(qty)
    }
  }
  const total = Number(baseTicketAmount || 0) + addonTotal
  const frame266 = page.querySelector('[class*="frame266-elm"]')
  if (frame266) {
    const addonText = addonInlineLabel(addonsFromQtyMap(addonQty, addons))
    setSummaryField(frame266, ['[class*="text-elm76"]'], addonText)
  }
  updateOrderSummaryPrice(page, total)
  return total
}
