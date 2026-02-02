import { createContext, useContext, useState } from 'react'
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

  const login = async (usernameOrEmail, password) => {
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
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_TOKEN)
      localStorage.removeItem(STORAGE_USER)
      localStorage.removeItem(STORAGE_USER_ID)
    }
  }

  const register = async (username, email, password, country = 'USA') => {
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
  }

  const getToken = () => localStorage.getItem(STORAGE_TOKEN)
  const getUserId = () => {
    const id = localStorage.getItem(STORAGE_USER_ID)
    return id ? Number(id) : user?.userId
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        getToken,
        getUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
