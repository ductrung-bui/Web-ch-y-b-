import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function RedirectRoot() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return <Navigate to={isAuthenticated ? '/trang-chu' : '/dang-nhap'} replace />
}

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/dang-nhap"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }
  return children
}

