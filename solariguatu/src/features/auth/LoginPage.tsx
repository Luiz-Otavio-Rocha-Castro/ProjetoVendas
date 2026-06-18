import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError('E-mail ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* ── Background abstract shapes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Orb grande âmbar */}
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: '600px', height: '600px',
            top: '-200px', left: '-150px',
            background: 'radial-gradient(circle, oklch(0.78 0.18 65), transparent 70%)',
          }}
        />
        {/* Orb azul */}
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: '500px', height: '500px',
            bottom: '-150px', right: '-100px',
            background: 'radial-gradient(circle, oklch(0.55 0.18 220), transparent 70%)',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.78 0.18 65 / 0.5) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.78 0.18 65 / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Floating solar panels */}
        {[
          { top: '15%', left: '8%',  size: 48, delay: '0s',    opacity: 0.07 },
          { top: '70%', left: '5%',  size: 36, delay: '1.2s',  opacity: 0.05 },
          { top: '20%', right: '6%', size: 56, delay: '0.6s',  opacity: 0.07 },
          { top: '75%', right: '8%', size: 40, delay: '1.8s',  opacity: 0.05 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute animate-spin-slow"
            style={{ top: s.top, left: (s as any).left, right: (s as any).right, opacity: s.opacity, animationDuration: `${14 + i * 4}s`, animationDelay: s.delay }}
          >
            <Sun size={s.size} style={{ color: 'var(--color-primary)' }} strokeWidth={0.8} />
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-scaleIn">
        <div className="glass-strong rounded-3xl p-8 glow-amber">
          {/* Top glow line */}
          <div
            className="absolute top-0 inset-x-8 h-px rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
          />

          {/* Brand */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{ background: 'var(--color-primary)', color: '#0a0a0a' }}
            >
              <Sun size={26} strokeWidth={2} />
            </div>
            <div className="text-center">
              <h1
                className="text-xl font-extrabold tracking-tight text-glow-amber"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
              >
                SolarIguatu
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Sistema de Gestão Comercial
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={15} />}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={15} />}
              autoComplete="current-password"
            />

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs animate-slideDown"
                style={{ background: 'oklch(0.65 0.22 25 / 0.12)', color: 'var(--color-danger)', border: '1px solid oklch(0.65 0.22 25 / 0.25)' }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              style={{ boxShadow: '0 4px 24px var(--color-primary-glow)', borderRadius: '14px' }}
            >
              {!loading && <ArrowRight size={16} />}
              {loading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
          © 2025 SolarIguatu · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
