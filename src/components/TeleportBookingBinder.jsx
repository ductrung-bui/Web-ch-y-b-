import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingsApi } from '../api/endpoints.js'
import { useBooking } from '../context/BookingContext.jsx'
import { BOOKING_FLOW } from '../navigationConfig.js'
import { applyAddonQtyIcons, resolveAddonImageUrl } from '../utils/addonImages.js'
import { applyTripCardImageHost, bindTripImageSlot } from '../utils/tripDetailImages.js'
import {
  formatAddonPrice,
  formatScheduleDateTime,
  formatSchedulePrice,
  formatSeatsLeft,
  tripDisplayTitle,
} from '../utils/bookingFormat.js'
import {
  bindBookingClick,
  bookingFlowFor,
  closestNavHost,
  fillSlotsInPlace,
  findSpanByText,
  getScheduleCardLineSpans,
  loadBookingOrderSummary,
  setHostText,
  updateAddonPreviewTotal,
  withBookingQuery,
} from '../utils/bookingDom.js'
import { bindPassengerPage } from '../utils/bookingPassengers.js'
import { bindPaymentPage } from '../utils/bookingPayment.js'
import { bindBookingSteps } from '../utils/bookingSteps.js'
import {
  renderBusSeatMap,
  renderSeatLegend,
  updateSeatSummary,
} from '../utils/bookingBusMap.js'
import { countSeatsByStatus } from '../utils/seatStats.js'
import { tripDetailPath } from '../utils/tripCardNav.js'

const SCHEDULE_CARD_SELECTOR =
  '[class*="frame146-elm"], [class*="frame147-elm"], [class*="frame148-elm"], [class*="frame149-elm2"]'

const MONTH_TAB_SELECTOR =
  '[class*="frame154-elm"] > [class*="frame149-elm1"], [class*="frame154-elm"] > [class*="frame150-elm"], [class*="frame154-elm"] > [class*="frame151-elm"], [class*="frame154-elm"] > [class*="frame152-elm"]'

function uniqueMonthLabels(schedules) {
  const seen = new Set()
  const out = []
  for (const row of schedules || []) {
    const label = row.month_label?.trim()
    if (!label || seen.has(label)) continue
    seen.add(label)
    out.push(label)
  }
  return out
}

function showBookingMessage(page, text, isError = false) {
  let el = page.querySelector('.booking-flow-message')
  if (!el) {
    el = document.createElement('p')
    el.className = 'booking-flow-message'
    const host =
      page.querySelector('[class*="khungchn-elm"]') ||
      page.querySelector('[class*="khungchnthigian-elm"]') ||
      page
    host.prepend(el)
  }
  el.textContent = text || ''
  el.hidden = !text
  el.classList.toggle('booking-flow-message--error', Boolean(isError))
}

function bindStepNav(page, slug, ctx) {
  const flow = bookingFlowFor(slug)
  if (!flow) return

  const backSpan = findSpanByText(page, 'Quay lại')
  const nextSpan = findSpanByText(page, 'Tiếp theo')
  const backHost = closestNavHost(backSpan)
  const nextHost = closestNavHost(nextSpan)

  if (backHost) {
    backHost.classList.add('booking-nav-btn', 'booking-nav-btn--back')
    bindBookingClick(backHost, async () => {
      if (flow.back) {
        ctx.navigate(withBookingQuery(flow.back, ctx.searchParams, ctx.draft))
        return
      }
      if (ctx.draft.tripId) {
        ctx.navigate(tripDetailPath(ctx.draft.tripId))
      } else {
        ctx.navigate('/trang-chu')
      }
    })
  }

  if (nextHost) {
    nextHost.classList.add('booking-nav-btn', 'booking-nav-btn--next')
    bindBookingClick(nextHost, () => {
      if (typeof ctx.runNext === 'function') ctx.runNext()
    })
  }
}

