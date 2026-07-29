import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Zap, Sun, Building } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { login, error: authError } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sincroniza o erro vindo do contexto de autenticação
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      // Se não deu OK e o useAuth não jogou um authError específico, a gente põe um genérico.
      // O useEffect acima vai sobrescrever se o authError chegar.
      if (!authError) {
        setError('E-mail ou senha incorretos.')
      }
    }
  }

  return (
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FA' }}>

      {/* ── Lado Esquerdo: Brand Panel ── */}
      <div
        style={{
          flex: '0 0 48%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #1E2D4E 0%, #253760 50%, #1a2844 100%)',
        }}
        className="login-panel-left"
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid rgba(232,144,26,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(232,144,26,0.18)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,144,26,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }} className="animate-sunRise">
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(232,144,26,0.35)', color: '#FFF'
          }}>
            <Sun size={40} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, color: '#FFFFFF', margin: '0 0 8px', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Solvy
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 48px', lineHeight: 1.6 }}>
            Eficiência e Sustentabilidade
          </p>

          <div className="login-features" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: <Zap size={14} />, text: 'Gerencie contratos em tempo real' },
              { icon: <Sun size={14} />, text: 'Acompanhe metas de kWp e faturamento' },
              { icon: <ArrowRight size={14} />, text: 'Pipeline de vendas visual e intuitivo' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${(i + 1) * 100}ms`, color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', textAlign: 'left' }} className="animate-slideUp">
                <span style={{ color: '#E8901A', flexShrink: 0 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <p className="login-copyright" style={{ position: 'absolute', bottom: '24px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}>
          © 2026 Solvy · Todos os direitos reservados
        </p>
      </div>

      {/* ── Lado Direito: Formulário ── */}
      <div className="login-panel-right" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: '#FFFFFF',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }} className="animate-scaleIn">

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-foreground)', margin: '0 0 6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)', fontFamily: 'var(--font-body)' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                  <Mail size={15} />
                </span>
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)', fontFamily: 'var(--font-body)' }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} />
                </span>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            {error && (
              <div className="animate-slideDown" style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', width: '100%', padding: '13px 24px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                background: loading ? 'var(--color-primary-dim)' : 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,144,26,0.35)', letterSpacing: '0.01em',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                  Autenticando...
                </>
              ) : (
                <>Entrar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-light)', margin: 0 }}>
              Ainda não tem conta?
              <span
                onClick={() => navigate('/cadastro')}
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 700, marginLeft: '6px', textDecoration: 'underline' }}
              >
                Cadastre sua Empresa
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-container { flex-direction: column !important; }
          .login-panel-left { flex: none !important; padding: 30px 20px 24px !important; min-height: auto !important; }
          .login-panel-left img { height: 60px !important; margin-bottom: 12px !important; }
          .login-panel-left h1 { font-size: 1.6rem !important; margin-bottom: 4px !important; }
          .login-panel-left > div > p { margin-bottom: 0 !important; font-size: 0.85rem !important; }
          .login-features { display: none !important; }
          .login-copyright { display: none !important; }
          .login-panel-right { padding: 50px 24px 30px !important; flex: 1 !important; justify-content: flex-start !important; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
