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

const STATUS_CONFIG: Record<ContratoStatus, { label: string; color: string; bg: string; borderColor: string; icon: React.ReactNode }> = {
  Aprovado: { label: 'Aprovado', color: '#16A34A', bg: '#F0FDF4', borderColor: '#BBF7D0', icon: <CheckCircle2 size={13} /> },
  Pendente: { label: 'Pag. Pendente', color: '#CA8A04', bg: '#FEFCE8', borderColor: 'rgba(202,138,4,0.30)', icon: <AlertCircle size={13} /> },
  Cancelado: { label: 'Cancelado', color: '#DC2626', bg: '#FEF2F2', borderColor: '#FECACA', icon: <XCircle size={13} /> },
  'Em Instalação': { label: 'Em Instalação', color: '#2563EB', bg: '#EFF6FF', borderColor: 'rgba(37,99,235,0.25)', icon: <Wrench size={13} /> },
  Concluído: { label: 'Concluído', color: '#0F766E', bg: '#F0FDFA', borderColor: 'rgba(15,118,110,0.25)', icon: <BadgeCheck size={13} /> },
}

function getHistorico(status: ContratoStatus, data: string): { label: string; date: string; color: string }[] {
  const base = [{ label: 'Contrato criado', date: data, color: '#6B7A99' }]
  if (status === 'Cancelado') return [...base, { label: 'Contrato cancelado', date: data, color: '#DC2626' }]
  if (status === 'Pendente') return [...base, { label: 'Aguardando pagamento restante', date: data, color: '#CA8A04' }]
  if (status === 'Aprovado') return [...base, { label: 'Contrato aprovado', date: data, color: '#16A34A' }]
  if (status === 'Em Instalação') return [...base,
  { label: 'Contrato aprovado', date: data, color: '#16A34A' },
  { label: 'Instalação iniciada', date: data, color: '#2563EB' },
  ]
  return [...base,
  { label: 'Contrato aprovado', date: data, color: '#16A34A' },
  { label: 'Instalação iniciada', date: data, color: '#2563EB' },
  { label: 'Concluído com sucesso', date: data, color: '#0F766E' },
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-muted-light)', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: valueColor ?? 'var(--color-foreground)', textAlign: 'right', maxWidth: '55%' }}>
        {value}
      </span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'var(--color-primary)',
      margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      <span style={{
        display: 'inline-block', width: '14px', height: '2px',
        background: 'var(--color-primary)', borderRadius: '1px', flexShrink: 0,
      }} />
      {children}
    </p>
  )
}

