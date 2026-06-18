const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

/** @param {string} label e.g. "Tháng 4" */
export function parseMonthLabel(label) {
  const match = /Tháng\s*(\d{1,2})/i.exec(String(label || '').trim())
  if (!match) return null
  const month = Number.parseInt(match[1], 10)
  if (month < 1 || month > 12) return null
  return month
}

export function formatMonthLabel(month) {
  return `Tháng ${month}`
}

export function dayKeyFromDate(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  return `${y}-${m}-${d}`
}

export function dayKeyFromIso(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return dayKeyFromDate(date)
}

/** @param {Array<{ month_label?: string, departure_at?: string }>} schedules */
export function collectMonthLabels(schedules) {
  const seen = new Map()
  for (const row of schedules || []) {
    const label = row.month_label?.trim()
    if (!label) continue
    const month = parseMonthLabel(label)
    if (!month) continue
    if (!seen.has(label)) seen.set(label, month)
  }
  return [...seen.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label)
}

/** @param {Array<{ departure_at?: string }>} schedules */
export function inferYearForMonth(schedules, monthNumber) {
  for (const row of schedules || []) {
    const m = parseMonthLabel(row.month_label) ?? new Date(row.departure_at).getMonth() + 1
    if (m !== monthNumber) continue
    const y = new Date(row.departure_at).getFullYear()
    if (!Number.isNaN(y)) return y
  }
  return new Date().getFullYear()
}

/** @param {Array<{ departure_at?: string }>} schedules */
export function groupSchedulesByDay(schedules) {
  const map = new Map()
  for (const schedule of schedules || []) {
    const key = dayKeyFromIso(schedule.departure_at)
    if (!key) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(schedule)
  }
  return map
}

/** @returns {(number|null)[]} cells length multiple of 7 */
export function buildCalendarCells(year, month) {
  const first = new Date(year, month - 1, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function getWeekdayLabels() {
  return WEEKDAY_LABELS
}

export function formatDayHeading(year, month, day) {
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
