import { addonsApi, authApi, bookingsApi } from '../api/endpoints.js'
import { addonsFromQtyMap, normalizeBookingAddons } from './bookingFormat.js'
import {
  renderPassengerOrderSummary,
  resolveBookingTicketCount,
} from './bookingDom.js'

function passengerFromRow(row) {
  if (!row) return { fullName: '', phone: '', email: '', idNumber: '', dateOfBirth: '' }
  let dob = ''
  if (row.date_of_birth) {
    const d = new Date(row.date_of_birth)
    if (!Number.isNaN(d.getTime())) {
      dob = d.toISOString().slice(0, 10)
    } else {
      dob = String(row.date_of_birth).slice(0, 10)
    }
  }
  return {
    fullName: row.full_name || '',
    phone: row.phone || '',
    email: row.email || '',
    idNumber: row.id_number || '',
    dateOfBirth: dob,
  }
}

function splitDateOfBirth(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { day: '', month: '', year: '' }
  }
  const [year, month, day] = iso.split('-')
  return { day, month, year: String(year) }
}

function readPassengerFromInputs(inputs) {
  const [d, m, y] = [inputs[4], inputs[5], inputs[6]]
  const dateOfBirth =
    d?.value && m?.value && y?.value
      ? `${y.value.padStart(4, '0')}-${String(m.value).padStart(2, '0')}-${String(d.value).padStart(2, '0')}`
      : ''
  return {
    fullName: inputs[0]?.value?.trim() || '',
    phone: inputs[1]?.value?.trim() || '',
    email: inputs[2]?.value?.trim() || '',
    idNumber: inputs[3]?.value?.trim() || '',
    dateOfBirth,
  }
}

function writePassengerToInputs(inputs, passenger) {
  if (!inputs.length) return
  if (inputs[0]) inputs[0].value = passenger.fullName || ''
  if (inputs[1]) inputs[1].value = passenger.phone || ''
  if (inputs[2]) inputs[2].value = passenger.email || ''
  if (inputs[3]) inputs[3].value = passenger.idNumber || ''
  const { day, month, year } = splitDateOfBirth(passenger.dateOfBirth)
  if (inputs[4]) inputs[4].value = day
  if (inputs[5]) inputs[5].value = month
  if (inputs[6]) inputs[6].value = year
}

const PICKUP_MAP_ICON = '/icons/map-pin.svg'

/** Ô điểm đón — icon + tiêu đề/nội dung đậm */
function enhancePickupField(page, pickupLabel) {
  const fieldWrap =
    page.querySelector('[class*="frame277-elm"]') ||
    page.querySelector('[class*="frame280-elm"]')
  const title = fieldWrap?.querySelector('[class*="text-elm43"]')
  const box = fieldWrap?.querySelector('[class*="input-elm8"]')
  const valueSpan = fieldWrap?.querySelector('[class*="text-elm44"]')

  if (fieldWrap) fieldWrap.classList.add('booking-pickup-field')
  if (title) {
    title.classList.add('booking-pickup-field__title')
    title.textContent = 'Điểm đón'
  }

  if (box) {
    box.classList.add('booking-pickup-field__box')
    if (!box.querySelector('.booking-pickup-field__icon')) {
      const icon = document.createElement('img')
      icon.src = PICKUP_MAP_ICON
      icon.alt = ''
      icon.className = 'booking-pickup-field__icon'
      icon.setAttribute('aria-hidden', 'true')
      box.insertBefore(icon, box.firstChild)
    }
    box.querySelectorAll('[class*="chevrondown-elm"]').forEach((el) => el.remove())
  }

  if (valueSpan) {
    valueSpan.classList.add('booking-pickup-field__value')
    valueSpan.textContent = pickupLabel
    valueSpan.setAttribute('title', pickupLabel)
  }
}

/** Đổi wrapper form từ &lt;button&gt; sang &lt;div&gt; để input hợp lệ */
function unwrapPassengerFormWrap(page) {
  const btn = page.querySelector('[class*="button-frame283-elm"]')
  if (!btn) return null
  if (btn.tagName !== 'BUTTON') {
    btn.classList.add('booking-passenger-form-wrap')
    return btn
  }
  const div = document.createElement('div')
  div.className = `${btn.className} booking-passenger-form-wrap`
  while (btn.firstChild) div.appendChild(btn.firstChild)
  btn.replaceWith(div)
  return div
}

/** Tab hành khách — tối đa 4 trên một hàng, tự xuống dòng */
function setupPassengerTabs(component2, ticketCount, onSelect) {
  component2.classList.add('booking-passenger-header')

  component2
    .querySelectorAll(
      '[class*="button-elm1"], [class*="button-elm2"], [class*="button-elm3"], [class*="rectangle7-elm"]',
    )
    .forEach((el) => {
      if (el.matches('[class*="rectangle7-elm"]')) {
        el.remove()
        return
      }
      el.style.display = 'none'
      el.hidden = true
    })

  let tabsHost = component2.querySelector('.booking-passenger-tabs')
  if (!tabsHost) {
    tabsHost = document.createElement('div')
    tabsHost.className = 'booking-passenger-tabs'
    tabsHost.setAttribute('role', 'tablist')
    const titleWrap = component2.querySelector('[class*="text-elm33"]')
    if (titleWrap) titleWrap.after(tabsHost)
    else component2.prepend(tabsHost)
  }

  tabsHost.innerHTML = ''
  const tabButtons = []

  for (let i = 0; i < ticketCount; i++) {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'booking-passenger-tab'
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-label', `Hành khách ${i + 1}`)
    tab.textContent = `Hành khách ${i + 1}`
    tab.addEventListener('click', () => onSelect(i))
    tabsHost.appendChild(tab)
    tabButtons.push(tab)
  }

  return tabButtons
}

