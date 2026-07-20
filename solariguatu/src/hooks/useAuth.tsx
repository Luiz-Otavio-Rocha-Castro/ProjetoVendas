import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { api } from '../services/api'

interface AuthState {
  isAuthenticated: boolean
  user: { id: number; name: string; email: string; role: string; avatar: string } | null
}

interface AuthContextData extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const SESSION_KEY = 'solariguatu_auth'

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      const token = localStorage.getItem('token')
      // Previne falha fantasma: Só mantemos autênticado se o token e os dados existirem.
      if (stored && token) return JSON.parse(stored) as AuthState
    } catch { /* noop */ }
    return { isAuthenticated: false, user: null }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (isLoading) return false;
      
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.post('/auth/login', { email, password })
        
        const token = response.data.token
        const vendedor = response.data.vendedor
        if (token && vendedor) {
          localStorage.setItem('token', token)
          
          const nomeVendedor = vendedor.nome || 'Vendedor'
          const partesNome = nomeVendedor.trim().split(' ')
          const avatar = partesNome.length > 1 
            ? (partesNome[0][0] + partesNome[1][0]).toUpperCase()
            : nomeVendedor.substring(0, 2).toUpperCase()

          const next: AuthState = {
            isAuthenticated: true,
            user: { 
              id: vendedor.id,
              name: nomeVendedor, 
              email: vendedor.email || email,
              role: 'Vendedor',
              avatar: avatar
            }, 
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
          setState(next)
          return true
        }
        return false
      } catch (err: any) {
        console.error("Erro no login:", err)
        setError(err.response?.data?.message || "Credenciais inválidas ou erro no servidor.")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    sessionStorage.removeItem(SESSION_KEY)
    setState({ isAuthenticated: false, user: null })
  }, [])

  // Proteção: Limpa o state caso o Axios intercepte e apague o token (Token Expirado)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem('token')) {
        logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

