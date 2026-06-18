import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { schedulesApi } from '../api/endpoints.js'
import {
  buildCalendarCells,
  collectMonthLabels,
  dayKeyFromDate,
  formatDayHeading,
  formatMonthLabel,
  getWeekdayLabels,
  groupSchedulesByDay,
  inferYearForMonth,
  parseMonthLabel,
} from '../utils/monthCalendar.js'

function filterSchedulesByMonth(schedules, monthLabel) {
  if (!monthLabel) return schedules
  return schedules.filter((row) => row.month_label?.trim() === monthLabel)
}

function renderMonthTabs(host, months, activeMonth) {
  if (!host) return
  host.innerHTML = ''
  host.className = 'calendar-month-tabs-mount calendar-month-tabs'

  months.forEach((label) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'calendar-month-tabs__btn'
    btn.textContent = label
    btn.dataset.calendarMonth = label
    if (label === activeMonth) btn.classList.add('calendar-month-tabs__btn--active')
    btn.setAttribute('aria-pressed', label === activeMonth ? 'true' : 'false')
    host.appendChild(btn)
  })
}

function renderTripList(panel, trips, navigate) {
  if (!panel) return

  panel.innerHTML = ''
  if (!trips.length) {
    const empty = document.createElement('p')
    empty.className = 'month-calendar__empty'
    empty.textContent = 'Không có chuyến trong ngày này.'
    panel.appendChild(empty)
    return
  }

  const list = document.createElement('ul')
  list.className = 'month-calendar__trips'

  trips.forEach((trip) => {
    const li = document.createElement('li')
    li.className = 'month-calendar__trip'

    const name = document.createElement('span')
    name.className = 'month-calendar__trip-name'
    const tripName = trip.trip_title || 'Chuyến đi'
    name.textContent = tripName
    name.title = tripName

    const meta = document.createElement('span')
    meta.className = 'month-calendar__trip-meta'
    const time = trip.departure_at
      ? new Date(trip.departure_at).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        })
      : ''
    const price = trip.price != null ? `${Number(trip.price).toLocaleString('vi-VN')}đ` : ''
    meta.textContent = [time, price].filter(Boolean).join(' · ')

    const link = document.createElement('button')
    link.type = 'button'
    link.className = 'month-calendar__trip-link'
    link.textContent = 'Đặt vé'
    link.addEventListener('click', (e) => {
      e.stopPropagation()
      const q = new URLSearchParams()
      if (trip.trip_id) q.set('tripId', String(trip.trip_id))
      if (trip.id) q.set('scheduleId', String(trip.id))
      navigate(`/chon-thoi-gian-chuyen-di?${q.toString()}`)
    })

    li.append(name, meta, link)
    list.appendChild(li)
  })

  panel.appendChild(list)
}

