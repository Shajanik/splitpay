import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as loginRequest, signup as signupRequest, fetchMe, logoutRequest } from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'splitpay.token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null) // { username, display_name }
  const [loading, setLoading] = useState(true)

  // On first load, if we have a stored token, validate it against /api/auth/me.
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await loginRequest(username, password)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setUser({ username: res.username, display_name: res.display_name })
    return res
  }, [])

  const signup = useCallback(async (username, password, displayName) => {
    const res = await signupRequest(username, password, displayName)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setUser({ username: res.username, display_name: res.display_name })
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // token may already be invalid/expired — that's fine, we're logging out anyway
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
