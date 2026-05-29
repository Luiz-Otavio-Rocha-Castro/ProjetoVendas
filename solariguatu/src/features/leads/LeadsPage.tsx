import { useState } from 'react'
import {
  Phone, MapPin, Zap, DollarSign,
  ArrowRight, Clock, Tag, Users,
  TrendingUp, AlertTriangle, CheckCircle2,
  MessageCircle, Instagram, Globe, Navigation,
  ChevronRight,
} from 'lucide-react'
import { mockLeads, type Lead, type LeadStatus } from './mockLeads'
import { differenceInDays, parseISO } from 'date-fns'

const COLUMNS: LeadStatus[] = ['Prospecção', 'Em Negociação', 'Proposta Enviada']

const COLUMN_STYLE: Record<LeadStatus, { accent: string; bg: string; border: string; badge: string }> = {
  'Prospecção':      { accent: 'oklch(0.72 0.15 220)', bg: 'oklch(0.72 0.15 220 / 0.08)', border: 'oklch(0.72 0.15 220 / 0.20)', badge: 'badge badge-info' },
  'Em Negociação':  { accent: 'oklch(0.82 0.15 80)',  bg: 'oklch(0.82 0.15 80 / 0.08)',  border: 'oklch(0.82 0.15 80 / 0.20)',  badge: 'badge badge-warning' },
  'Proposta Enviada':{ accent: 'oklch(0.78 0.18 65)', bg: 'oklch(0.78 0.18 65 / 0.08)',  border: 'oklch(0.78 0.18 65 / 0.20)',  badge: 'badge badge-muted' },
}

const NEXT_STATUS: Record<LeadStatus, LeadStatus | 'Aprovado'> = {
  'Prospecção':      'Em Negociação',
  'Em Negociação':  'Proposta Enviada',
  'Proposta Enviada':'Aprovado',
}

const NEXT_LABEL: Record<LeadStatus, string> = {
  'Prospecção':      'Iniciar Negociação',
  'Em Negociação':  'Enviar Proposta',
  'Proposta Enviada':'Fechar Contrato ✓',
}

const ORIGEM_ICON: Record<Lead['origem'], React.ReactNode> = {
  'Indicação': <Users size={11} />,
  'Instagram': <Instagram size={11} />,
  'WhatsApp':  <MessageCircle size={11} />,
  'Visita':    <Navigation size={11} />,
  'Google':    <Globe size={11} />,
}

const fmt = (v: number) =>
  v >= 100_000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v.toLocaleString('pt-BR')}`

function LeadCard({ lead, onAdvance, onRemove }: {
  lead: Lead
  onAdvance: (id: string) => void
  onRemove: (id: string) => void
}) {
  const dias = differenceInDays(new Date(), parseISO(lead.dataContato))
  const isUrgente = dias > 7
  const isClosing = lead.status === 'Proposta Enviada'

  return (
    <div
      className="glass rounded-2xl p-4 hover-lift animate-slideUp"
      style={{
        border: `1px solid ${isUrgente ? 'oklch(0.65 0.22 25 / 0.30)' : 'oklch(0.35 0.04 250 / 0.35)'}`,
        boxShadow: isClosing ? '0 0 20px oklch(0.78 0.18 65 / 0.10)' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-snug truncate"
            style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}
          >
            {lead.cliente}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={10} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{lead.cidade}</span>
          </div>
        </div>
        {isUrgente && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
            style={{ background: 'oklch(0.65 0.22 25 / 0.15)', border: '1px solid oklch(0.65 0.22 25 / 0.25)' }}
          >
            <AlertTriangle size={10} style={{ color: 'var(--color-danger)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
              {dias}d
            </span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div
          className="rounded-xl px-3 py-2"
          style={{ background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-glow)' }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Zap size={10} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>kWp</span>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
            {lead.kwp} kWp
          </p>
        </div>
        <div
          className="rounded-xl px-3 py-2"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <DollarSign size={10} style={{ color: 'var(--color-success)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Proposta</span>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
            {fmt(lead.valorProposta)}
          </p>
        </div>
      </div>

      {/* Telefone */}
      <a
        href={`tel:${lead.telefone}`}
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 transition-colors"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <Phone size={12} style={{ color: 'var(--color-primary)' }} />
        <span className="text-xs font-medium">{lead.telefone}</span>
      </a>

      {/* Obs */}
      {lead.observacao && (
        <p
          className="text-xs px-3 py-2 rounded-xl mb-3 leading-relaxed"
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          {lead.observacao}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {ORIGEM_ICON[lead.origem]}
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{lead.origem}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{dias}d atrás</span>
          </div>
        </div>
        <button
          onClick={() => lead.status === 'Proposta Enviada' ? onRemove(lead.id) : onAdvance(lead.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
          style={{
            background: isClosing ? 'var(--color-primary)' : 'var(--color-primary-subtle)',
            color: isClosing ? '#0a0a0a' : 'var(--color-primary)',
            border: `1px solid ${isClosing ? 'var(--color-primary)' : 'var(--color-primary-glow)'}`,
            boxShadow: isClosing ? '0 2px 12px var(--color-primary-glow)' : 'none',
          }}
        >
          {isClosing ? <CheckCircle2 size={11} /> : <ChevronRight size={11} />}
          {NEXT_LABEL[lead.status]}
        </button>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)

  const totalKwp = leads.reduce((s, l) => s + l.kwp, 0)
  const totalValor = leads.reduce((s, l) => s + l.valorProposta, 0)

  const advanceLead = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const next = NEXT_STATUS[l.status]
        if (next === 'Aprovado') return l
        return { ...l, status: next as LeadStatus }
      })
    )
  }

  const removeLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Pipeline de Leads
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Acompanhe e avance seus clientes pelo funil de vendas
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)' }}
        >
          <TrendingUp size={13} />
          {leads.length} leads ativos
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-3 stagger">
        {[
          { label: 'Leads Ativos', value: String(leads.length), icon: <Tag size={14} />, color: 'var(--color-foreground)' },
          { label: 'kWp em Jogo', value: `${totalKwp.toFixed(1)} kWp`, icon: <Zap size={14} />, color: 'var(--color-primary)' },
          { label: 'Valor Potencial', value: fmt(totalValor), icon: <DollarSign size={14} />, color: 'var(--color-success)' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl px-4 py-3 flex items-center gap-3 animate-slideUp">
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
              <p className="text-base font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col)
          const style = COLUMN_STYLE[col]
          const colKwp = colLeads.reduce((s, l) => s + l.kwp, 0)

          return (
            <div key={col} className="flex flex-col gap-3">
              {/* Column header */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: style.accent }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: style.accent, fontFamily: 'var(--font-display)' }}
                  >
                    {col}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {colKwp.toFixed(1)} kWp
                  </span>
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: style.accent, color: '#0a0a0a' }}
                  >
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {colLeads.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center"
                    style={{
                      background: 'oklch(0.17 0.025 250 / 0.30)',
                      border: '1px dashed var(--color-border)',
                    }}
                  >
                    <ArrowRight size={20} style={{ color: 'var(--color-border)' }} />
                    <p className="text-xs" style={{ color: 'var(--color-border)' }}>Nenhum lead nesta etapa</p>
                  </div>
                ) : (
                  colLeads.map((lead, i) => (
                    <div key={lead.id} style={{ animationDelay: `${i * 60}ms` }}>
                      <LeadCard lead={lead} onAdvance={advanceLead} onRemove={removeLead} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
