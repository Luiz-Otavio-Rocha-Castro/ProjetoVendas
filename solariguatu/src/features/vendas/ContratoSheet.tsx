import { useEffect, useRef } from 'react'
import {
  X, User, MapPin, Package, CreditCard, Calendar,
  DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle,
  XCircle, Wrench, BadgeCheck,
} from 'lucide-react'
import type { Contrato, ContratoStatus } from './mockVendas'

interface Props {
  contrato: Contrato | null
  onClose: () => void
}

const STATUS_CONFIG: Record<ContratoStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Aprovado:        { label: 'Aprovado',          color: 'oklch(0.72 0.17 145)',  bg: 'oklch(0.72 0.17 145 / 0.12)',  icon: <CheckCircle2 size={14} /> },
  Pendente:        { label: 'Pag. Pendente',      color: 'oklch(0.82 0.15 80)',   bg: 'oklch(0.82 0.15 80 / 0.12)',   icon: <AlertCircle size={14} /> },
  Cancelado:       { label: 'Cancelado',          color: 'oklch(0.65 0.22 25)',   bg: 'oklch(0.65 0.22 25 / 0.12)',   icon: <XCircle size={14} /> },
  'Em Instalação': { label: 'Em Instalação',      color: 'oklch(0.72 0.15 220)',  bg: 'oklch(0.72 0.15 220 / 0.12)', icon: <Wrench size={14} /> },
  Concluído:       { label: 'Concluído',          color: 'oklch(0.55 0.15 180)',  bg: 'oklch(0.55 0.15 180 / 0.12)', icon: <BadgeCheck size={14} /> },
}

// Mock: histórico de eventos por contrato
function getHistorico(status: ContratoStatus, data: string): { label: string; date: string; color: string }[] {
  const base = [{ label: 'Contrato criado', date: data, color: 'var(--color-muted)' }]
  if (status === 'Cancelado') return [...base, { label: 'Contrato cancelado', date: data, color: 'oklch(0.65 0.22 25)' }]
  if (status === 'Pendente')  return [...base, { label: 'Aguardando pagamento restante', date: data, color: 'oklch(0.82 0.15 80)' }]
  if (status === 'Aprovado')  return [...base, { label: 'Contrato aprovado', date: data, color: 'oklch(0.72 0.17 145)' }]
  if (status === 'Em Instalação') return [...base,
    { label: 'Contrato aprovado', date: data, color: 'oklch(0.72 0.17 145)' },
    { label: 'Instalação iniciada', date: data, color: 'oklch(0.72 0.15 220)' },
  ]
  return [...base,
    { label: 'Contrato aprovado', date: data, color: 'oklch(0.72 0.17 145)' },
    { label: 'Instalação iniciada', date: data, color: 'oklch(0.72 0.15 220)' },
    { label: 'Concluído com sucesso', date: data, color: 'oklch(0.55 0.15 180)' },
  ]
}

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

function InfoRow({ icon, label, value, valueColor }: {
  icon: React.ReactNode; label: string; value: string; valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--color-muted)' }}>{icon}</span>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
      </div>
      <span className="text-xs font-semibold" style={{ color: valueColor ?? 'var(--color-foreground)' }}>
        {value}
      </span>
    </div>
  )
}

