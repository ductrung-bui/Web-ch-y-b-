import { SEAT_BOOKED_ICON, SEAT_EMPTY_ICON } from './tripCardIcons.js'

/** Thống kê ghế từ lịch sắp tới (API) hoặc fallback participants trên trip */
export function getTripSeatStats(trip) {
  const total = Number(trip?.seat_total) || 0
  const booked = Number(trip?.seat_booked) || 0
  const available = Number(trip?.seat_available) || 0

  if (total > 0) {
    return {
      total,
      booked,
      available: available > 0 ? available : Math.max(0, total - booked),
      fromSeats: true,
    }
  }

  const maxP = Number(trip?.max_participants) || 0
  const current = Number(trip?.current_participants) || 0
  return {
    total: maxP,
    booked: current,
    available: Math.max(0, maxP - current),
    fromSeats: false,
  }
}

export function formatTripCardSeatLabels(trip) {
  const { booked, available } = getTripSeatStats(trip)
  return {
    bookedLabel: `${booked} đã có chủ`,
    availableLabel: `${available} trống`,
    bookedIcon: SEAT_BOOKED_ICON,
    availableIcon: SEAT_EMPTY_ICON,
  }
}

export function isSeatBlocked(seat) {
  if (seat?.is_mine) return false
  return seat?.status === 'booked' || seat?.status === 'held'
}

export function countSeatsByStatus(seats) {
  const list = Array.isArray(seats) ? seats : []
  const total = list.length
  const booked = list.filter((s) => isSeatBlocked(s)).length
  const available = list.filter(
    (s) => s.status === 'available' || s.is_mine,
  ).length
  return { total, booked, available }
}
