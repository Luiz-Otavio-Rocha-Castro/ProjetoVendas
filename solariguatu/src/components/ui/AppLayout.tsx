import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Sun, LogOut,
  Zap, Bell, AlertCircle, FolderOpen, UserCircle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ToastContainer from './Toast'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/vendas',      icon: FileText,         label: 'Contratos'       },
  { to: '/pagamentos',  icon: AlertCircle,      label: 'Pag. Pendentes'  },
  { to: '/documentos',  icon: FolderOpen,       label: 'Documentos'      },
  { to: '/perfil',      icon: UserCircle,       label: 'Meu Perfil'      },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/vendas':     'Contratos',
  '/pagamentos': 'Pagamentos Pendentes',
  '/documentos': 'Documentos',
  '/perfil':     'Meu Perfil',
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const pageTitle = PAGE_TITLES[pathname] ?? 'SolarIguatu'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Vendedor'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col w-60 shrink-0 h-full glass-strong relative z-10"
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl glow-amber animate-pulse-glow shrink-0"
            style={{ background: 'var(--color-primary)', color: '#0a0a0a' }}
          >
            <Sun size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              SolarIguatu
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
            >
              Gestão de Vendas
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive ? 'glow-amber' : 'hover:bg-white/5',
                ].join(' ')
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-primary-subtle)' : undefined,
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                fontFamily: 'var(--font-body)',
                marginBottom: '2px',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: 'var(--color-primary)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status indicator */}
        <div
          className="mx-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-glow)',
          }}
        >
          <Zap size={13} style={{ color: 'var(--color-primary)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-primary)' }}>
              Sistema Online
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Dados em tempo real</p>
          </div>
          <span
            className="w-2 h-2 rounded-full shrink-0 animate-pulse"
            style={{ background: 'var(--color-success)' }}
          />
        </div>

        {/* User */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--color-primary)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
          >
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: 'var(--color-foreground)' }}
            >
              {user?.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>Vendedor</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-muted)' }}
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-8 py-4 glass-strong shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {/* Title + greeting */}
          <div>
            <h2
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              {pageTitle}
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {getGreeting()}, {firstName}! 👋
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button
              className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: 'var(--color-muted)' }}
              title="Notificações"
            >
              <Bell size={16} />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-primary)' }}
              />
            </button>

            {/* Avatar mini */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--color-primary)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
              onClick={() => navigate('/perfil')}
              title="Meu Perfil"
            >
              {user?.avatar}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 mesh-bg">
          <Outlet />
        </main>
      </div>

      {/* ── Global Toast ── */}
      <ToastContainer />
    </div>
  )
}
