import { useCallback, useEffect, useRef } from 'react'
import { bookingsApi } from '../api/endpoints.js'
import { applyAccountSidebarIcons } from '../utils/accountIcons.js'
import { fillTicketSlots, TICKET_LIST_SELECTOR } from '../utils/ticketCard.js'

const SLUG_CONFIG = {
  thongtinvedadat: {
    status: 'active',
    showCancel: true,
    emptyMessage: 'Bạn chưa có vé đang hiệu lực.',
  },
  thongtinvedahuy: {
    status: 'cancelled',
    showCancel: false,
    emptyMessage: 'Chưa có vé đã hủy.',
  },
}

/**
 * Trang Vé đã đặt (/ve-cua-toi) và Vé đã hủy (/ve-da-huy).
 */
export function TeleportTicketsBinder({ slug, data, loading }) {
  const config = SLUG_CONFIG[slug]
  const bookings = Array.isArray(data?.bookings) ? data.bookings : []
  const cancelHandlerRef = useRef(null)

  const refreshList = useCallback(async () => {
    if (!config) return
    const pageEl = document.querySelector(`.teleport-page--${slug}`)
    const listRoot = pageEl?.querySelector(TICKET_LIST_SELECTOR)
    if (!listRoot) return

    try {
      const fresh = await bookingsApi.mine(config.status)
      fillTicketSlots(listRoot, fresh.bookings, {
        showCancel: config.showCancel,
        emptyMessage: config.emptyMessage,
      })
    } catch {
      /* giữ danh sách hiện tại */
    }
  }, [slug, config])

  useEffect(() => {
    if (!config) return

    const pageEl = document.querySelector(`.teleport-page--${slug}`)
    if (!pageEl) return

    pageEl.querySelector(`[class*="${slug}-link"]`)?.style.setProperty('display', 'none')
    applyAccountSidebarIcons(pageEl)

    const listRoot = pageEl.querySelector(TICKET_LIST_SELECTOR)
    if (!listRoot) return

    listRoot.classList.add('ticket-list')

    if (loading) {
      let loadingEl = listRoot.querySelector('.ticket-list__loading')
      if (!loadingEl) {
        loadingEl = document.createElement('p')
        loadingEl.className = 'ticket-list__loading'
        const tabs = listRoot.querySelector('[class*="frame387-elm"]')
        if (tabs?.nextSibling) {
          listRoot.insertBefore(loadingEl, tabs.nextSibling)
        } else {
          listRoot.appendChild(loadingEl)
        }
      }
      loadingEl.textContent = 'Đang tải danh sách vé…'
      loadingEl.hidden = false
      return
    }

    listRoot.querySelector('.ticket-list__loading')?.remove()
    fillTicketSlots(listRoot, bookings, {
      showCancel: config.showCancel,
      emptyMessage: config.emptyMessage,
    })
  }, [slug, config, bookings, loading])

  useEffect(() => {
    if (!config?.showCancel) return

    const pageEl = document.querySelector(`.teleport-page--${slug}`)
    if (!pageEl) return

    const onCancelClick = async (e) => {
      const action = e.target.closest('.ticket-card__cancel')
      if (!action) return

      const card = action.closest('.ticket-card')
      const bookingId = card?.dataset.bookingId
      if (!bookingId) return

      if (!window.confirm('Bạn có chắc muốn hủy vé này?')) return

      action.setAttribute('aria-busy', 'true')
      try {
        await bookingsApi.cancel(bookingId)
        await refreshList()
      } catch (err) {
        window.alert(err.message || 'Không hủy được vé.')
      } finally {
        action.removeAttribute('aria-busy')
      }
    }

    cancelHandlerRef.current = onCancelClick
    pageEl.addEventListener('click', onCancelClick)
    return () => pageEl.removeEventListener('click', onCancelClick)
  }, [slug, config, refreshList])

  return null
}