function renderCalendarBoard(host, options) {
  const { year, month, schedulesByDay, selectedDayKey, loading, navigate } = options

  if (!host) return

  const existingPanel = host.querySelector('.month-calendar__panel')
  host.classList.add('calendar-board-host')

  if (loading && !host.querySelector('.month-calendar__grid')) {
    host.innerHTML = ''
    const loadingEl = document.createElement('p')
    loadingEl.className = 'month-calendar__loading'
    loadingEl.textContent = 'Đang tải lịch chuyến đi…'
    host.appendChild(loadingEl)
    return
  }

  let title = host.querySelector('.month-calendar__title')
  let weekdays = host.querySelector('.month-calendar__weekdays')
  let grid = host.querySelector('.month-calendar__grid')
  let panel = existingPanel

  if (!title) {
    host.innerHTML = ''
    title = document.createElement('h2')
    title.className = 'month-calendar__title'
    host.appendChild(title)

    weekdays = document.createElement('div')
    weekdays.className = 'month-calendar__weekdays'
    getWeekdayLabels().forEach((label) => {
      const cell = document.createElement('div')
      cell.className = 'month-calendar__weekday'
      cell.textContent = label
      weekdays.appendChild(cell)
    })
    host.appendChild(weekdays)

    grid = document.createElement('div')
    grid.className = 'month-calendar__grid'
    grid.setAttribute('role', 'grid')
    host.appendChild(grid)

    panel = document.createElement('div')
    panel.className = 'month-calendar__panel'
    host.appendChild(panel)
  }

  host.querySelector('.month-calendar__loading')?.remove()

  title.textContent = `${formatMonthLabel(month)} ${year}`
  grid.setAttribute('aria-label', `Lịch ${formatMonthLabel(month)} ${year}`)
  grid.innerHTML = ''

  const cells = buildCalendarCells(year, month)
  cells.forEach((day) => {
    const cell = document.createElement('div')
    cell.className = 'month-calendar__cell'
    cell.setAttribute('role', 'gridcell')

    if (day == null) {
      cell.classList.add('month-calendar__cell--empty')
      grid.appendChild(cell)
      return
    }

    const key = dayKeyFromDate(new Date(year, month - 1, day))
    const dayTrips = schedulesByDay.get(key) || []
    const hasTrip = dayTrips.length > 0

    if (hasTrip) cell.classList.add('month-calendar__cell--has-trip')
    if (key === selectedDayKey) cell.classList.add('month-calendar__cell--selected')

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'month-calendar__day-btn'
    if (hasTrip) {
      btn.dataset.calendarDay = key
    } else {
      btn.disabled = true
      btn.setAttribute('aria-disabled', 'true')
    }
    btn.setAttribute('aria-label', `Ngày ${day}${hasTrip ? `, ${dayTrips.length} chuyến` : ''}`)

    const num = document.createElement('span')
    num.className = 'month-calendar__day-num'
    num.textContent = String(day)
    btn.appendChild(num)

    if (hasTrip) {
      const dots = document.createElement('span')
      dots.className = 'month-calendar__dots'
      const count = Math.min(dayTrips.length, 3)
      for (let i = 0; i < count; i += 1) {
        const dot = document.createElement('span')
        dot.className = 'month-calendar__dot'
        dots.appendChild(dot)
      }
      btn.appendChild(dots)
    }

    cell.appendChild(btn)
    grid.appendChild(cell)
  })

  const panelTitle = document.createElement('h3')
  panelTitle.className = 'month-calendar__panel-title'
  panel.innerHTML = ''

  if (selectedDayKey) {
    const parts = selectedDayKey.split('-')
    const day = Number.parseInt(parts[2], 10)
    panelTitle.textContent = formatDayHeading(year, month, day)
    panel.appendChild(panelTitle)
    renderTripList(panel, schedulesByDay.get(selectedDayKey) || [], navigate)
  } else {
    panelTitle.textContent = 'Chọn ngày có chấm đen để xem chuyến đi'
    panel.appendChild(panelTitle)
    const hint = document.createElement('p')
    hint.className = 'month-calendar__empty'
    hint.textContent = 'Các ngày có lịch khởi hành được đánh dấu trên lịch.'
    panel.appendChild(hint)
  }
}

/**
 * Trang Lịch trong tháng — tab tháng + lưới ngày + danh sách chuyến từ API.
 */
