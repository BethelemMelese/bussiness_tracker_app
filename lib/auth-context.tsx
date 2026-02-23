'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type User = { id: string; email: string; name: string } | null

type AuthContextType = {
  user: User
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setIsLoading(false)
      return
    }
    import('@/lib/api').then(({ api }) =>
      api.auth.me().then(({ user: u }) => setUser(u)).catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      }).finally(() => setIsLoading(false))
    )
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { api } = await import('@/lib/api')
    const { token, user: u } = await api.auth.login(email, password)
    localStorage.setItem('token', token)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { api } = await import('@/lib/api')
    const { token, user: u } = await api.auth.register(email, password, name)
    localStorage.setItem('token', token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
