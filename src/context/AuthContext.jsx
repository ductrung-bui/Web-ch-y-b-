import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/endpoints.js'
import { getToken, setToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { user: me } = await authApi.me()
      setUser(me)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const data = await authApi.register({
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      phone: payload.phone,
    })
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore */
    }
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh: loadMe,
    }),
    [user, loading, loadMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