function bindChooseTime(page, data, ctx, store) {
  const trip = data?.trip
  const schedules = Array.isArray(data?.schedules) ? data.schedules : []
  const tripId = ctx.searchParams.get('tripId') || ctx.draft.tripId

  if (!tripId) {
    showBookingMessage(page, 'Chưa chọn chuyến đi. Vui lòng quay lại trang chủ.', true)
    return
  }

  const urlScheduleId = ctx.searchParams.get('scheduleId')
  if (store.lastChooseTimeTripId !== String(tripId)) {
    store.lastChooseTimeTripId = String(tripId)
    store.selectedScheduleId = urlScheduleId ? Number(urlScheduleId) : null
  } else if (urlScheduleId) {
    store.selectedScheduleId = Number(urlScheduleId)
  } else if (!store.selectedScheduleId && ctx.draft.scheduleId) {
    store.selectedScheduleId = Number(ctx.draft.scheduleId)
  }

  showBookingMessage(page, '')

  const titleHost =
    page.querySelector('[class*="framenhtv-elm"] [class*="text-elm55"]') ||
    page.querySelector('[class*="framenhtv-elm"] span')
  if (titleHost) setHostText(titleHost.parentElement || titleHost, tripDisplayTitle(trip))

  const imageHost = page.querySelector('[class*="framenhtv-elm"] [class*="image-elm"]')
  if (trip) applyTripCardImageHost(imageHost, trip, 0)

  const months = uniqueMonthLabels(schedules)
  const monthTabs = [...page.querySelectorAll(MONTH_TAB_SELECTOR)]
  let activeMonth = months[0] || ''

  const renderSchedules = () => {
    const filtered = activeMonth
      ? schedules.filter((s) => s.month_label?.trim() === activeMonth)
      : schedules

    const listRoot =
      page.querySelector('[class*="frame145-frame157-elm"]') ||
      page.querySelector('[class*="frame157-elm"]')

    if (!listRoot) return

    fillSlotsInPlace(listRoot, {
      itemSelector: SCHEDULE_CARD_SELECTOR,
      items: filtered,
      fillItem: (card, schedule) => {
        card.classList.add('booking-schedule-card')
        card.dataset.scheduleId = String(schedule.id)
        card.classList.toggle(
          'booking-schedule-card--selected',
          String(store.selectedScheduleId) === String(schedule.id),
        )

        const { title, date, seats } = getScheduleCardLineSpans(card)
        const tripTitle = tripDisplayTitle(trip)
        if (title) {
          title.textContent = tripTitle
          if (tripTitle) title.setAttribute('title', tripTitle)
        }
        if (date) date.textContent = formatScheduleDateTime(schedule.departure_at)
        if (seats) seats.textContent = formatSeatsLeft(schedule)

      },
    })

    if (!listRoot.dataset.schedulePickBound) {
      listRoot.dataset.schedulePickBound = '1'
      listRoot.addEventListener('click', (e) => {
        const card = e.target.closest('.booking-schedule-card')
        if (!card?.dataset.scheduleId) return
        store.selectedScheduleId = Number(card.dataset.scheduleId)
        showBookingMessage(page, '')
        listRoot.querySelectorAll('.booking-schedule-card').forEach((c) => {
          c.classList.toggle(
            'booking-schedule-card--selected',
            c.dataset.scheduleId === String(store.selectedScheduleId),
          )
        })
      })
    }

    if (!filtered.length) {
      showBookingMessage(page, 'Không có lịch khởi hành trong tháng này.', true)
    }
  }

  monthTabs.forEach((tab, index) => {
    const label = months[index]
    if (!label) {
      tab.style.display = 'none'
      tab.hidden = true
      return
    }
    tab.style.display = ''
    tab.hidden = false
    const span = tab.querySelector('span')
    if (span) span.textContent = label
    tab.classList.toggle('booking-month-tab--active', label === activeMonth)
    bindBookingClick(tab, () => {
      activeMonth = label
      monthTabs.forEach((t, i) => {
        const m = months[i]
        t.classList.toggle('booking-month-tab--active', m === activeMonth)
      })
      renderSchedules()
    })
  })

  renderSchedules()

  ctx.runNext = async () => {
    const scheduleId = store.selectedScheduleId
    if (!scheduleId) {
      showBookingMessage(page, 'Vui lòng chọn lịch khởi hành.', true)
      return
    }
    try {
      const { booking } = await bookingsApi.create({
        tripScheduleId: Number(scheduleId),
        ticketCount: 1,
      })
      const newDraft = {
        bookingId: booking.id,
        tripId: trip?.id ?? tripId,
        scheduleId: Number(scheduleId),
      }
      store.lastBookingId = booking.id
      ctx.setDraft(newDraft)
      const flow = BOOKING_FLOW.manhinhchonthoigianchuyendi
      ctx.navigate(withBookingQuery(flow.next, ctx.searchParams, newDraft))
    } catch (e) {
      showBookingMessage(page, e.message || 'Không tạo được đơn đặt vé.', true)
    }
  }
}

