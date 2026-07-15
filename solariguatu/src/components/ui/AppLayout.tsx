import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, LogOut,
  Zap, Bell, AlertCircle, FolderOpen, UserCircle, ChevronRight, MapPin,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import ToastContainer from './Toast'
import { notificacoesService, NotificacaoResponse } from '../../services/notificacoes/notificacoesService'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vendas', icon: FileText, label: 'Contratos' },
  { to: '/pagamentos', icon: AlertCircle, label: 'Pagamentos' },
  { to: '/documentos', icon: FolderOpen, label: 'Documentos' },
  { to: '/visitas', icon: MapPin, label: 'Visitas' },
  { to: '/perfil', icon: UserCircle, label: 'Perfil' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vendas': 'Contratos',
  '/pagamentos': 'Pagamentos Pendentes',
  '/documentos': 'Documentos',
  '/visitas': 'Visitas & Prospectos',
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

  // Construct absolute URL for the photo to bypass React Router issues
  const fotoUrl = user?.id ? `${api.defaults.baseURL || 'http://localhost:8080'}/api/vendas-vendedor/${user.id}/foto` : ''
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [fotoUrl])

  // Notificações
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponse[]>([])
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const carregarNotificacoes = async () => {
    try {
      const dados = await notificacoesService.listarTodas()
      setNotificacoes(dados)
    } catch (error) {
      console.error('Erro ao carregar notificações', error)
    }
  }

  useEffect(() => {
    carregarNotificacoes()
    const interval = setInterval(carregarNotificacoes, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotificacoesAbertas(false)
      }
    }
    if (notificacoesAbertas) {
      document.addEventListener('mousedown', handleClickFora)
    }
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [notificacoesAbertas])

  const naoLidas = notificacoes.filter(n => !n.lida).length

  const handleLerNotificacao = async (id: number) => {
    try {
      await notificacoesService.marcarComoLida(id)
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
    } catch (error) {
      console.error('Erro ao marcar como lida', error)
    }
  }

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
            overflow: 'hidden'
          }}>
            {fotoUrl && !imgError ? (
              <img src={fotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
            ) : (
              user?.avatar
            )}
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
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                className="touch-target"
                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
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
                {naoLidas > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px',
                    background: '#E8901A', color: '#fff', fontSize: '0.65rem',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--color-surface)',
                  }}>
                    {naoLidas}
                  </span>
                )}
              </button>

              {/* Popover de Notificações */}
              {notificacoesAbertas && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: '320px', maxHeight: '400px', overflowY: 'auto',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 100, display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-foreground)' }}>Notificações</h3>
                    {naoLidas > 0 && <span style={{ fontSize: '0.75rem', color: '#E8901A', fontWeight: 600 }}>{naoLidas} não lidas</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notificacoes.length === 0 ? (
                      <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notificacoes.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.lida) handleLerNotificacao(n.id)
                          }}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
                            background: n.lida ? 'transparent' : 'rgba(232,144,26,0.05)',
                            cursor: n.lida ? 'default' : 'pointer', transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--color-foreground)', fontWeight: n.lida ? 500 : 700 }}>{n.titulo}</strong>
                            {!n.lida && <span style={{ width: '8px', height: '8px', background: '#E8901A', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }} />}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                            {n.mensagem}
                          </p>
                          <small style={{ display: 'block', marginTop: '6px', fontSize: '0.7rem', color: 'var(--color-muted)', opacity: 0.7 }}>
                            {new Date(n.dataCriacao).toLocaleString('pt-BR')}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
                overflow: 'hidden'
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
              {fotoUrl && !imgError ? (
                <img src={fotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
              ) : (
                user?.avatar
              )}
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
