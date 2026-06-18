import { useEffect } from 'react'
import { applyAccountSidebarIcons } from '../utils/accountIcons.js'
import { fillHistorySlots, HISTORY_LIST_SELECTOR } from '../utils/historyCard.js'

/**
 * Trang Lịch sử chuyến đi — danh sách vé đã hoàn thành / hủy từ API.
 */
export function TeleportHistoryBinder({ data, loading }) {
  const bookings = Array.isArray(data?.bookings) ? data.bookings : []

  useEffect(() => {
    const pageEl = document.querySelector('.teleport-page--lichsuchuyendi')
    if (!pageEl) return

    pageEl.querySelector('[class*="lichsuchuyendi-link"]')?.style.setProperty('display', 'none')
    applyAccountSidebarIcons(pageEl)

    const listRoot = pageEl.querySelector(HISTORY_LIST_SELECTOR)
    if (!listRoot) return

    listRoot.classList.add('history-trips-list')

    if (loading) {
      let loadingEl = listRoot.querySelector('.history-list__loading')
      if (!loadingEl) {
        loadingEl = document.createElement('p')
        loadingEl.className = 'history-list__loading'
        listRoot.appendChild(loadingEl)
      }
      loadingEl.textContent = 'Đang tải lịch sử chuyến đi…'
      loadingEl.hidden = false
      return
    }

    listRoot.querySelector('.history-list__loading')?.remove()
    fillHistorySlots(listRoot, bookings)
  }, [bookings, loading])

  return null
}
