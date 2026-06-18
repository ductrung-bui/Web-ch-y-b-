import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import {
  ACCOUNT_SIDEBAR_ITEMS,
  BOOKING_FLOW,
  MAIN_NAV_ITEMS,
  TICKET_TABS,
} from '../navigationConfig.js'
import { SITE_LOGO_ALT, SITE_LOGO_URL } from '../constants/siteAssets.js'
import { applyAccountSidebarIcons } from '../utils/accountIcons.js'
import { bindPageHeaderAvatars, cleanupAuthBrokenImages } from '../utils/userAvatar.js'
import {
  refreshNavLayout,
  resolveHeaderAuth,
  unifyHeaderLayout,
} from '../utils/teleportHeader.js'

function tripIdFromPath(pathname) {
  const match = pathname.match(/^\/chuyen-di\/([^/]+)$/)
  return match?.[1] || null
}

function withBookingQuery(path, searchParams, booking) {
  const next = new URLSearchParams(searchParams)
  if (booking?.tripId && !next.has('tripId')) next.set('tripId', String(booking.tripId))
  if (booking?.scheduleId && !next.has('scheduleId')) next.set('scheduleId', String(booking.scheduleId))
  const qs = next.toString()
  return qs ? `${path}?${qs}` : path
}

function bindClick(el, handler) {
  if (!el || el.dataset.navBound) return
  el.dataset.navBound = '1'
  el.classList.add('teleport-nav-clickable')
  el.addEventListener('click', handler)
}

function findSpanByText(root, text) {
  return [...root.querySelectorAll('span')].find((s) => s.textContent.trim() === text)
}

function closestClickHost(span) {
  return (
    span?.closest('button') ||
    span?.closest('[class*="frame267-elm"]') ||
    span?.closest('[class*="frame268-elm"]') ||
    span?.closest('[class*="frame269-elm"]') ||
    span?.closest('[class*="frame267"]') ||
    span?.parentElement?.parentElement
  )
}

function injectMainNav(page, { pathname, isAuthenticated, navigate }) {
  const host = page.querySelector('[class*="navigation-pill-list-elm"]')
  if (!host) return
  host.innerHTML = ''

  MAIN_NAV_ITEMS.forEach((item) => {
    if (item.requiresAuth && !isAuthenticated) return

    const link = document.createElement('a')
    link.href = item.path
    link.className =
      'teleport-nav-pill' + (pathname === item.path ? ' teleport-nav-pill--active' : '')
    link.textContent = item.label
    link.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(item.path)
    })
    host.appendChild(link)
  })

  if (!isAuthenticated) {
    const login = document.createElement('a')
    login.href = '/dang-nhap'
    login.className =
      'teleport-nav-pill teleport-nav-pill--auth' +
      (pathname === '/dang-nhap' ? ' teleport-nav-pill--active' : '')
    login.textContent = 'Đăng nhập'
    login.addEventListener('click', (e) => {
      e.preventDefault()
      navigate('/dang-nhap')
    })
    host.appendChild(login)
  }
}

function bindSiteLogos(page, navigate, isAuthenticated) {
  const home = isAuthenticated ? '/trang-chu' : '/gioi-thieu'

  page.querySelectorAll('img[class*="logotchnn1-elm"]').forEach((img) => {
    img.src = SITE_LOGO_URL
    img.alt = SITE_LOGO_ALT
    const clickHost =
      img.closest('[class*="logotchnn1-elm2"]') ||
      img.closest('[class*="header-default-elm"]')?.querySelector('[class*="logotchnn1-elm1"]') ||
      img
    bindClick(clickHost, () => navigate(home))
  })
}

function bindAuthHeader(page, { isAuthenticated, user, navigate, logout }) {
  const authBox = resolveHeaderAuth(page)
  if (!authBox) return

  cleanupAuthBrokenImages(authBox)

  const badge = authBox.querySelector('.teleport-nav-user-badge')

  if (isAuthenticated && user) {
    const label = user.fullName || user.email
    const chevron = authBox.querySelector('img[class*="chevrondown"]')
    if (!badge) {
      const el = document.createElement('span')
      el.className = 'teleport-nav-user-badge'
      el.textContent = label
      if (chevron) authBox.insertBefore(el, chevron)
      else authBox.appendChild(el)
    } else {
      badge.textContent = label
      if (chevron && badge.compareDocumentPosition(chevron) & Node.DOCUMENT_POSITION_PRECEDING) {
        authBox.insertBefore(badge, chevron)
      }
    }
    authBox.title = `${label} — Nhấn: Vé của tôi · Nhấn đúp: Đăng xuất`
  } else {
    badge?.remove()
    authBox.title = 'Đăng nhập'
  }

  bindClick(authBox, async (e) => {
    if (!isAuthenticated) {
      navigate('/dang-nhap')
      return
    }
    if (e.detail >= 2) {
      await logout()
      navigate('/dang-nhap', { replace: true })
      return
    }
    navigate('/ve-cua-toi')
  })
}

