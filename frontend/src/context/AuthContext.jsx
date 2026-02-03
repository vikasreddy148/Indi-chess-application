import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

const STORAGE_TOKEN = 'indichess_token'
const STORAGE_USER = 'indichess_user'
const STORAGE_USER_ID = 'indichess_user_id'

function loadStoredUser() {
  const stored = localStorage.getItem(STORAGE_USER)
  const userId = localStorage.getItem(STORAGE_USER_ID)
  const token = localStorage.getItem(STORAGE_TOKEN)
  if (!token || !stored) return null
  try {
    const user = JSON.parse(stored)
    return { ...user, userId: userId ? Number(userId) : user.userId }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  const login = useCallback(async (usernameOrEmail, password) => {
    const data = await authApi.login(usernameOrEmail, password)
    const u = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      rating: 1200,
      country: 'USA',
    }
    localStorage.setItem(STORAGE_TOKEN, data.token)
    localStorage.setItem(STORAGE_USER_ID, String(data.userId))
    localStorage.setItem(STORAGE_USER, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_TOKEN)
      localStorage.removeItem(STORAGE_USER)
      localStorage.removeItem(STORAGE_USER_ID)
    }
  }, [])

  const register = useCallback(async (username, email, password, country = 'USA') => {
    const data = await authApi.register(username, email, password, country)
    const u = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      rating: 1200,
      country: country || 'USA',
    }
    localStorage.setItem(STORAGE_TOKEN, data.token)
    localStorage.setItem(STORAGE_USER_ID, String(data.userId))
    localStorage.setItem(STORAGE_USER, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const getToken = useCallback(() => localStorage.getItem(STORAGE_TOKEN), [])

  const getUserId = useCallback(() => {
    const id = localStorage.getItem(STORAGE_USER_ID)
    return id ? Number(id) : user?.userId
  }, [user])

  const setUserFromProfile = useCallback((profile) => {
    if (!profile) return
    setUser(prevUser => {
        const u = {
          userId: profile.userId ?? prevUser?.userId,
          username: profile.username ?? prevUser?.username,
          email: profile.email ?? prevUser?.email,
          rating: profile.rating ?? prevUser?.rating ?? 1200,
          country: profile.country ?? prevUser?.country ?? 'USA',
          pfpUrl: profile.pfpUrl ?? prevUser?.pfpUrl,
        }
        localStorage.setItem(STORAGE_USER, JSON.stringify(u))
        return u
    })
  }, [])

  const setUserFromOAuth = useCallback((token, userId, username, email) => {
    const u = {
      userId: Number(userId),
      username: username ?? 'Player',
      email: email ?? '',
      rating: 1200,
      country: 'USA',
    }
    localStorage.setItem(STORAGE_TOKEN, token)
    localStorage.setItem(STORAGE_USER_ID, String(userId))
    localStorage.setItem(STORAGE_USER, JSON.stringify(u))
    setUser(u)
  }, [])

  const value = useMemo(() => ({
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    getToken,
    getUserId,
    setUserFromProfile,
    setUserFromOAuth,
  }), [user, login, logout, register, getToken, getUserId, setUserFromProfile, setUserFromOAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
