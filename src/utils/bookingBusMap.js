/** Sơ đồ ghế từ API — icon ghế trống / đã có chủ / đang chọn */

import { countSeatsByStatus, isSeatBlocked } from './seatStats.js'

const SEAT_ICON_EMPTY = '/icons/seat-empty.svg'
const SEAT_ICON_BOOKED = '/icons/seat-booked.svg'
const SEAT_ICON_SELECTED = '/icons/seat-selected.svg'

const STATIC_SEAT_FRAME_RE =
  /^.*-thq-frame(19\d|20\d|21\d|22\d|23\d|24\d)-elm\d*$/i

function isStaticSeatFrame(el) {
  const cls = el.className || ''
  return STATIC_SEAT_FRAME_RE.test(cls) || /-thq-frame257-elm/.test(cls)
}

export function hideStaticSeatLayout(busRoot) {
  if (!busRoot) return
  busRoot.querySelectorAll(':scope > *').forEach((child) => {
    if (child.classList.contains('booking-bus-map')) return
    if (isStaticSeatFrame(child)) {
      child.style.display = 'none'
      child.setAttribute('aria-hidden', 'true')
    }
  })
}

function createSeatIcon(src, alt) {
  const img = document.createElement('img')
  img.src = src
  img.alt = alt
  img.className = 'booking-bus-map__icon'
  img.draggable = false
  return img
}

function createSeatCell(seat, picked, onToggle) {
  const isBooked = isSeatBlocked(seat)
  const isSelected = picked.has(Number(seat.id))

  const wrap = document.createElement(isBooked ? 'div' : 'button')
  if (!isBooked) wrap.type = 'button'

  wrap.className = 'booking-bus-map__seat'
  wrap.dataset.seatId = String(seat.id)
  if (isBooked) {
    wrap.classList.add('booking-bus-map__seat--booked')
    wrap.setAttribute('aria-disabled', 'true')
    wrap.title = `Ghế ${seat.seat_number} — đã có chủ`
  } else if (isSelected) {
    wrap.classList.add('booking-bus-map__seat--selected', 'booking-seat-btn--selected')
    wrap.setAttribute('aria-pressed', 'true')
    wrap.title = `Ghế ${seat.seat_number} — đang chọn`
  } else {
    wrap.classList.add('booking-bus-map__seat--available', 'booking-seat-btn')
    wrap.setAttribute('aria-pressed', 'false')
    wrap.title = `Ghế ${seat.seat_number} — trống`
  }

  const iconSrc = isBooked
    ? SEAT_ICON_BOOKED
    : isSelected
      ? SEAT_ICON_SELECTED
      : SEAT_ICON_EMPTY
  wrap.appendChild(
    createSeatIcon(
      iconSrc,
      isBooked ? 'Đã có chủ' : isSelected ? 'Đang chọn' : 'Ghế trống',
    ),
  )

  const num = document.createElement('span')
  num.className = 'booking-bus-map__num'
  num.textContent = seat.seat_number
  wrap.appendChild(num)

  if (!isBooked) {
    wrap.addEventListener('click', () => onToggle(Number(seat.id), wrap))
  }

  return wrap
}

export function renderSeatLegend(page, seats, pickedCount = 0) {
  const { booked, available } = countSeatsByStatus(seats)
  const legend = page.querySelector('[class*="frame257-elm"]')
  if (!legend) return

  legend.style.display = 'flex'
  legend.setAttribute('aria-hidden', 'false')

  const rows = [...legend.querySelectorAll('[class*="frame253-elm"], [class*="frame254-elm"], [class*="frame255-elm"]')]
  const labels = [
    `Ghế trống (${available})`,
    `Đang chọn (${pickedCount})`,
    `Đã có chủ (${booked})`,
  ]
  const swatchClasses = [
    'booking-legend-swatch--empty',
    'booking-legend-swatch--selected',
    'booking-legend-swatch--booked',
  ]

  rows.forEach((row, i) => {
    const span = row.querySelector('span')
    if (span && labels[i]) span.textContent = labels[i]
    const swatch = row.querySelector('[class*="frame249-elm"]')
    if (swatch) {
      swatch.className = `${swatch.className} booking-legend-swatch ${swatchClasses[i]}`.trim()
      swatch.innerHTML = ''
    }
  })
}

