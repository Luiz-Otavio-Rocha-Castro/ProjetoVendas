import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthState {
  isAuthenticated: boolean
  user: { name: string; email: string; role: string; avatar: string } | null
}

interface AuthContextData extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const SESSION_KEY = 'solariguatu_auth'

const MOCK_USER = {
  name: 'Lucas Araújo',
  email: 'lucas@solariguatu.com.br',
  role: 'Gerente Comercial',
  avatar: 'LA',
}

import { api } from '../services/api'

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) return JSON.parse(stored) as AuthState
    } catch { /* noop */ }
    return { isAuthenticated: false, user: null }
  })

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await api.post('/auth/login', { email, password })
        
        const token = response.data.token
        if (token) {
          localStorage.setItem('token', token)
          
          const next: AuthState = {
            isAuthenticated: true,
            user: { ...MOCK_USER, email }, 
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
          setState(next)
          return true
        }
        return false
      } catch (error) {
        console.error("Erro no login:", error)
        return false
      }
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    sessionStorage.removeItem(SESSION_KEY)
    setState({ isAuthenticated: false, user: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