function bindChooseSeats(page, data, ctx, store) {
  const seats = Array.isArray(data?.seats) ? data.seats : []
  const schedule = data?.schedule
  const bookingId =
    ctx.searchParams.get('bookingId') ||
    ctx.draft.bookingId ||
    store.lastBookingId
  const scheduleId =
    ctx.searchParams.get('scheduleId') ||
    ctx.draft.scheduleId ||
    store.selectedScheduleId

  if (!bookingId || !scheduleId) {
    showBookingMessage(page, 'Chưa có thông tin đặt vé. Quay lại bước chọn thời gian.', true)
    return
  }

  store.lastBookingId = Number(bookingId)
  store.selectedScheduleId = Number(scheduleId)

  const mineIds = seats.filter((s) => s.is_mine).map((s) => Number(s.id))
  if (mineIds.length > 0) {
    store.pickedSeats = new Set(mineIds)
  } else if (!store.pickedSeats || !(store.pickedSeats instanceof Set)) {
    store.pickedSeats = new Set()
  }

  showBookingMessage(page, '')

  const summaryRoot = page.querySelector('[class*="frame266-elm"]')
  if (summaryRoot && schedule) {
    const blocks = [...summaryRoot.children].filter((n) =>
      n.matches?.('[class*="text-elm"]'),
    )
    if (blocks[0]) {
      setHostText(blocks[0], tripDisplayTitle({ title: schedule.trip_title }))
    }
    if (blocks[1]) {
      setHostText(blocks[1], formatScheduleDateTime(schedule.departure_at))
    }

    let availEl = summaryRoot.querySelector('.booking-seats-available-count')
    if (!availEl) {
      availEl = document.createElement('p')
      availEl.className = 'booking-seats-available-count'
      const insertBefore = blocks[2] || blocks[3] || null
      if (insertBefore) summaryRoot.insertBefore(availEl, insertBefore)
      else summaryRoot.appendChild(availEl)
    }
    const available =
      schedule.available_seats != null
        ? Number(schedule.available_seats)
        : seats.filter((s) => s.status === 'available').length
    availEl.textContent = `Còn lại ${available} ghế trống`

    if (blocks[3] && schedule.price != null) {
      setHostText(
        blocks[3],
        formatSchedulePrice(
          Number(schedule.price) * store.pickedSeats.size,
        ),
      )
    }
  }

  const busRoot = page.querySelector('[class*="vtrgh-elm"]')
  const seatSummaryOpts = {
    summaryRoot,
    schedule,
    formatPrice: formatSchedulePrice,
    setHostText,
  }

  const toggleSeat = (id) => {
    if (store.pickedSeats.has(id)) store.pickedSeats.delete(id)
    else store.pickedSeats.add(id)
    updateSeatSummary(page, store.pickedSeats, seats, seatSummaryOpts)
    showBookingMessage(page, '')
  }

  const rendered = renderBusSeatMap(busRoot, seats, store.pickedSeats, toggleSeat)
  if (!rendered) {
    showBookingMessage(page, 'Chưa có ghế cho lịch này. Vui lòng thử lịch khác.', true)
    return
  }

  const stats = countSeatsByStatus(seats)
  renderSeatLegend(page, seats, store.pickedSeats.size)

  let availEl = summaryRoot?.querySelector('.booking-seats-available-count')
  if (availEl) {
    availEl.textContent = `Còn lại ${stats.available} / ${stats.total} ghế trống`
  }

  updateSeatSummary(page, store.pickedSeats, seats, seatSummaryOpts)

  ctx.runNext = async () => {
    const ids = [...store.pickedSeats]
    if (!ids.length) {
      showBookingMessage(page, 'Chọn ít nhất một ghế.', true)
      return
    }
    try {
      await bookingsApi.setSeats(bookingId, ids)
      const flow = BOOKING_FLOW.manhinhchonvitrighengoi
      const draft = {
        bookingId: Number(bookingId),
        tripId: ctx.draft.tripId || schedule?.trip_id,
        scheduleId: Number(scheduleId),
      }
      ctx.setDraft(draft)
      ctx.navigate(withBookingQuery(flow.next, ctx.searchParams, draft))
    } catch (e) {
      showBookingMessage(page, e.message || 'Không lưu được ghế.', true)
    }
  }
}

