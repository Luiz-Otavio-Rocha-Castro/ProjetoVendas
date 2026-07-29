import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando seu e-mail...')
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Nenhum token de verificação foi fornecido na URL.')
      return
    }

    if (hasVerified.current) return
    hasVerified.current = true

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verificar-email?token=${token}`)
        setStatus('success')
        setMessage(response.data.mensagem || 'Conta ativada com sucesso!')
      } catch (err: any) {
        setStatus('error')
        if (err.response?.data?.message) {
          setMessage(err.response.data.message)
        } else {
          setMessage('Ocorreu um erro ao verificar o token. Ele pode ser inválido ou já ter expirado.')
        }
      }
    }

    verifyToken()
  }, [token])

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F4F6FA',
      alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div className="animate-scaleIn" style={{
        background: '#FFF',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {status === 'loading' && (
          <>
            <div style={{ color: 'var(--color-primary)', marginBottom: '24px', animation: 'spin 2s linear infinite' }}>
              <Loader size={64} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-foreground)' }}>Verificando E-mail</h2>
            <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>Por favor, aguarde enquanto validamos o seu token...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ color: '#16a34a', marginBottom: '24px' }} className="animate-slideDown">
              <CheckCircle size={64} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-foreground)', marginBottom: '12px' }}>
              E-mail Verificado!
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
              }}
            >
              Fazer Login Agora <ArrowRight size={18} />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ color: 'var(--color-danger)', marginBottom: '24px' }} className="animate-slideDown">
              <XCircle size={64} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-foreground)', marginBottom: '12px' }}>
              Falha na Verificação
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--color-foreground)',
              }}
            >
              Voltar para a página inicial
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