export function renderBusSeatMap(busRoot, seats, picked, onToggle) {
  if (!busRoot) return false

  hideStaticSeatLayout(busRoot)

  let map = busRoot.querySelector('.booking-bus-map')
  if (!map) {
    map = document.createElement('div')
    map.className = 'booking-bus-map'
    busRoot.appendChild(map)
  }
  map.innerHTML = ''

  if (!seats.length) return false

  const maxRow = Math.max(1, ...seats.map((s) => Number(s.seat_row) || 1))
  const maxCol = Math.max(1, ...seats.map((s) => Number(s.seat_col) || 1))
  const grid = Array.from({ length: maxRow }, () => Array(maxCol).fill(null))

  seats.forEach((seat) => {
    const r = Math.max(0, (Number(seat.seat_row) || 1) - 1)
    const c = Math.max(0, (Number(seat.seat_col) || 1) - 1)
    if (grid[r]) grid[r][c] = seat
  })

  const front = document.createElement('div')
  front.className = 'booking-bus-map__front'
  front.textContent = 'Đầu xe'
  map.appendChild(front)

  grid.forEach((row) => {
    const rowEl = document.createElement('div')
    rowEl.className = 'booking-bus-map__row'

    row.forEach((seat) => {
      if (!seat) {
        const gap = document.createElement('div')
        gap.className = 'booking-bus-map__gap'
        gap.setAttribute('aria-hidden', 'true')
        rowEl.appendChild(gap)
        return
      }
      rowEl.appendChild(createSeatCell(seat, picked, onToggle))
    })

    map.appendChild(rowEl)
  })

  return true
}

export function refreshSeatMapSelection(busRoot, picked) {
  if (!busRoot) return
  busRoot.querySelectorAll('.booking-bus-map__seat').forEach((el) => {
    const id = Number(el.dataset.seatId)
    if (!id) return
    if (el.classList.contains('booking-bus-map__seat--booked')) return
    const isSelected = picked.has(id)
    el.classList.toggle('booking-bus-map__seat--selected', isSelected)
    el.classList.toggle('booking-seat-btn--selected', isSelected)
    el.setAttribute('aria-pressed', isSelected ? 'true' : 'false')
    const img = el.querySelector('.booking-bus-map__icon')
    if (img) img.src = isSelected ? SEAT_ICON_SELECTED : SEAT_ICON_EMPTY
  })
}

export function updateSeatSummary(page, pickedSeats, seats, options = {}) {
  const labels = [...pickedSeats]
    .map((id) => seats.find((s) => Number(s.id) === id)?.seat_number)
    .filter(Boolean)

  const summarySpan = [...page.querySelectorAll('span')].find((s) =>
    s.textContent.trim().startsWith('Ghế đã chọn:'),
  )
  if (summarySpan) {
    summarySpan.textContent = labels.length
      ? `Ghế đã chọn: ${labels.join(', ')}`
      : 'Ghế đã chọn: —'
  }

  if (options.summaryRoot && options.schedule?.price != null) {
    const priceBlocks = [...options.summaryRoot.children].filter((n) =>
      n.matches?.('[class*="text-elm"]'),
    )
    const priceBlock = priceBlocks[3]
    if (priceBlock && options.formatPrice && options.setHostText) {
      const total = Number(options.schedule.price) * pickedSeats.size
      options.setHostText(priceBlock, options.formatPrice(total))
    }
  }

  const busRoot = page.querySelector('[class*="vtrgh-elm"]')
  if (busRoot) refreshSeatMapSelection(busRoot, pickedSeats)
  renderSeatLegend(page, seats, pickedSeats.size)
}