function bindAddons(page, data, ctx) {
  const addons = Array.isArray(data?.addons) ? data.addons : []
  const bookingId = ctx.draft.bookingId

  if (!bookingId) {
    showBookingMessage(page, 'Chưa có đơn đặt vé.', true)
    return
  }

  const cards = [...page.querySelectorAll('[class*="khungmuadchvbsung-elm"]')]
  for (const key of Object.keys(ctx.addonQty)) delete ctx.addonQty[key]
  let baseTicketAmount = 0

  if (!addons.length) {
    cards.forEach((card) => {
      card.style.display = 'none'
      card.hidden = true
    })
    showBookingMessage(
      page,
      'Chưa có dịch vụ bổ sung. Bạn có thể bấm Tiếp theo để tiếp tục.',
      false,
    )
  } else {
    showBookingMessage(page, '')
  }

  const syncTotal = () => {
    updateAddonPreviewTotal(page, baseTicketAmount, ctx.addonQty, addons)
  }

  void loadBookingOrderSummary(page, bookingId).then((order) => {
    if (!order) return
    baseTicketAmount = order.baseTicketAmount || 0
    for (const row of order.addons || []) {
      const id = row.addon_service_id ?? row.addonServiceId
      if (id != null) ctx.addonQty[id] = Number(row.quantity) || 0
    }
    cards.forEach((card) => {
      const id = card.dataset.addonId
      if (!id) return
      const qtyBtn = card.querySelector('[class*="calendar-button-elm"]')
      if (qtyBtn) qtyBtn.textContent = String(ctx.addonQty[id] || 0)
    })
    syncTotal()
  })

  cards.forEach((card, index) => {
    const addon = addons[index]
    if (!addon) {
      card.style.display = 'none'
      card.hidden = true
      return
    }
    card.style.display = ''
    card.hidden = false
    card.classList.add('booking-addon-card')
    card.dataset.addonId = String(addon.id)

    const imageHost = card.querySelector('[class*="framenhchuyni-elm"]')
    const productImage = resolveAddonImageUrl(addon)
    if (imageHost) {
      bindTripImageSlot(
        imageHost,
        productImage,
        '/icons/booking-addon.svg',
      )
    }

    applyAddonQtyIcons(card)

    setHostText(card.querySelector('[class*="textaim-elm"]'), addon.name)

    const priceSpan =
      card.querySelector('[class*="text-elm44"]') ||
      card.querySelector('[class*="text-elm51"]') ||
      card.querySelector('[class*="text-elm58"]') ||
      card.querySelector('[class*="text-elm65"]')
    if (priceSpan) priceSpan.textContent = formatAddonPrice(addon.price)

    const stockSpan =
      card.querySelector('[class*="text-elm46"]') ||
      card.querySelector('[class*="text-elm53"]') ||
      card.querySelector('[class*="text-elm60"]') ||
      card.querySelector('[class*="text-elm67"]')
    if (stockSpan) {
      stockSpan.textContent =
        addon.stock_status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'
    }

    const qtyBtn = card.querySelector('[class*="calendar-button-elm"]')
    if (qtyBtn) {
      qtyBtn.type = 'button'
      qtyBtn.classList.add('booking-addon-qty')
      qtyBtn.textContent = '0'
      qtyBtn.setAttribute('aria-label', 'Số lượng')
    }

    const iconButtons = [...card.querySelectorAll('button[class*="icon-button-elm"]')]
    const minusBtn = iconButtons[0]
    const plusBtn = iconButtons[iconButtons.length - 1]

    const renderQty = () => {
      const q = ctx.addonQty[addon.id] || 0
      if (qtyBtn) qtyBtn.textContent = String(q)
      syncTotal()
    }

    if (minusBtn) {
      minusBtn.type = 'button'
      bindBookingClick(minusBtn, () => {
        ctx.addonQty[addon.id] = Math.max(0, (ctx.addonQty[addon.id] || 0) - 1)
        renderQty()
      })
    }
    if (plusBtn) {
      plusBtn.type = 'button'
      bindBookingClick(plusBtn, () => {
        ctx.addonQty[addon.id] = (ctx.addonQty[addon.id] || 0) + 1
        renderQty()
      })
    }
  })

  ctx.runNext = async () => {
    const items = Object.entries(ctx.addonQty)
      .filter(([, q]) => Number(q) > 0)
      .map(([addonServiceId, quantity]) => ({
        addonServiceId: Number(addonServiceId),
        quantity: Number(quantity),
      }))
    try {
      await bookingsApi.setAddons(bookingId, items)
      const flow = BOOKING_FLOW.dichvubosung
      const draft = {
        bookingId: ctx.draft.bookingId,
        tripId: ctx.draft.tripId,
        scheduleId: ctx.draft.scheduleId,
        addonQty: { ...ctx.addonQty },
      }
      ctx.setDraft(draft)
      ctx.navigate(withBookingQuery(flow.next, ctx.searchParams, draft))
    } catch (e) {
      showBookingMessage(page, e.message || 'Không lưu dịch vụ bổ sung.', true)
    }
  }
}

