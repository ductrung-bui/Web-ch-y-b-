import { normalizeTripTitle } from './dataText.js'

export function formatScheduleDateTime(departureAt) {
  if (!departureAt) return 'Đang cập nhật'
  const d = new Date(departureAt)
  if (Number.isNaN(d.getTime())) return String(departureAt)
  const time = d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `lúc ${time}`
}

export function countAvailableSeats(seats) {
  if (!Array.isArray(seats)) return null
  return seats.filter((s) => s.status === 'available').length
}

export function formatSeatsLeft(schedule, seats) {
  if (schedule?.available_seats != null && schedule.available_seats !== '') {
    const n = Number(schedule.available_seats)
    if (!Number.isNaN(n)) return `Còn lại ${n} ghế`
  }
  const fromList = countAvailableSeats(seats)
  if (fromList != null) return `Còn lại ${fromList} ghế`
  const total = Number(schedule?.total_seats ?? 0)
  const booked = Number(schedule?.booked_seats ?? 0)
  const left = Math.max(0, total - booked)
  return `Còn lại ${left} ghế`
}

export function formatSchedulePrice(amount) {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`
}

export function formatAddonPrice(amount) {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`
}

export function tripDisplayTitle(trip) {
  return normalizeTripTitle(trip?.title) || 'Chuyến đi'
}

/** Chuẩn hóa dòng dịch vụ từ API booking */
export function normalizeBookingAddons(addons) {
  return (addons || [])
    .map((row) => ({
      id: row.addon_service_id ?? row.addonServiceId ?? row.id,
      name: row.name || row.addon_name || 'Dịch vụ',
      quantity: Number(row.quantity) || 0,
    }))
    .filter((a) => a.quantity > 0)
}

/** Gộp số lượng đã chọn ở bước dịch vụ bổ sung (draft) với danh mục addon */
export function addonsFromQtyMap(addonQty, catalog = []) {
  return Object.entries(addonQty || {})
    .map(([id, quantity]) => {
      const qty = Number(quantity) || 0
      if (qty <= 0) return null
      const item = catalog.find((a) => Number(a.id) === Number(id))
      return {
        id: Number(id),
        name: item?.name || `Dịch vụ #${id}`,
        quantity: qty,
      }
    })
    .filter(Boolean)
}

/** Tóm tắt số lượng + chi tiết dịch vụ bổ sung */
export function summarizeBookingAddons(addons) {
  const selected = normalizeBookingAddons(addons)
  const kindCount = selected.length
  const totalQty = selected.reduce((sum, row) => sum + row.quantity, 0)

  if (!kindCount) {
    return {
      isEmpty: true,
      kindCount: 0,
      totalQty: 0,
      countLabel: 'Không chọn',
      detail: '',
      fullLine: 'Dịch vụ bổ sung: Không chọn',
    }
  }

  const detail = selected.map((a) => `${a.name} ×${a.quantity}`).join(', ')
  const countLabel =
    kindCount === 1 && totalQty === 1
      ? '1 dịch vụ'
      : `${totalQty} món (${kindCount} loại)`

  return {
    isEmpty: false,
    kindCount,
    totalQty,
    countLabel,
    detail,
    fullLine: `Dịch vụ bổ sung: ${countLabel}${detail ? ` — ${detail}` : ''}`,
  }
}

/** Dòng tóm tắt dịch vụ bổ sung đã chọn */
export function formatAddonSummaryLine(addons) {
  return summarizeBookingAddons(addons).fullLine
}
