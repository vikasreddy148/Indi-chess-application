import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('indichess_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (username, _password) => {
    const u = { username, rating: 1200, email: `${username}@example.com`, country: 'USA' }
    setUser(u)
    localStorage.setItem('indichess_user', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('indichess_user')
  }

  const register = (username, email, _password, country = 'USA') => {
    const u = { username, email, rating: 1200, country }
    setUser(u)
    localStorage.setItem('indichess_user', JSON.stringify(u))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
