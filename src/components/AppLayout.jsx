import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { DbStatusBadge } from './DbStatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { SITE_LOGO_ALT, SITE_LOGO_URL } from '../constants/siteAssets.js'
import { HeaderUserAvatar } from './HeaderUserAvatar.jsx'
import { TeleportFooterBinder } from './TeleportFooterBinder.jsx'

const TELEPORT_SHELL_ROUTES = new Set([
  '/dang-nhap',
  '/dang-ky',
  '/nhap-email-khoi-phuc',
  '/khoi-phuc-mat-khau',
  '/thay-doi-mat-khau',
  '/trang-chu',
  '/gioi-thieu',
  '/kinh-nghiem',
  '/lich-trong-thang',
  '/lich-su-chuyen-di',
  '/ve-cua-toi',
  '/ve-da-huy',
  '/chon-thoi-gian-chuyen-di',
  '/chon-vi-tri-ghe',
  '/dich-vu-bo-sung',
  '/dien-thong-tin',
  '/thanh-toan',
])

function isTeleportRoute(pathname) {
  if (TELEPORT_SHELL_ROUTES.has(pathname)) return true
  return /^\/chuyen-di\/[^/]+$/.test(pathname)
}

export function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const useTeleportShell = isTeleportRoute(location.pathname)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/dang-nhap', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={'app-shell' + (useTeleportShell ? ' app-shell--teleport' : '')}>
      {!useTeleportShell && (
      <header className="app-shell__bar">
        <NavLink to={isAuthenticated ? '/trang-chu' : '/dang-nhap'} className="app-shell__brand">
          <img className="app-shell__logo" src={SITE_LOGO_URL} alt={SITE_LOGO_ALT} />
        </NavLink>
        <DbStatusBadge />
        {isAuthenticated && (
          <span className="app-shell__user">{user.fullName}</span>
        )}
        <nav className="app-shell__nav" aria-label="Chuyển trang">
          <NavItem to="/trang-chu" label="Trang chủ" />
          <NavItem to="/gioi-thieu" label="Giới thiệu" />
          <NavItem to="/kinh-nghiem" label="Kinh nghiệm" />
          <NavItem to="/lich-trong-thang" label="Lịch trong tháng" />
          <NavItem to="/lich-su-chuyen-di" label="Lịch sử" requiresAuth />
          <NavItem to="/ve-cua-toi" label="Vé của tôi" requiresAuth />
          <NavItem to="/thay-doi-mat-khau" label="Đổi mật khẩu" requiresAuth />
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="app-shell__logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
              <NavLink to="/thay-doi-mat-khau" title="Tài khoản">
                <HeaderUserAvatar user={user} />
              </NavLink>
            </>
          ) : (
            <NavLink to="/dang-nhap" className="app-shell__link">
              Đăng nhập
            </NavLink>
          )}
        </nav>
      </header>
      )}
      <main className="app-shell__main">
        <Outlet />
        {useTeleportShell && <TeleportFooterBinder />}
      </main>
    </div>
  )
}

function NavItem({ to, label, requiresAuth = false }) {
  const { isAuthenticated } = useAuth()
  if (requiresAuth && !isAuthenticated) return null
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'app-shell__link' + (isActive ? ' app-shell__link--active' : '')
      }
      end={to === '/trang-chu'}
    >
      {label}
    </NavLink>
  )
}
