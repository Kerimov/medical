'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  token?: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Проверка токена при загрузке
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Пытаемся восстановить токен из cookie, если нет — из localStorage
      let token = Cookies.get('token') || null
      const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token && lsToken) {
        token = lsToken
        // ре-гидрируем cookie, чтобы API без заголовков тоже работал
        Cookies.set('token', lsToken, { sameSite: 'lax' })
      }
      console.log('Checking auth, token from cookies/localStorage:', token ? 'present' : 'missing')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(token)
        // дублируем в localStorage для устойчивости после перезагрузки
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
        console.log('Auth successful, token set:', token ? 'present' : 'missing')
      } else {
        console.log('Auth failed, removing token')
        Cookies.remove('token')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        setToken(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа')
    }

    setUser(data.user)
    setToken(data.token)
    // сохраняем токен в cookie и localStorage для восстановления после обновления
    Cookies.set('token', data.token, { sameSite: 'lax' })
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации')
    }

    setUser(data.user)
    setToken(data.token)
  }

  const logout = () => {
    Cookies.remove('token')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

