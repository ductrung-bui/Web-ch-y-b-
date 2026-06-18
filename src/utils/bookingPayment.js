import { bookingsApi } from '../api/endpoints.js'
import qrPaymentImg from '../assets/QR.jpeg?url'
import { resolveBookingTicketCount } from './bookingDom.js'
import {
  formatAddonSummaryLine,
  formatScheduleDateTime,
  formatSchedulePrice,
  tripDisplayTitle,
} from './bookingFormat.js'

const PAYMENT_BANK = {
  name: 'ACB',
  accountNumber: '35375957',
  accountHolder: 'Bùi Đức Trung',
  transferHint: 'Tên + số ghế đặt + sđt',
}

function formatDobDisplay(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  return d.toLocaleDateString('vi-VN')
}

/** Gán giá trị vào span cuối trong khối label (Figma) */
function setRowValue(row, value) {
  if (!row) return
  const spans = row.querySelectorAll('span')
  const target = spans.length ? spans[spans.length - 1] : row
  target.textContent = value ?? '—'
  if (value) target.setAttribute('title', value)
}

function setPlainText(el, value) {
  if (!el) return
  el.textContent = value ?? '—'
  if (value) el.setAttribute('title', value)
}

function fillTripDetails(tripRoot, booking, data) {
  if (!tripRoot || !booking) return

  const seats =
    data?.seats?.map((s) => s.seat_number).join(', ') ||
    booking.selected_seats_label ||
    '—'
  const ticketCount = resolveBookingTicketCount(booking, data)
  const destination =
    tripDisplayTitle({ title: booking.trip_title }) ||
    booking.destination ||
    '—'
  const departure = formatScheduleDateTime(booking.departure_at)
  const pickup = booking.pickup_point || booking.destination || '—'

  setRowValue(tripRoot.querySelector('[class*="text-elm125"]'), destination)
  setRowValue(tripRoot.querySelector('[class*="text-elm130"]'), departure)
  setRowValue(tripRoot.querySelector('[class*="text-elm134"]'), seats)

  let pickupRow = tripRoot.querySelector('.booking-payment-pickup-row')
  if (!pickupRow) {
    const seatsRow = tripRoot.querySelector('[class*="text-elm134"]')
    pickupRow = document.createElement('div')
    pickupRow.className = 'booking-payment-pickup-row manhinhthanhtoan-thq-text-elm130'
    pickupRow.innerHTML = `
      <span class="booking-payment-pickup-row__inner">
        <span class="booking-payment-pickup-row__label">Điểm đón:</span>
        <span class="booking-payment-pickup-row__value"></span>
      </span>
    `
    if (seatsRow?.parentElement) {
      seatsRow.parentElement.insertBefore(pickupRow, seatsRow.nextSibling)
    } else {
      tripRoot.appendChild(pickupRow)
    }
  }
  setRowValue(pickupRow, pickup)

  const addonAmount = Number(booking.addon_amount || 0)
  const ticketAmount = Number(booking.ticket_amount || 0)
  const totalAmount = Number(booking.total_amount || 0)
  const addonLabel = formatAddonSummaryLine(data?.addons).replace(/^Dịch vụ bổ sung:\s*/i, '')

  setPlainText(
    tripRoot.querySelector('[class*="text-elm144"]'),
    `Tiền vé ×${ticketCount}`,
  )
  setPlainText(tripRoot.querySelector('[class*="text-elm147"]'), formatSchedulePrice(ticketAmount))
  setPlainText(
    tripRoot.querySelector('[class*="text-elm150"]'),
    addonAmount > 0 ? `Dịch vụ: ${addonLabel}` : 'Dịch vụ bổ sung: Không chọn',
  )
  setPlainText(tripRoot.querySelector('[class*="text-elm153"]'), formatSchedulePrice(addonAmount))
  setPlainText(tripRoot.querySelector('[class*="text-elm159"]'), formatSchedulePrice(totalAmount))
}

function fillContactInfo(customerRoot, passengers) {
  if (!customerRoot) return
  const lead = passengers?.[0]
  if (!lead) return

  setRowValue(customerRoot.querySelector('[class*="text-elm165"]'), lead.fullName || lead.full_name || '—')
  setRowValue(customerRoot.querySelector('[class*="text-elm170"]'), lead.phone || '—')
  setRowValue(customerRoot.querySelector('[class*="text-elm174"]'), lead.email || '—')
}

function normalizePassenger(p, index) {
  return {
    fullName: p.fullName || p.full_name || '',
    phone: p.phone || '',
    email: p.email || '',
    dateOfBirth: p.dateOfBirth || p.date_of_birth || '',
    idNumber: p.idNumber || p.id_number || '',
    index,
  }
}