function bindPassengers(page, ctx) {
  const addonQty = {
    ...(ctx.persistedAddonQty || {}),
    ...(ctx.draft?.addonQty || {}),
    ...(ctx.addonQty || {}),
  }
  bindPassengerPage(page, ctx, {
    addonQty,
    tripId: ctx.draft?.tripId,
    onMessage: (text, isError) => showBookingMessage(page, text, isError),
    onSuccess: () => {
      const flow = BOOKING_FLOW.manhinhdienthongtin
      ctx.navigate(
        withBookingQuery(flow.next, ctx.searchParams, {
          bookingId: ctx.draft.bookingId,
          tripId: ctx.draft.tripId,
          scheduleId: ctx.draft.scheduleId,
        }),
      )
    },
  })
}

function bindPayment(page, ctx) {
  const bookingId = ctx.draft.bookingId
  if (!bookingId) {
    showBookingMessage(page, 'Chưa có đơn đặt vé.', true)
    return
  }

  showBookingMessage(page, '')
  void bindPaymentPage(page, bookingId)

  const confirmBtn = page.querySelector('[class*="button-elm7"]')
  if (confirmBtn) {
    confirmBtn.type = 'button'
    confirmBtn.classList.add('booking-confirm-pay-btn')
  }

  let paying = false

  const completeBooking = async () => {
    if (paying) return
    paying = true
    if (confirmBtn) {
      confirmBtn.disabled = true
      confirmBtn.setAttribute('aria-busy', 'true')
    }
    try {
      const res = await bookingsApi.pay(bookingId, 'bank_transfer')
      ctx.clearDraft()
      showBookingMessage(
        page,
        res.message || 'Đặt vé thành công! Ghế đã được giữ.',
        false,
      )
      window.setTimeout(() => ctx.navigate('/ve-cua-toi'), 1200)
    } catch (e) {
      showBookingMessage(page, e.message || 'Không thể hoàn tất đặt vé.', true)
      paying = false
      if (confirmBtn) {
        confirmBtn.disabled = false
        confirmBtn.removeAttribute('aria-busy')
      }
    }
  }

  ctx.runNext = completeBooking

  if (confirmBtn) {
    bindBookingClick(confirmBtn, () => completeBooking())
  }
}

