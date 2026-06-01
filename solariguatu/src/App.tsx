import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './contexts/ToastContext'
import LoginPage from './features/auth/LoginPage'
import AppLayout from './components/ui/AppLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import VendasPage from './features/vendas/VendasPage'
import PagamentosPendentesPage from './features/pagamentos/PagamentosPendentesPage'
import DocumentosPage from './features/documentos/DocumentosPage'
import PerfilPage from './features/perfil/PerfilPage'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="vendas"     element={<VendasPage />} />
          <Route path="pagamentos" element={<PagamentosPendentesPage />} />
          <Route path="documentos" element={<DocumentosPage />} />
          <Route path="perfil"     element={<PerfilPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