export function TeleportCalendarBinder({ data, loading }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [allSchedules, setAllSchedules] = useState([])
  const [selectedDayKey, setSelectedDayKey] = useState(null)
  const hostsRef = useRef({ page: null, tabs: null, board: null })
  const actionsRef = useRef({})

  const monthParam = params.get('month')?.trim() || ''
  const apiSchedules = Array.isArray(data?.schedules) ? data.schedules : []

  const selectMonth = useCallback(
    (label, monthOptions) => {
      setSelectedDayKey(null)
      const merged = new URLSearchParams(params)
      const first = monthOptions[0]
      if (!label || label === first) merged.delete('month')
      else merged.set('month', label)
      setParams(merged, { replace: true })
    },
    [params, setParams],
  )

  const selectDay = useCallback((key) => {
    setSelectedDayKey(key)
  }, [])

  useEffect(() => {
    schedulesApi
      .calendar()
      .then((res) => setAllSchedules(Array.isArray(res?.schedules) ? res.schedules : []))
      .catch(() => setAllSchedules([]))
  }, [])

  useEffect(() => {
    const pageEl = document.querySelector('.teleport-page--lchtrongthng')
    if (!pageEl) return

    pageEl.querySelector('[class*="lchtrongthng-link"]')?.style.setProperty('display', 'none')

    const section = pageEl.querySelector('[class*="giithiu-elm2"]')
    const frame90 = section?.querySelector('[class*="frame90-elm"]')

    pageEl.querySelector('[class*="button-group-elm"]')?.style.setProperty('display', 'none')
    pageEl.querySelector('[class*="button-elm1"]')?.style.setProperty('display', 'none')
    pageEl.querySelector('[class*="button-elm2"]')?.style.setProperty('display', 'none')

    let tabsHost = section?.querySelector('.calendar-month-tabs-mount')
    if (!tabsHost && section && frame90) {
      tabsHost = document.createElement('div')
      tabsHost.className = 'calendar-month-tabs-mount'
      section.insertBefore(tabsHost, frame90)
    }

    const boardHost = pageEl.querySelector('[class*="frame90-elm"] [class*="image-elm"]')
    pageEl.querySelector('[class*="image1-elm"]')?.style.setProperty('display', 'none')

    hostsRef.current = { page: pageEl, tabs: tabsHost, board: boardHost }

    const onClick = (e) => {
      const monthBtn = e.target.closest('[data-calendar-month]')
      if (monthBtn) {
        e.preventDefault()
        e.stopPropagation()
        actionsRef.current.selectMonth?.(monthBtn.dataset.calendarMonth)
        return
      }

      const dayBtn = e.target.closest('[data-calendar-day]')
      if (dayBtn?.dataset.calendarDay) {
        e.preventDefault()
        e.stopPropagation()
        actionsRef.current.selectDay?.(dayBtn.dataset.calendarDay)
      }
    }

    pageEl.addEventListener('click', onClick)
    return () => pageEl.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const { tabs, board } = hostsRef.current
    if (!tabs || !board) return

    const pool = allSchedules.length ? allSchedules : apiSchedules
    const months = collectMonthLabels(pool)
    const monthOptions = months.length ? months : [formatMonthLabel(new Date().getMonth() + 1)]

    let activeMonth = monthParam
    if (!activeMonth || !monthOptions.includes(activeMonth)) {
      activeMonth = monthOptions[0]
    }

    actionsRef.current.selectMonth = (label) => selectMonth(label, monthOptions)
    actionsRef.current.selectDay = selectDay

    const monthSchedules =
      filterSchedulesByMonth(pool, activeMonth).length > 0
        ? filterSchedulesByMonth(pool, activeMonth)
        : filterSchedulesByMonth(apiSchedules, activeMonth).length > 0
          ? filterSchedulesByMonth(apiSchedules, activeMonth)
          : apiSchedules

    const monthNumber = parseMonthLabel(activeMonth) ?? new Date().getMonth() + 1
    const year = inferYearForMonth(monthSchedules.length ? monthSchedules : pool, monthNumber)
    const schedulesByDay = groupSchedulesByDay(monthSchedules)

    const firstTripDay = [...schedulesByDay.keys()].sort()[0] ?? null
    const effectiveSelectedDay =
      selectedDayKey && schedulesByDay.has(selectedDayKey)
        ? selectedDayKey
        : firstTripDay

    renderMonthTabs(tabs, monthOptions, activeMonth)
    renderCalendarBoard(board, {
      year,
      month: monthNumber,
      schedulesByDay,
      selectedDayKey: effectiveSelectedDay,
      loading: loading && monthSchedules.length === 0,
      navigate,
    })
  }, [
    allSchedules,
    apiSchedules,
    monthParam,
    loading,
    selectedDayKey,
    selectMonth,
    selectDay,
    navigate,
  ])

  return null
}