function bindBookingIcons(page) {
  page.querySelectorAll('img[src*="minusi625"]').forEach((img) => {
    if (img.closest('[class*="khungmuadchvbsung-elm"]')) return
    img.src = '/icons/trip-user.svg'
    img.style.opacity = '0.7'
  })
  page.querySelectorAll('img[src*="plusi625"]').forEach((img) => {
    if (img.closest('[class*="khungmuadchvbsung-elm"]')) return
    img.src = '/icons/trip-calendar.svg'
    img.style.opacity = '0.7'
  })
}

export function TeleportBookingBinder({ slug, data, loading }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setDraft, clearDraft, bookingId, scheduleId, tripId, draft: persistedDraft } =
    useBooking()
  const ctxRef = useRef({
    selectedScheduleId: scheduleId ? Number(scheduleId) : null,
    lastChooseTimeTripId: null,
    lastBookingId: bookingId ? Number(bookingId) : null,
    pickedSeats: new Set(),
    addonQty: {},
    runNext: null,
  })

  useEffect(() => {
    if (loading || !BOOKING_FLOW[slug]) return

    const run = () => {
      const page = document.querySelector(`.teleport-page--${slug}`)
      if (!page) return

      bindBookingIcons(page)
      bindBookingSteps(page, slug)

      const store = ctxRef.current
      const resolvedBookingId =
        searchParams.get('bookingId') || bookingId || store.lastBookingId
      const resolvedTripId = searchParams.get('tripId') || tripId
      const resolvedScheduleId =
        searchParams.get('scheduleId') ||
        scheduleId ||
        store.selectedScheduleId
      const persistedAddonQty = persistedDraft?.addonQty || {}
      for (const [id, qty] of Object.entries(persistedAddonQty)) {
        const n = Number(qty) || 0
        if (n > 0) store.addonQty[id] = n
      }

      const draft = {
        bookingId: resolvedBookingId,
        tripId: resolvedTripId,
        scheduleId: resolvedScheduleId,
        addonQty: { ...persistedAddonQty, ...store.addonQty },
      }

      const ctx = {
        navigate,
        searchParams,
        draft,
        getDraft: () => ({
          bookingId: resolvedBookingId,
          tripId: resolvedTripId,
          scheduleId: resolvedScheduleId,
          addonQty: { ...persistedDraft?.addonQty, ...store.addonQty },
        }),
        setDraft,
        clearDraft,
        addonQty: store.addonQty,
        persistedAddonQty,
      }

      const bindCtx = {
        ...ctx,
        get runNext() {
          return store.runNext
        },
        set runNext(fn) {
          store.runNext = fn
        },
      }

      bindStepNav(page, slug, bindCtx)

      if (slug === 'manhinhchonthoigianchuyendi') bindChooseTime(page, data, bindCtx, store)
      if (slug === 'manhinhchonvitrighengoi') bindChooseSeats(page, data, bindCtx, store)
      if (slug === 'dichvubosung') bindAddons(page, data, bindCtx)
      if (slug === 'manhinhdienthongtin') bindPassengers(page, bindCtx)
      if (slug === 'manhinhthanhtoan') bindPayment(page, bindCtx)
    }

    run()
    const t = window.setTimeout(run, 0)
    return () => window.clearTimeout(t)
  }, [
    slug,
    data,
    loading,
    searchParams.toString(),
    bookingId,
    scheduleId,
    tripId,
    persistedDraft,
    navigate,
    setDraft,
    clearDraft,
  ])

  return null
}
