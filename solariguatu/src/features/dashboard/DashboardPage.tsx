import { Sun, TrendingUp, DollarSign, Zap, Target, Award, ArrowUpRight, FileText } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import MetricCard from '../../components/ui/MetricCard'
import { vendasMensais, metricas, statusPipeline } from './mockDashboard'
import { useAuth } from '../../hooks/useAuth'

const fmt = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2)}M`
    : `R$ ${(v / 1_000).toFixed(0)}k`

const pct = (a: number, b: number) => {
  const d = ((a - b) / b) * 100
  return `${d >= 0 ? '+' : ''}${Math.abs(d).toFixed(1)}%`
}

/* Tooltip */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.78rem',
      boxShadow: '0 8px 24px rgba(15,25,41,0.12)',
    }}>
      <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--color-foreground)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: 0, color: p.color || 'var(--color-primary)' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name === 'Faturamento' ? fmt(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function ChartHeader({ title, sub, badge }: { title: string; sub: string; badge?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <p style={{
          fontSize: '0.875rem', fontWeight: 700,
          color: 'var(--color-foreground)', margin: 0,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </p>
        {badge && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: 'var(--color-primary)',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: '99px', padding: '2px 9px',
          }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>{sub}</p>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(15,25,41,0.06)',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'Vendedor'

  const pctMeta    = Math.min(100, Math.round((metricas.faturamento   / metricas.metaReais) * 100))
  const pctMetaKwp = Math.min(100, Math.round((metricas.kwpInstalados / metricas.metaKwp)   * 100))

  /* Pipeline como KPI textual (substitui o RadialBarChart) */
  const totalPipeline = statusPipeline.reduce((s: number, x: any) => s + x.value, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 800, margin: '0 0 4px',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
            color: 'var(--color-foreground)',
          }}>
            Olá, {firstName}! 🌟
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>
            Seu desempenho em Dezembro 2025
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: '99px',
          background: 'var(--color-primary-light)',
          border: '1px solid var(--color-primary-border)',
          fontSize: '0.78rem', fontWeight: 600,
          color: 'var(--color-primary)',
          whiteSpace: 'nowrap',
        }}>
          <Sun size={13} />
          Tempo Real
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--color-success)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── KPI Cards: 4 col desktop / 2 col mobile ── */}
      <div className="kpi-grid stagger">
        <MetricCard
          label="Vendas no mês"
          value={String(metricas.vendasMes)}
          sub="contratos fechados"
          icon={<TrendingUp size={15} />}
          trend={{ value: pct(metricas.vendasMes, metricas.vendasMesAnterior), positive: metricas.vendasMes >= metricas.vendasMesAnterior }}
          highlight
          delay={0}
        />
        <MetricCard
          label="kWp Instalados"
          value={`${metricas.kwpInstalados} kWp`}
          sub="potência acumulada"
          icon={<Zap size={15} />}
          trend={{ value: pct(metricas.kwpInstalados, metricas.kwpAnterior), positive: metricas.kwpInstalados >= metricas.kwpAnterior }}
          delay={70}
        />
        <MetricCard
          label="Faturamento"
          value={fmt(metricas.faturamento)}
          sub="receita bruta estimada"
          icon={<DollarSign size={15} />}
          trend={{ value: pct(metricas.faturamento, metricas.faturamentoAnterior), positive: metricas.faturamento >= metricas.faturamentoAnterior }}
          delay={140}
        />
        <MetricCard
          label="Ticket Médio"
          value={`R$ ${metricas.ticketMedio.toLocaleString('pt-BR')}`}
          sub="por contrato"
          icon={<Target size={15} />}
          trend={{ value: pct(metricas.ticketMedio, metricas.ticketAnterior), positive: metricas.ticketMedio >= metricas.ticketAnterior }}
          delay={210}
        />
      </div>

      {/* ── Metas ── */}
      <div style={{ ...cardStyle }} className="animate-slideUp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award size={14} color="var(--color-primary)" />
            </div>
            <p style={{
              fontSize: '0.875rem', fontWeight: 700, margin: 0,
              color: 'var(--color-foreground)', fontFamily: 'var(--font-display)',
            }}>
              Progresso das Metas — Dez/2025
            </p>
          </div>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '99px',
            background: pctMeta >= 100 ? 'var(--color-success-bg)' : 'var(--color-primary-light)',
            color: pctMeta >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
            border: `1px solid ${pctMeta >= 100 ? 'var(--color-success-border)' : 'var(--color-primary-border)'}`,
            whiteSpace: 'nowrap',
          }}>
            {pctMeta >= 100 ? '🎉 Meta atingida!' : `${pctMeta}% da meta`}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Faturamento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                Faturamento · R$ {metricas.faturamento.toLocaleString('pt-BR')}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Meta: {fmt(metricas.metaReais)}
              </span>
            </div>
            <div style={{
              height: '8px', borderRadius: '99px',
              background: 'var(--color-surface-2)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${pctMeta}%`,
                background: 'linear-gradient(90deg, #E8901A, #F5A93A)',
                transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0 }}>
              {pctMeta >= 100
                ? `✓ Superou em R$ ${(metricas.faturamento - metricas.metaReais).toLocaleString('pt-BR')}`
                : `Faltam R$ ${(metricas.metaReais - metricas.faturamento).toLocaleString('pt-BR')}`}
            </p>
          </div>

          {/* kWp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                kWp vendido · {metricas.kwpInstalados} kWp
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-success)' }}>
                Meta: {metricas.metaKwp} kWp
              </span>
            </div>
            <div style={{
              height: '8px', borderRadius: '99px',
              background: 'var(--color-surface-2)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${pctMetaKwp}%`,
                background: 'linear-gradient(90deg, #16A34A, #4ADE80)',
                transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0 }}>
              {pctMetaKwp >= 100
                ? `✓ Superou em ${(metricas.kwpInstalados - metricas.metaKwp).toFixed(1)} kWp`
                : `Faltam ${(metricas.metaKwp - metricas.kwpInstalados).toFixed(1)} kWp`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Pipeline como KPI textual (substitui RadialBarChart) ── */}
      <div style={{ ...cardStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={14} color="var(--color-primary)" />
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
            Pipeline de Contratos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statusPipeline.map((s: any) => (
            <div key={s.name} style={{
              flex: '1 1 0',
              minWidth: '80px',
              padding: '12px',
              borderRadius: '10px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: s.fill, margin: '0 auto 6px',
              }} />
              <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-foreground)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
                {s.value}
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)', margin: 0, fontWeight: 600 }}>
                {s.name}
              </p>
            </div>
          ))}
          {/* Total */}
          <div style={{
            flex: '1 1 0',
            minWidth: '80px',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#E8901A', margin: '0 auto 6px',
            }} />
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
              {totalPipeline}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
              Total
            </p>
          </div>
        </div>
      </div>

      {/* ── 2 Gráficos principais: 1 col mobile / 2 col desktop ── */}
      <div className="charts-grid">

        {/* Gráfico 1: Evolução do Faturamento (AreaChart) */}
        <div style={{ ...cardStyle }} className="animate-slideUp">
          <ChartHeader
            title="Evolução do Faturamento"
            sub="Janeiro – Dezembro 2025"
            badge="2025"
          />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={vendasMensais} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E8901A" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#E8901A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="faturamento"
                name="Faturamento"
                stroke="#E8901A"
                strokeWidth={2}
                fill="url(#gradFat)"
                dot={false}
                activeDot={{ r: 4, fill: '#E8901A', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Contratos por Mês (BarChart) */}
        <div style={{ ...cardStyle }} className="animate-slideUp">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <ChartHeader
              title="Contratos por Mês"
              sub="Volume de contratos em 2025"
            />
            <button style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0', whiteSpace: 'nowrap',
            }}>
              Ver todos <ArrowUpRight size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vendasMensais} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="contratos"
                name="Contratos"
                fill="#E8901A"
                radius={[5, 5, 0, 0]}
                opacity={0.90}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 0 0 4px rgba(22,163,74,0.35); }
        }
      `}</style>
    </div>
  )
}
