/** Nhãn tiếng Việt chuẩn cho dữ liệu API (chính tả thống nhất với Figma/Teleport) */

export const BOOKING_STATUS_LABELS = {
  draft: 'Nháp',
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
}

export const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  success: 'Thành công',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
}

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  cash: 'Tiền mặt',
}

export function bookingStatusLabel(status) {
  return BOOKING_STATUS_LABELS[status] || status
}

export function enrichBooking(row) {
  if (!row) return row
  return {
    ...row,
    status_label: bookingStatusLabel(row.status),
    trip_title: row.trip_title ? normalizeTripTitle(row.trip_title) : row.trip_title,
  }
}

/** Chuẩn hóa tên chuyến / địa danh theo bản Figma */
export function normalizeTripTitle(title) {
  if (!title) return title
  return title
    .replace(/Đồi chè Tâm Châu/g, 'Đồi Chè Tâm Châu')
    .replace(/đồi chè tâm châu/gi, 'Đồi Chè Tâm Châu')
}

export function normalizeTripRow(trip) {
  if (!trip) return trip
  return {
    ...trip,
    title: normalizeTripTitle(trip.title),
    destination: normalizeDestination(trip.destination),
    short_description: trip.short_description || 'Cung đường Trekking đẹp',
  }
}

function normalizeDestination(dest) {
  if (!dest) return dest
  const map = {
    'Đồi chè Tâm Châu': 'Đồi Chè Tâm Châu',
    'Hồ Ngọc Liêng Ài': 'Hồ Ngọc Liêng Ài',
  }
  return map[dest] || dest
}