export default function ContratoSheet({ contrato, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Trava scroll do body quando sheet está aberto
  useEffect(() => {
    if (contrato) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [contrato])

  const isVisible = Boolean(contrato)

  if (!contrato && !isVisible) return null

  const cfg = contrato ? STATUS_CONFIG[contrato.status] : null
  const historico = contrato ? getHistorico(contrato.status, contrato.dataCriacao) : []

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'oklch(0 0 0 / 0.55)',
          backdropFilter: 'blur(4px)',
          animation: isVisible ? 'overlayIn 0.3s ease both' : 'overlayOut 0.25s ease both',
        }}
      />

      {/* ── Sheet Panel ── */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '420px', maxWidth: '95vw',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: 'oklch(0.15 0.022 250 / 0.97)',
          backdropFilter: 'blur(32px) saturate(180%)',
          borderLeft: '1px solid oklch(0.40 0.05 250 / 0.40)',
          boxShadow: '-8px 0 40px oklch(0 0 0 / 0.40), -2px 0 20px oklch(0.78 0.18 65 / 0.06)',
          animation: isVisible ? 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'slideOutRight 0.3s cubic-bezier(0.4,0,1,1) both',
        }}
      >
        {contrato && (
          <>
            {/* ── Header ── */}
            <div
              className="flex items-start justify-between px-6 py-5 shrink-0"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {contrato.id}
                  </span>
                  {cfg && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  )}
                </div>
                <h2
                  className="text-base font-extrabold truncate"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
                >
                  {contrato.cliente}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {contrato.cpfCnpj}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-colors hover:bg-white/10 ml-3 shrink-0"
                style={{ color: 'var(--color-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">

              {/* Destacador de valor */}
              <div
                className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                style={{
                  background: 'var(--color-primary-subtle)',
                  border: '1px solid var(--color-primary-glow)',
                  boxShadow: '0 0 24px var(--color-primary-glow)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>Valor Total</p>
                <p
                  className="text-3xl font-extrabold mt-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
                >
                  {fmtCurrency(contrato.valorTotal)}
                </p>
              </div>

              {/* Saldo devedor (somente Pendente) */}
              {contrato.status === 'Pendente' && contrato.saldoDevedor > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'oklch(0.82 0.15 80 / 0.08)',
                    border: '1px solid oklch(0.82 0.15 80 / 0.30)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} style={{ color: 'oklch(0.82 0.15 80)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'oklch(0.82 0.15 80)' }}>
                        Saldo Devedor
                      </span>
                    </div>
                    <span
                      className="text-lg font-extrabold"
                      style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.82 0.15 80)' }}
                    >
                      {fmtCurrency(contrato.saldoDevedor)}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                    Valor ainda não recebido pelo cliente
                  </p>
                </div>
              )}

              {/* Dados do Cliente */}
              <section>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-primary)' }}>
                  Dados do Cliente
                </p>
                <div className="glass rounded-xl px-4">
                  <InfoRow icon={<User size={13} />}    label="Nome"     value={contrato.cliente} />
                  <InfoRow icon={<MapPin size={13} />}  label="Cidade"   value={contrato.cidade} />
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--color-muted)' }}><Package size={13} /></span>
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Telefone</span>
                    </div>
                    <a
                      href={`tel:${contrato.telefone}`}
                      className="text-xs font-semibold"
                      style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      {contrato.telefone}
                    </a>
                  </div>
                </div>
              </section>

              {/* Produto & Contrato */}
              <section>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-primary)' }}>
                  Produto & Contrato
                </p>
                <div className="glass rounded-xl px-4">
                  <InfoRow icon={<Package size={13} />}     label="Produto"      value={contrato.produto} />
                  <InfoRow icon={<TrendingUp size={13} />}  label="Potência"     value={`${contrato.kwp} kWp`} />
                  <InfoRow icon={<Package size={13} />}     label="Painéis"      value={`${contrato.paineis} unidades`} />
                  <InfoRow icon={<CreditCard size={13} />}  label="Financiamento" value={contrato.financiamento} />
                  <InfoRow icon={<User size={13} />}        label="Vendedor"     value={contrato.vendedor} />
                  <InfoRow
                    icon={<Calendar size={13} />}
                    label="Data"
                    value={fmtDate(contrato.dataCriacao)}
                  />
                </div>
              </section>

              {/* Valores */}
              <section>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-primary)' }}>
                  Valores
                </p>
                <div className="glass rounded-xl px-4">
                  <InfoRow
                    icon={<DollarSign size={13} />}
                    label="Valor Total"
                    value={fmtCurrency(contrato.valorTotal)}
                    valueColor="var(--color-foreground)"
                  />
                  <InfoRow
                    icon={<TrendingUp size={13} />}
                    label="Comissão do Vendedor"
                    value={fmtCurrency(contrato.comissao)}
                    valueColor="oklch(0.72 0.17 145)"
                  />
                  {contrato.status === 'Pendente' && (
                    <InfoRow
                      icon={<AlertCircle size={13} />}
                      label="Saldo Devedor"
                      value={fmtCurrency(contrato.saldoDevedor)}
                      valueColor="oklch(0.82 0.15 80)"
                    />
                  )}
                </div>
              </section>

              {/* Histórico */}
              <section>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
                  Histórico
                </p>
                <div className="flex flex-col gap-0">
                  {historico.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                          style={{ background: h.color }}
                        />
                        {i < historico.length - 1 && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{ background: 'var(--color-border)', minHeight: '24px' }}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold" style={{ color: h.color }}>{h.label}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} style={{ color: 'var(--color-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            {fmtDate(h.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  )
}
