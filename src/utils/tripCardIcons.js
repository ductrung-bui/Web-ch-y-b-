export const TRIP_USER_ICON = '/icons/trip-user.svg'
export const TRIP_CALENDAR_ICON = '/icons/trip-calendar.svg'
export const SEAT_BOOKED_ICON = '/icons/seat-booked.svg'
export const SEAT_EMPTY_ICON = '/icons/seat-empty.svg'

/** Icon ghế đã có chủ / ghế trống trên thẻ chuyến đi */
export function applyTripCardIcons(root) {
  if (!root) return

  root.querySelectorAll('[class*="slng-elm"] img[class*="user-elm"]').forEach((img) => {
    img.src = SEAT_BOOKED_ICON
    img.alt = 'Ghế đã có chủ'
  })

  root.querySelectorAll('[class*="thigian-elm"] img[class*="calendar-elm"]').forEach((img) => {
    img.src = SEAT_EMPTY_ICON
    img.alt = 'Ghế trống'
  })
}
