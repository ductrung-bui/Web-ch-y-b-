/** Đường dẫn trang chi tiết / mua vé theo chuyến đi */
export function tripDetailPath(tripOrId) {
  if (tripOrId == null || tripOrId === '') return '/trang-chu'
  if (typeof tripOrId === 'object') {
    const key = tripOrId.slug || tripOrId.id
    if (key == null || key === '') return '/trang-chu'
    return `/chuyen-di/${encodeURIComponent(String(key))}`
  }
  return `/chuyen-di/${encodeURIComponent(String(tripOrId))}`
}

export function tripBookingPath(tripOrId) {
  const tripId =
    typeof tripOrId === 'object' ? tripOrId?.id ?? tripOrId?.trip_id : tripOrId
  if (tripId == null || tripId === '') return '/chon-thoi-gian-chuyen-di'
  return `/chon-thoi-gian-chuyen-di?tripId=${encodeURIComponent(String(tripId))}`
}

export const HOME_TRIP_CARD_SELECTOR = '[class*="product-info-card"]'

export function isHomeTripCard(el) {
  return Boolean(
    el?.classList?.contains('home-trip-card') ||
      el?.matches?.(`${HOME_TRIP_CARD_SELECTOR}[data-trip-id]`),
  )
}

export function readTripTargetFromCard(card) {
  if (!card?.dataset) return null
  const tripId = card.dataset.tripId?.trim()
  if (!tripId) return null
  return {
    tripId,
    slug: card.dataset.tripSlug?.trim() || '',
  }
}