function setupPaymentPassengerTabs(page, passengers, seats, pickupLabel) {
  const tabsHost = page.querySelector('[class*="frame308-elm"]')
  const detailRoot = page.querySelector('[class*="frame307-elm"]')
  if (!tabsHost || !detailRoot) return

  tabsHost.classList.add('booking-payment-passenger-tabs')
  detailRoot.classList.add('booking-payment-passenger-detail')

  const staticTabs = [
    ...tabsHost.querySelectorAll('[class*="button-elm"]'),
  ].filter((btn) => btn.querySelector('[class*="text-elm18"]'))

  staticTabs.forEach((btn) => {
    btn.style.display = 'none'
    btn.hidden = true
  })

  let dynamicHost = tabsHost.querySelector('.booking-payment-tabs')
  if (!dynamicHost) {
    dynamicHost = document.createElement('div')
    dynamicHost.className = 'booking-payment-tabs'
    dynamicHost.setAttribute('role', 'tablist')
    tabsHost.prepend(dynamicHost)
  }
  dynamicHost.innerHTML = ''

  const list = (Array.isArray(passengers) ? passengers : []).map((p, i) =>
    normalizePassenger(p, i),
  )
  const seatNumbers = (seats || []).map((s) => s.seat_number)

  const showPassenger = (idx) => {
    const p = list[idx]
    if (!p) return
    setPlainText(detailRoot.querySelector('[class*="text-elm193"]'), p.fullName || '—')
    setPlainText(detailRoot.querySelector('[class*="text-elm199"]'), formatDobDisplay(p.dateOfBirth))
    setPlainText(
      detailRoot.querySelector('[class*="text-elm205"]'),
      seatNumbers[idx] != null ? String(seatNumbers[idx]) : seatNumbers.join(', ') || '—',
    )
    setPlainText(detailRoot.querySelector('[class*="text-elm211"]'), pickupLabel || '—')
  }

  list.forEach((p, i) => {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'booking-payment-tab'
    tab.setAttribute('role', 'tab')
    tab.textContent = `Hành khách ${i + 1}`
    tab.addEventListener('click', () => {
      dynamicHost.querySelectorAll('.booking-payment-tab').forEach((b, j) => {
        b.classList.toggle('booking-payment-tab--active', j === i)
      })
      showPassenger(i)
    })
    dynamicHost.appendChild(tab)
  })

  if (list.length) {
    dynamicHost.querySelector('.booking-payment-tab')?.classList.add('booking-payment-tab--active')
    showPassenger(0)
  }
}

function buildTransferContent(booking, data) {
  const lead = Array.isArray(data?.passengers) ? data.passengers[0] : null
  const name = lead?.full_name || lead?.fullName || ''
  const phone = lead?.phone || ''
  const seats =
    data?.seats?.map((s) => s.seat_number).join(', ') ||
    booking?.selected_seats_label ||
    ''
  const parts = [name, seats, phone].filter(Boolean)
  if (parts.length) return parts.join(' + ')
  return PAYMENT_BANK.transferHint
}

function fillBankTransfer(page, booking, data) {
  const bankRoot = page.querySelector('[class*="frame329-elm"]') || page
  const qrHost = page.querySelector('[class*="framenhchuyni-elm"]')

  if (qrHost) {
    qrHost.classList.add('booking-payment-qr')
    qrHost.style.backgroundImage = 'none'
    let img = qrHost.querySelector('.booking-payment-qr__img')
    if (!img) {
      qrHost.innerHTML = ''
      img = document.createElement('img')
      img.className = 'booking-payment-qr__img'
      img.alt = 'Mã QR chuyển khoản ACB'
      qrHost.appendChild(img)
    }
    img.src = qrPaymentImg
  }

  setPlainText(bankRoot.querySelector('[class*="text-elm226"]'), PAYMENT_BANK.name)
  setPlainText(bankRoot.querySelector('[class*="text-elm232"]'), PAYMENT_BANK.accountNumber)
  setPlainText(bankRoot.querySelector('[class*="text-elm238"]'), PAYMENT_BANK.accountHolder)
  setPlainText(
    bankRoot.querySelector('[class*="text-elm244"]'),
    buildTransferContent(booking, data),
  )
}

function fillPaymentPage(page, booking, data) {
  try {
    const heading = page.querySelector('[class*="text-elm121"]')
    if (heading) heading.textContent = 'Thanh toán'

    page.querySelector('.booking-payment-summary')?.remove()

    const tripRoot = page.querySelector('[class*="frame311-elm"]')
    const customerRoot = page.querySelector('[class*="frame310-elm"]')
    const passengers = Array.isArray(data?.passengers) ? data.passengers : []
    const seats = Array.isArray(data?.seats) ? data.seats : []

    fillTripDetails(tripRoot, booking, data)
    fillContactInfo(customerRoot, passengers)

    const pickupLabel = booking.pickup_point || booking.destination || ''
    setupPaymentPassengerTabs(page, passengers, seats, pickupLabel)
    fillBankTransfer(page, booking, data)
  } catch (err) {
    console.error('[bindPaymentPage]', err)
  }
}

/** Trang thanh toán — đồng bộ 4 bước trước (lịch, ghế, DV, hành khách) */
export async function bindPaymentPage(page, bookingId) {
  if (!bookingId) return null
  try {
    const data = await bookingsApi.get(bookingId)
    const booking = data?.booking
    if (!booking) return null
    fillPaymentPage(page, booking, data)
    return data
  } catch {
    return null
  }
}
