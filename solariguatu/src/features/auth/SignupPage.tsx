import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, MapPin, Mail, Lock, User, ArrowLeft, ArrowRight, Zap, Sun, Target } from 'lucide-react'
import { api } from '../../services/api'

export default function SignupPage() {
  const navigate = useNavigate()

  // Form State
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [nomeVendedor, setNomeVendedor] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [regiaoAtuacao, setRegiaoAtuacao] = useState('')

  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMode, setSuccessMode] = useState(false) // Mostra a mensagem de sucesso e "cheque o email"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!nomeEmpresa || !cnpj || !nomeVendedor || !email || !senha || !confirmSenha || !regiaoAtuacao) {
      setError('Preencha todos os campos.')
      return
    }
    if (senha !== confirmSenha) {
      setError('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/signup', {
        nomeEmpresa,
        cnpj,
        nomeVendedor,
        email,
        senha,
        regiaoAtuacao
      })
      setSuccessMode(true)
    } catch (err: any) {
      console.error(err)
      // Tentar pegar a mensagem do backend
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca ponto entre o segundo e o terceiro dígitos
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca ponto entre o quinto e o sexto dígitos
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca uma barra entre o oitavo e o nono dígitos
      .replace(/(\d{4})(\d)/, '$1-$2') // Coloca um hífen depois do bloco de quatro dígitos
      .substring(0, 18); // Limita o tamanho
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value))
  }

  // --- RENDERING DO SUCESSO ---
  if (successMode) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FA', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="animate-scaleIn" style={{
          background: '#FFF',
          padding: '48px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '36px'
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-foreground)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Quase lá!
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Sua conta da empresa <strong>{nomeEmpresa}</strong> foi criada com sucesso! 
            Enviamos um link de ativação para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada e a pasta de Spam.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 28px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(232,144,26,0.35)',
            }}
          >
            Ir para Login <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FA' }}>
      
      {/* ── Lado Esquerdo: Formulário ── */}
      <div className="login-panel-right" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: '#FFFFFF',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '540px' }} className="animate-scaleIn">
          
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-muted)', 
              display: 'flex', alignItems: 'center', gap: '6px', 
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginBottom: '32px',
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Voltar para login
          </button>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.8rem', fontWeight: 800,
              color: 'var(--color-foreground)',
              margin: '0 0 6px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.025em',
            }}>
              Crie a conta da sua Empresa
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', margin: 0 }}>
              Junte-se à Solvy e impulsione as vendas da sua integradora solar.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* GRID 2 COLUMNS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* EMPRESA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Nome da Empresa</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><Building size={15} /></span>
                  <input type="text" placeholder="Sua Empresa de Energia Solar" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} autoFocus />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>CNPJ</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><Target size={15} /></span>
                  <input type="text" placeholder="00.000.000/0000-00" maxLength={18} value={cnpj} onChange={handleCnpjChange} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Região de Atuação</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><MapPin size={15} /></span>
                  <input type="text" placeholder="Ex: Sul, SP Capital..." value={regiaoAtuacao} onChange={(e) => setRegiaoAtuacao(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              {/* DIVISOR */}
              <div style={{ gridColumn: '1 / -1', height: '1px', background: 'var(--color-border)', margin: '8px 0' }}></div>

              {/* DADOS DO USUARIO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Seu Nome (Administrador)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><User size={15} /></span>
                  <input type="text" placeholder="Seu nome completo" value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Seu E-mail Corporativo</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><Mail size={15} /></span>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><Lock size={15} /></span>
                  <input type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-foreground-2)' }}>Confirmar Senha</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-light)', zIndex: 1, display: 'flex' }}><Lock size={15} /></span>
                  <input type="password" placeholder="••••••••" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} className="input-base" style={{ paddingLeft: '38px' }} />
                </div>
              </div>

            </div>

            {error && (
              <div className="animate-slideDown" style={{ borderRadius: '8px', padding: '12px', fontSize: '0.85rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1,
                background: loading ? 'var(--color-primary-dim)' : 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,144,26,0.35)',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                  Processando...
                </>
              ) : (
                <>Criar minha conta <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Lado Direito: Brand Panel ── */}
      <div
        style={{
          flex: '0 0 45%',
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
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,144,26,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }} className="animate-sunRise">
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(232,144,26,0.35)', color: '#FFF'
          }}>
            <Sun size={40} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>
            Solvy
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', lineHeight: 1.6 }}>
            Um CRM criado especialmente para integradores fotovoltaicos.
          </p>
          <div className="login-features" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: <Zap size={16} />, text: 'Múltiplos usuários por empresa', title: 'Multi-Tenant' },
              { icon: <Sun size={16} />, text: 'Funil e métricas de energia', title: 'Dashboard Solar' },
              { icon: <Building size={16} />, text: 'Ambiente seguro e isolado', title: 'Privacidade Total' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${(i + 1) * 100}ms`, textAlign: 'left' }} className="animate-slideUp">
                <span style={{ color: '#E8901A', flexShrink: 0, padding: '10px', background: 'rgba(232,144,26,0.15)', borderRadius: '8px' }}>{item.icon}</span>
                <div>
                  <h4 style={{ color: '#FFF', margin: '0 0 2px', fontSize: '0.9rem' }}>{item.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.8rem' }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-container { flex-direction: column !important; }
          .login-panel-left { display: none !important; }
          .login-panel-right { padding: 40px 24px !important; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
