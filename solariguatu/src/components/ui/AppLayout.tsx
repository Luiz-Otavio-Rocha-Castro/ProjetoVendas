import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, LogOut,
  Zap, Bell, AlertCircle, FolderOpen, UserCircle, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ToastContainer from './Toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vendas', icon: FileText, label: 'Contratos' },
  { to: '/pagamentos', icon: AlertCircle, label: 'Pagamentos' },
  { to: '/documentos', icon: FolderOpen, label: 'Documentos' },
  { to: '/perfil', icon: UserCircle, label: 'Perfil' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vendas': 'Contratos',
  '/pagamentos': 'Pagamentos Pendentes',
  '/documentos': 'Documentos',
  '/perfil': 'Meu Perfil',
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
    <div className="app-shell">

      {/* ════════════════════════════════
          SIDEBAR — desktop only
      ════════════════════════════════ */}
      <aside className="app-sidebar">

        {/* ── Logo ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-navy-border)',
        }}>
          <img
            src="/logo.jpg"
            alt="SolarIguatu"
            style={{
              height: '42px',
              objectFit: 'contain',
              filter: 'brightness(1.05)',
            }}
          />
        </div>

        {/* ── Nav label ── */}
        <div style={{ padding: '20px 16px 8px' }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)',
            margin: 0,
          }}>
            Menu Principal
          </p>
        </div>

        {/* ── Nav items ── */}
        <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                minHeight: '44px',
                borderRadius: '9px',
                marginBottom: '2px',
                fontSize: '0.845rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s ease',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                background: isActive
                  ? 'rgba(232,144,26,0.18)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #E8901A'
                  : '3px solid transparent',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                const isActive = el.getAttribute('aria-current') === 'page'
                if (!isActive) {
                  el.style.background = 'var(--color-navy-hover)'
                  el.style.color = 'rgba(255,255,255,0.80)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                const isActive = el.getAttribute('aria-current') === 'page'
                if (!isActive) {
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(255,255,255,0.55)'
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    color={isActive ? '#E8901A' : undefined}
                  />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && (
                    <ChevronRight size={13} style={{ color: 'rgba(232,144,26,0.6)', flexShrink: 0 }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Status pill ── */}
        <div style={{ padding: '12px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '9px',
            background: 'rgba(22,163,74,0.12)',
            border: '1px solid rgba(22,163,74,0.20)',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#4ADE80', flexShrink: 0,
              boxShadow: '0 0 0 3px rgba(74,222,128,0.20)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ADE80', margin: 0 }}>
                Sistema Online
              </p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.40)', margin: 0 }}>
                Dados em tempo real
              </p>
            </div>
            <Zap size={12} color="rgba(74,222,128,0.70)" />
          </div>
        </div>

        {/* ── User block ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 14px',
          borderTop: '1px solid var(--color-navy-border)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #E8901A, #D07D10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>
            {user?.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-navy-muted)', margin: 0 }}>Vendedor</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="touch-target"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '7px',
              color: 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff'
                ; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'
                ; (e.currentTarget as HTMLButtonElement).style.background = 'none'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════ */}
      <div className="app-content">

        {/* ── Topbar ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          height: '60px', flexShrink: 0,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 3px rgba(15,25,41,0.05)',
        }}>
          {/* Logo (mobile only) + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logo só aparece no mobile (quando sidebar está oculta) */}
            <img
              src="/logo.jpg"
              alt="SolarIguatu"
              style={{
                height: '32px',
                objectFit: 'contain',
              }}
              className="mobile-logo"
            />
            {/* Título com barra — oculto no mobile pela classe topbar-title */}
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '4px', height: '18px', borderRadius: '2px',
                background: 'linear-gradient(180deg, #E8901A, #D07D10)',
              }} />
              <div>
                <h2 style={{
                  fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-foreground)',
                  margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
                }}>
                  {pageTitle}
                </h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0 }}>
                  {getGreeting()}, {firstName}! 👋
                </p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notification bell */}
            <button
              className="touch-target"
              style={{
                position: 'relative', padding: '8px', borderRadius: '9px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer', color: 'var(--color-muted)',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Notificações"
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary-border)'
                  ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
                  ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: '7px', right: '7px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#E8901A',
                border: '1.5px solid var(--color-surface)',
              }} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/perfil')}
              title="Meu Perfil"
              className="touch-target"
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8901A, #D07D10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                fontFamily: 'var(--font-display)',
                border: 'none', cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 2px 8px rgba(232,144,26,0.30)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'
                  ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(232,144,26,0.45)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(232,144,26,0.30)'
              }}
            >
              {user?.avatar}
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="app-main mesh-bg">
          <Outlet />
        </main>
      </div>

      {/* ════════════════════════════════
          BOTTOM NAV — mobile only
      ════════════════════════════════ */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? ' active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Global Toast ── */}
      <ToastContainer />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,222,128,0.20); }
          50%       { box-shadow: 0 0 0 5px rgba(74,222,128,0.30); }
        }
        /* Logo mobile: oculta no desktop (sidebar mostra o logo lá) */
        .mobile-logo {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-logo {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}
