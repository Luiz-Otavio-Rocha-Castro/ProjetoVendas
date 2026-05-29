import { useState, useEffect, type FormEvent } from 'react'
import {
  User, Mail, MapPin, Target, Zap,
  Save, Lock, Eye, EyeOff, TrendingUp,
  CheckCircle2, Edit3,
} from 'lucide-react'
import { usePerfil } from '../../hooks/usePerfil'
import { useToast } from '../../contexts/ToastContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--color-muted)' }}>Progresso</span>
        <span style={{ color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export default function PerfilPage() {
  const { perfil, saving, updatePerfil } = usePerfil()
  const { toast } = useToast()

  // Form state
  const [nome, setNome] = useState(perfil.nome)
  const [regiao, setRegiao] = useState(perfil.regiao)
  const [metaReais, setMetaReais] = useState(String(perfil.metaReais))
  const [metaKwp, setMetaKwp] = useState(String(perfil.metaKwp))

  // Password state
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  // Sync form when perfil loads
  useEffect(() => {
    setNome(perfil.nome)
    setRegiao(perfil.regiao)
    setMetaReais(String(perfil.metaReais))
    setMetaKwp(String(perfil.metaKwp))
  }, [perfil.nome, perfil.regiao, perfil.metaReais, perfil.metaKwp])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const metaR = Number(metaReais)
    const metaK = Number(metaKwp)
    if (!nome.trim()) { toast('error', 'Campo obrigatório', 'O nome não pode estar vazio.'); return }
    if (isNaN(metaR) || metaR <= 0) { toast('error', 'Meta inválida', 'Informe um valor de meta em R$ válido.'); return }
    if (isNaN(metaK) || metaK <= 0) { toast('error', 'Meta inválida', 'Informe uma meta de kWp válida.'); return }

    await updatePerfil({ nome: nome.trim(), regiao: regiao.trim(), metaReais: metaR, metaKwp: metaK })
    toast('success', 'Perfil atualizado!', 'Suas informações foram salvas com sucesso.')
  }

  const handleSaveSenha = async (e: FormEvent) => {
    e.preventDefault()
    if (!senhaAtual || !novaSenha) { toast('error', 'Campos obrigatórios', 'Preencha a senha atual e a nova senha.'); return }
    if (novaSenha.length < 6) { toast('error', 'Senha fraca', 'A nova senha deve ter pelo menos 6 caracteres.'); return }
    // Simulate password update
    await new Promise((r) => setTimeout(r, 700))
    setSenhaAtual('')
    setNovaSenha('')
    toast('success', 'Senha alterada!', 'Sua senha foi atualizada com sucesso.')
  }

  const pctReais = Math.min(100, Math.round((perfil.faturamentoAtual / perfil.metaReais) * 100))
  const pctKwp   = Math.min(100, Math.round((perfil.kwpAtual / perfil.metaKwp) * 100))

  const initials = perfil.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Meu Perfil
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Gerencie seus dados e metas do mês
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: Avatar + metas resumo ── */}
        <div className="flex flex-col gap-4">
          {/* Avatar card */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-extrabold glow-amber animate-pulse-glow"
                style={{ background: 'var(--color-primary)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
              >
                {initials}
              </div>
              <button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
                style={{ background: 'var(--color-surface-2)', border: '2px solid var(--color-background)', color: 'var(--color-muted)' }}
                title="Editar avatar (simulado)"
              >
                <Edit3 size={12} />
              </button>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
                {perfil.nome}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{perfil.email}</p>
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)' }}
              >
                <MapPin size={10} />
                {perfil.regiao}
              </div>
            </div>
          </div>

          {/* Meta card */}
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
              Metas — Dezembro 2025
            </p>
            {/* Faturamento */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target size={13} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Faturamento</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>
                    R$ {perfil.faturamentoAtual.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    / R$ {perfil.metaReais.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <ProgressBar value={perfil.faturamentoAtual} max={perfil.metaReais} color="var(--color-primary)" />
            </div>
            {/* kWp */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} style={{ color: 'var(--color-success)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>kWp Vendido</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>
                    {perfil.kwpAtual} kWp
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>/ {perfil.metaKwp} kWp</p>
                </div>
              </div>
              <ProgressBar value={perfil.kwpAtual} max={perfil.metaKwp} color="var(--color-success)" />
            </div>

            {/* Faltam */}
            <div
              className="rounded-xl px-3 py-2.5 text-xs"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex justify-between mb-1">
                <span style={{ color: 'var(--color-muted)' }}>Faltam para a meta</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>
                  {pctReais >= 100 ? '🎉 Meta batida!' : `R$ ${(perfil.metaReais - perfil.faturamentoAtual).toLocaleString('pt-BR')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-muted)' }}>kWp restantes</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  {pctKwp >= 100 ? '🎉 Meta batida!' : `${(perfil.metaKwp - perfil.kwpAtual).toFixed(1)} kWp`}
                </span>
              </div>
            </div>

            {/* Contratos do mês */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} style={{ color: 'var(--color-info)' }} />
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Contratos no mês</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
                {perfil.contratosAtual}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Formulário ── */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Dados pessoais */}
          <Section title="Dados Pessoais" icon={<User size={16} />}>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  leftIcon={<User size={14} />}
                  placeholder="Seu nome"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>E-mail</label>
                  <div
                    className="input-base flex items-center gap-2 cursor-not-allowed"
                    style={{ opacity: 0.6 }}
                  >
                    <Mail size={14} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{perfil.email}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>E-mail não pode ser alterado</p>
                </div>
              </div>
              <Input
                label="Região de Atuação"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                leftIcon={<MapPin size={14} />}
                placeholder="Ex: Vale do Jaguaribe – CE"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Meta Mensal (R$)"
                  type="number"
                  value={metaReais}
                  onChange={(e) => setMetaReais(e.target.value)}
                  leftIcon={<Target size={14} />}
                  placeholder="280000"
                />
                <Input
                  label="Meta Mensal (kWp)"
                  type="number"
                  value={metaKwp}
                  onChange={(e) => setMetaKwp(e.target.value)}
                  leftIcon={<Zap size={14} />}
                  placeholder="120"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={saving}
                  leftIcon={saving ? undefined : <Save size={15} />}
                  style={{ boxShadow: '0 4px 20px var(--color-primary-glow)' }}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Section>

          {/* Segurança */}
          <Section title="Segurança" icon={<Lock size={16} />}>
            <form onSubmit={handleSaveSenha} className="flex flex-col gap-4">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)' }}
              >
                <CheckCircle2 size={13} />
                Sua senha é armazenada de forma segura e criptografada. (Demo – nenhuma senha real é salva)
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Senha atual"
                  type={showSenha ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  leftIcon={<Lock size={14} />}
                  placeholder="••••••••"
                />
                <div className="flex flex-col gap-1.5 relative">
                  <Input
                    label="Nova senha"
                    type={showSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    leftIcon={<Lock size={14} />}
                    placeholder="mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-8 p-1"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="ghost"
                  size="md"
                  leftIcon={<Lock size={15} />}
                >
                  Alterar Senha
                </Button>
              </div>
            </form>
          </Section>
        </div>
      </div>
    </div>
  )
}
