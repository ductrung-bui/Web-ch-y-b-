export const ACCOUNT_ICONS = {
  user: '/icons/trip-user.svg',
  ticket: '/icons/trip-ticket.svg',
  history: '/icons/trip-history.svg',
  logout: '/icons/logout.svg',
  calendar: '/icons/trip-calendar.svg',
  completed: '/icons/status-completed.svg',
  cancelled: '/icons/status-cancelled.svg',
  cancelTicket: '/icons/ticket-cancel.svg',
  ticketCancelled: '/icons/ticket-cancelled.svg',
}

function setImgIcon(img, src, alt) {
  if (!img) return
  img.src = src
  img.alt = alt
  img.classList.add('account-icon')
}

/** Sidebar tài khoản — Thông tin / Vé đã đặt / Lịch sử / Đăng xuất */
export function applyAccountSidebarIcons(page) {
  if (!page) return

  const userImg =
    page.querySelector('[class*="frame392-elm1"] img') ||
    page.querySelector('[class*="frame392-elm"] img')
  setImgIcon(userImg, ACCOUNT_ICONS.user, 'Thông tin tài khoản')

  const ticketImg =
    page.querySelector('[class*="frame394-elm"] img') ||
    page.querySelector('[class*="ticket2-elm"] img')
  setImgIcon(ticketImg, ACCOUNT_ICONS.ticket, 'Vé đã đặt')

  const historyImg = page.querySelector('[class*="frame393-elm"] img')
  setImgIcon(historyImg, ACCOUNT_ICONS.history, 'Lịch sử chuyến đi')

  const logoutImg = page.querySelector('[class*="frame395-elm"] img')
  setImgIcon(logoutImg, ACCOUNT_ICONS.logout, 'Đăng xuất')
}

export function statusIconForBooking(booking) {
  if (booking?.status === 'completed') return ACCOUNT_ICONS.completed
  if (booking?.status === 'cancelled' || booking?.status === 'refunded') {
    return ACCOUNT_ICONS.cancelled
  }
  return ACCOUNT_ICONS.completed
}

function ensureDateIcon(dateBlock) {
  if (!dateBlock || dateBlock.querySelector('.history-card__date-icon')) return

  const img = document.createElement('img')
  img.src = ACCOUNT_ICONS.calendar
  img.alt = 'Ngày khởi hành'
  img.className = 'history-card__date-icon account-icon'
  img.width = 20
  img.height = 20
  dateBlock.classList.add('history-card__date-row')
  dateBlock.insertBefore(img, dateBlock.firstChild)
}

function ensureStatusIcon(statusFrame, booking) {
  if (!statusFrame) return

  let img =
    statusFrame.querySelector('img[class*="vector-elm"]') ||
    statusFrame.querySelector('img')
  if (!img) {
    const host =
      statusFrame.querySelector('[class*="award"]') ||
      statusFrame.querySelector('[class*="hicon"]') ||
      statusFrame
    img = document.createElement('img')
    img.className = 'history-card__status-icon account-icon'
    host.prepend(img)
  }

  img.src = statusIconForBooking(booking)
  img.alt = booking?.status_label || 'Trạng thái'
  img.classList.add('history-card__status-icon', 'account-icon')
}

/** Icon ngày + trạng thái trên thẻ lịch sử chuyến đi */
export function applyHistoryCardIcons(card, booking) {
  if (!card || !booking) return

  const content = card.querySelector('[class*="frame400-elm"]')
  if (!content) return

  const blocks = [...content.children]
  ensureDateIcon(blocks[1])
  ensureStatusIcon(content.querySelector('[class*="frame398-elm"]'), booking)
}
