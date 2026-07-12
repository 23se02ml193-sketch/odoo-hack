import { createContext, useContext, useState, useCallback } from 'react'
import { SEED_USERS, ROLE_PERMISSIONS } from '../data/seed'

const AuthContext = createContext(null)
const KEY = 'transitops.session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback((email, password) => {
    const found = SEED_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!found) return { ok: false, error: 'Invalid email or password.' }
    const session = { id: found.id, name: found.name, email: found.email, role: found.role }
    localStorage.setItem(KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  const can = useCallback((routeKey) => {
    if (!user) return false
    return (ROLE_PERMISSIONS[user.role] || []).includes(routeKey)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