function removeConfirmBookingButton(page) {
  page
    .querySelectorAll('[class*="button-elm4"]')
    .forEach((btn) => {
      const label = btn.textContent?.trim() || ''
      if (label.includes('Xác nhận đặt vé')) btn.remove()
    })
}

function layoutPassengerSummary(page, formWrap, booking, data) {
  removeConfirmBookingButton(page)

  const frame282 = page.querySelector('[class*="frame282-elm"]')
  let summaryRoot = page.querySelector('[class*="frame281-elm"]')

  if (summaryRoot && frame282 && summaryRoot.parentElement !== frame282) {
    frame282.appendChild(summaryRoot)
  }

  if (!summaryRoot && frame282) {
    summaryRoot = document.createElement('div')
    summaryRoot.className = 'booking-passenger-order-summary'
    frame282.appendChild(summaryRoot)
  }

  if (summaryRoot) {
    summaryRoot.classList.add('booking-order-summary-box')
    renderPassengerOrderSummary(summaryRoot, booking, data)
  }

  if (formWrap) formWrap.classList.add('booking-passenger-form-wrap')
}

function resolvePassengerAddons(order, { addonQty, addonsCatalog }) {
  const fromApi = normalizeBookingAddons(order?.addons)
  const fromDraft = addonsFromQtyMap(addonQty, addonsCatalog)
  if (!fromDraft.length) return fromApi
  if (!fromApi.length) return fromDraft

  const byId = new Map(fromApi.map((row) => [Number(row.id), row]))
  for (const row of fromDraft) {
    const id = Number(row.id)
    const existing = byId.get(id)
    if (!existing || row.quantity > existing.quantity) {
      byId.set(id, row)
    }
  }
  return [...byId.values()].filter((row) => row.quantity > 0)
}

/** Trang Thông tin — đồng bộ trip, ghế, dịch vụ bổ sung và form hành khách */
export function bindPassengerPage(page, ctx, { onMessage, onSuccess, addonQty, tripId } = {}) {
  const bookingId = ctx.draft.bookingId
  if (!bookingId) {
    onMessage?.('Chưa có đơn đặt vé.', true)
    return
  }

  onMessage?.('')

  removeConfirmBookingButton(page)

  const component2 = page.querySelector('[class*="component2-elm"]')
  const heading = page.querySelector('[class*="text-elm34"]')
  if (heading) heading.textContent = 'Thông tin hành khách'

  unwrapPassengerFormWrap(page)

  const inputs = [...page.querySelectorAll('input[class*="input-elm"]')].filter(
    (el) => el.type !== 'hidden',
  )

  let ticketCount = 1
  let passengers = [{ fullName: '', phone: '', email: '', idNumber: '', dateOfBirth: '' }]
  let activeIndex = 0
  let tabButtons = []

  const setActiveTab = (index) => {
    if (index < 0 || index >= ticketCount) return
    activeIndex = index
    tabButtons.forEach((btn, i) => {
      const active = i === index
      btn.classList.toggle('booking-passenger-tab--active', active)
      btn.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    writePassengerToInputs(inputs, passengers[index] || {})
  }

  const saveCurrentTab = () => {
    passengers[activeIndex] = readPassengerFromInputs(inputs)
  }

  const tripIdForAddons = tripId || ctx.draft?.tripId

  void Promise.all([
    bookingsApi.get(bookingId).catch(() => null),
    authApi.me().catch(() => ({ user: null })),
    tripIdForAddons
      ? addonsApi.list(tripIdForAddons).catch(() => ({ addons: [] }))
      : Promise.resolve({ addons: [] }),
  ]).then(([data, authRes, catalogRes]) => {
    if (!data?.booking) return

    const order = {
      ...data,
      baseTicketAmount: Number(data.booking.ticket_amount || 0),
    }
    const b = order.booking
    const mergedAddons = resolvePassengerAddons(order, {
      addonQty,
      addonsCatalog: catalogRes?.addons || [],
    })
    const orderWithAddons = { ...order, addons: mergedAddons }
    ticketCount = resolveBookingTicketCount(b, order)

    if (component2) {
      tabButtons = setupPassengerTabs(component2, ticketCount, (i) => {
        saveCurrentTab()
        setActiveTab(i)
      })
    }

    passengers = Array.from({ length: ticketCount }, (_, i) =>
      passengerFromRow(order.passengers?.[i]),
    )

    if (!passengers[0]?.fullName && authRes?.user) {
      passengers[0] = {
        fullName: authRes.user.full_name || '',
        phone: authRes.user.phone || '',
        email: authRes.user.email || '',
        idNumber: passengers[0]?.idNumber || '',
        dateOfBirth: passengers[0]?.dateOfBirth || '',
      }
    }

    const pickupLabel = b.pickup_point || b.destination || 'Điểm đón theo lịch trình'
    enhancePickupField(page, pickupLabel)

    const formWrap = page.querySelector('.booking-passenger-form-wrap')
    layoutPassengerSummary(page, formWrap, b, orderWithAddons)

    setActiveTab(0)
  })

  ctx.runNext = async () => {
    saveCurrentTab()
    const list = passengers.slice(0, ticketCount)
    if (!list[0]?.fullName) {
      onMessage?.('Nhập họ và tên hành khách.', true)
      return
    }
    try {
      await bookingsApi.setPassengers(bookingId, list)
      onSuccess?.()
    } catch (e) {
      onMessage?.(e.message || 'Không lưu thông tin.', true)
    }
  }
}