function bindAccountSidebar(page, { pathname, navigate, logout, isAuthenticated }) {
  if (!isAuthenticated) return

  const rowByLabel = (label) => {
    const span = findSpanByText(page, label)
    return (
      span?.closest('[class*="frame392-elm"]') ||
      span?.closest('[class*="frame392-elm1"]') ||
      span?.closest('[class*="frame394-elm"]') ||
      span?.closest('[class*="frame393-elm"]') ||
      span?.closest('[class*="frame395-elm"]')
    )
  }

  ACCOUNT_SIDEBAR_ITEMS.forEach((item) => {
    const row = rowByLabel(item.label)
    if (!row) return

    if (item.match.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      row.classList.add('teleport-nav-sidebar--active')
    } else {
      row.classList.remove('teleport-nav-sidebar--active')
    }

    bindClick(row, () => navigate(item.path))
  })

  const logoutRow = rowByLabel('Đăng xuất')
  if (logoutRow) {
    bindClick(logoutRow, async () => {
      await logout()
      navigate('/dang-nhap', { replace: true })
    })
  }
}

function bindTicketTabs(page, { pathname, navigate }) {
  TICKET_TABS.forEach((tab) => {
    const span = findSpanByText(page, tab.label)
    const btn = span?.closest('button')
    if (!btn) return

    if (pathname === tab.path) {
      btn.style.backgroundColor = 'rgba(44, 44, 44, 1)'
      const s = btn.querySelector('span')
      if (s) s.style.color = 'rgba(245, 245, 245, 1)'
    }

    bindClick(btn, () => navigate(tab.path))
  })
}

function bindBookingFlow(page, slug, { navigate, searchParams, booking }) {
  const flow = BOOKING_FLOW[slug]
  if (!flow) return

  const backSpan = findSpanByText(page, 'Quay lại')
  const nextSpan = findSpanByText(page, 'Tiếp theo')
  const backHost = closestClickHost(backSpan)
  const nextHost = closestClickHost(nextSpan)

  if (backHost && flow.back) {
    bindClick(backHost, () => navigate(withBookingQuery(flow.back, searchParams, booking)))
  }

  /* Nút "Tiếp theo" — TeleportBookingBinder (logic tạo booking / lưu bước) */
}

function bindTripBookButton(page, { navigate, searchParams, booking, pathname, setDraft, clearDraft }) {
  const span = findSpanByText(page, 'Đặt vé')
  const btn = span?.closest('button') || closestClickHost(span)
  if (!btn) return

  const tripId =
    searchParams.get('tripId') || tripIdFromPath(pathname) || booking?.tripId
  if (!tripId) return

  bindClick(btn, () => {
    clearDraft()
    setDraft({ tripId: String(tripId) })
    const params = new URLSearchParams()
    params.set('tripId', String(tripId))
    navigate(`/chon-thoi-gian-chuyen-di?${params.toString()}`)
  })
}

function bindPageNavigation(page, slug, ctx) {
  const {
    pathname,
    isAuthenticated,
    navigate,
    logout,
    user,
    searchParams,
    booking,
    setDraft,
    clearDraft,
  } = ctx

  unifyHeaderLayout(page)
  injectMainNav(page, { pathname, isAuthenticated, navigate })
  bindSiteLogos(page, navigate, isAuthenticated)
  bindPageHeaderAvatars(page, { isAuthenticated, user })
  bindAuthHeader(page, { isAuthenticated, user, navigate, logout })

  if (['lichsuchuyendi', 'thongtinvedadat', 'thongtinvedahuy', 'thaydoimatkhau'].includes(slug)) {
    bindAccountSidebar(page, { pathname, navigate, logout, isAuthenticated })
    applyAccountSidebarIcons(page)
  }

  if (slug === 'thongtinvedadat' || slug === 'thongtinvedahuy') {
    bindTicketTabs(page, { pathname, navigate })
  }

  if (BOOKING_FLOW[slug]) {
    bindBookingFlow(page, slug, { navigate, searchParams, booking })
  }

  if (slug === 'mnhnhchititchuyni') {
    bindTripBookButton(page, {
      navigate,
      searchParams,
      booking,
      pathname,
      setDraft,
      clearDraft,
    })
  }

  refreshNavLayout(page)
}

export function TeleportNavBinder({ slug }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, user, logout } = useAuth()
  const { tripId: draftTripId, scheduleId: draftScheduleId, setDraft, clearDraft } = useBooking()
  const booking = { tripId: draftTripId, scheduleId: draftScheduleId }

  useEffect(() => {
    const run = () => {
      const page = document.querySelector(`.teleport-page--${slug}`)
      if (!page) return
      bindPageNavigation(page, slug, {
        pathname,
        isAuthenticated,
        navigate,
        logout,
        user,
        searchParams,
        booking,
        setDraft,
        clearDraft,
      })
    }

    run()
    const t = window.setTimeout(run, 0)
    return () => window.clearTimeout(t)
  }, [
    slug,
    pathname,
    isAuthenticated,
    user?.id,
    user?.avatarUrl,
    searchParams.toString(),
    booking.tripId,
    booking.scheduleId,
  ])

  return null
}
