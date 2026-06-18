/** Đồng bộ chính tả hiển thị với API / Figma */

export function normalizeTripTitle(title) {
  if (!title) return title
  return title.replace(/Đồi chè Tâm Châu/g, 'Đồi Chè Tâm Châu')
}

export function formatTripPrice(amount) {
  return `${Number(amount).toLocaleString('vi-VN')}/Vé`
}
