import { useState, useCallback, useEffect } from 'react'

interface AuthState {
  isAuthenticated: boolean
  user: { name: string; email: string; role: string; avatar: string } | null
}

const SESSION_KEY = 'solariguatu_auth'

const MOCK_USER = {
  name: 'Lucas Araújo',
  email: 'lucas@solariguatu.com.br',
  role: 'Gerente Comercial',
  avatar: 'LA',
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) return JSON.parse(stored) as AuthState
    } catch { /* noop */ }
    return { isAuthenticated: false, user: null }
  })

  const login = useCallback(
    (email: string, _password: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Aceita qualquer e-mail válido com qualquer senha
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(email)) {
            const next: AuthState = {
              isAuthenticated: true,
              user: { ...MOCK_USER, email },
            }
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
            setState(next)
            resolve(true)
          } else {
            resolve(false)
          }
        }, 900)
      })
    },
    []
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setState({ isAuthenticated: false, user: null })
  }, [])

  return { ...state, login, logout }
}