export default function ContratoSheet({ contrato, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
          background: 'rgba(15,25,41,0.40)',
          backdropFilter: 'blur(4px)',
          animation: isVisible ? 'overlayIn 0.3s ease both' : 'overlayOut 0.25s ease both',
        }}
      />

      {/* ── Sheet Panel — light ── */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '440px', maxWidth: '95vw',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-4px 0 32px rgba(15,25,41,0.12), -1px 0 8px rgba(15,25,41,0.06)',
          animation: isVisible ? 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'slideOutRight 0.3s cubic-bezier(0.4,0,1,1) both',
        }}
      >
        {contrato && (
          <>
            {/* ── Header com tarja colorida ── */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
              padding: '20px 20px 16px',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Logo pequena (decorativa) */}
              <img
                src="/logo.jpg"
                alt=""
                style={{
                  position: 'absolute', right: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  height: '44px', opacity: 0.15,
                  pointerEvents: 'none', userSelect: 'none',
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '30px', height: '30px', borderRadius: '8px',
                  border: 'none', background: 'rgba(255,255,255,0.10)',
                  color: 'rgba(255,255,255,0.70)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#fff'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)'
                    ; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.70)'
                }}
              >
                <X size={15} />
              </button>

              <div style={{ paddingRight: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700,
                    color: '#E8901A', letterSpacing: '0.05em',
                  }}>
                    {contrato.id}
                  </span>
                  {cfg && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '99px',
                      fontSize: '0.7rem', fontWeight: 600,
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.borderColor}`,
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  )}
                </div>
                <h2 style={{
                  fontSize: '1.05rem', fontWeight: 800,
                  color: '#FFFFFF', margin: '0 0 2px',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {contrato.cliente}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  {contrato.cpfCnpj}
                </p>
              </div>
            </div>

            {/* ── Valor Destaque ── */}
            <div style={{
              display: 'flex', gap: '10px', padding: '14px 20px',
              background: 'var(--color-background)',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}>
              <div style={{
                flex: 1, padding: '12px 14px', borderRadius: '10px',
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-border)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', margin: '0 0 3px' }}>
                  Valor Total
                </p>
                <p style={{
                  fontSize: '1.3rem', fontWeight: 800, margin: 0, lineHeight: 1.1,
                  fontFamily: 'var(--font-display)', color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  {fmtCurrency(contrato.valorTotal)}
                </p>
              </div>

              <div style={{
                flex: 1, padding: '12px 14px', borderRadius: '10px',
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-success)', margin: '0 0 3px' }}>
                  Comissão
                </p>
                <p style={{
                  fontSize: '1.3rem', fontWeight: 800, margin: 0, lineHeight: 1.1,
                  fontFamily: 'var(--font-display)', color: 'var(--color-success)',
                  letterSpacing: '-0.02em',
                }}>
                  {fmtCurrency(contrato.comissao)}
                </p>
              </div>
            </div>

            {/* ── Alerta saldo devedor ── */}
            {contrato.status === 'Pendente' && contrato.saldoDevedor > 0 && (
              <div style={{
                margin: '14px 20px 0',
                padding: '10px 14px', borderRadius: '10px',
                background: '#FEFCE8',
                border: '1px solid rgba(202,138,4,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <AlertCircle size={14} color="#CA8A04" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CA8A04' }}>Saldo Devedor</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#CA8A04', fontFamily: 'var(--font-display)' }}>
                  {fmtCurrency(contrato.saldoDevedor)}
                </span>
              </div>
            )}

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Dados do Cliente */}
              <section>
                <SectionLabel>Dados do Cliente</SectionLabel>
                <div style={{
                  background: 'var(--color-background)',
                  borderRadius: '10px', padding: '0 14px',
                  border: '1px solid var(--color-border)',
                }}>
                  <InfoRow icon={<User size={13} />} label="Nome" value={contrato.cliente} />
                  <InfoRow icon={<MapPin size={13} />} label="Cidade" value={contrato.cidade} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--color-muted-light)', flexShrink: 0 }}><Package size={13} /></span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Telefone</span>
                    </div>
                    <a
                      href={`tel:${contrato.telefone}`}
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      {contrato.telefone}
                    </a>
                  </div>
                </div>
              </section>

              {/* Produto & Contrato */}
              <section>
                <SectionLabel>Produto & Contrato</SectionLabel>
                <div style={{
                  background: 'var(--color-background)',
                  borderRadius: '10px', padding: '0 14px',
                  border: '1px solid var(--color-border)',
                }}>
                  <InfoRow icon={<Package size={13} />} label="Produto" value={contrato.produto} />
                  <InfoRow icon={<TrendingUp size={13} />} label="Potência" value={`${contrato.kwp} kWp`} />
                  <InfoRow icon={<Package size={13} />} label="Painéis" value={`${contrato.paineis} unidades`} />
                  <InfoRow icon={<CreditCard size={13} />} label="Financiamento" value={contrato.financiamento} />
                  <InfoRow icon={<Calendar size={13} />} label="Data" value={fmtDate(contrato.dataCriacao)} />
                </div>
              </section>

              {/* Valores */}
              <section>
                <SectionLabel>Valores</SectionLabel>
                <div style={{
                  background: 'var(--color-background)',
                  borderRadius: '10px', padding: '0 14px',
                  border: '1px solid var(--color-border)',
                }}>
                  <InfoRow icon={<DollarSign size={13} />} label="Valor Total" value={fmtCurrency(contrato.valorTotal)} />
                  <InfoRow
                    icon={<TrendingUp size={13} />}
                    label="Comissão do Vendedor"
                    value={fmtCurrency(contrato.comissao)}
                    valueColor="var(--color-success)"
                  />
                  {contrato.status === 'Pendente' && (
                    <InfoRow
                      icon={<AlertCircle size={13} />}
                      label="Saldo Devedor"
                      value={fmtCurrency(contrato.saldoDevedor)}
                      valueColor="#CA8A04"
                    />
                  )}
                </div>
              </section>

              {/* Histórico */}
              <section>
                <SectionLabel>Histórico</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {historico.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: h.color, marginTop: '2px',
                          boxShadow: `0 0 0 3px ${h.color}22`,
                        }} />
                        {i < historico.length - 1 && (
                          <div style={{ width: '1px', minHeight: '28px', flex: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: '16px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: h.color, margin: 0 }}>{h.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={10} color="var(--color-muted-light)" />
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{fmtDate(h.date)}</span>
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
