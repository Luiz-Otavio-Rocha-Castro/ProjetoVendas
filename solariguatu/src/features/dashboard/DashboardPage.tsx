import { Sun, TrendingUp, DollarSign, Zap, Target, Award } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadialBarChart, RadialBar,
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

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs" style={{ border: '1px solid var(--color-border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || 'var(--color-primary)' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name === 'Faturamento' ? fmt(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'Vendedor'

  const pctMeta = Math.min(100, Math.round((metricas.faturamento / metricas.metaReais) * 100))
  const pctMetaKwp = Math.min(100, Math.round((metricas.kwpInstalados / metricas.metaKwp) * 100))

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Olá, {firstName}! 🌟
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Aqui está o seu desempenho em Dezembro 2025
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary-glow)',
          }}
        >
          <Sun size={13} />
          Tempo Real
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger">
        <MetricCard
          label="Vendas no mês"
          value={String(metricas.vendasMes)}
          sub="contratos fechados"
          icon={<TrendingUp size={16} />}
          trend={{ value: pct(metricas.vendasMes, metricas.vendasMesAnterior), positive: metricas.vendasMes >= metricas.vendasMesAnterior }}
          highlight
          delay={0}
        />
        <MetricCard
          label="kWp Instalados"
          value={`${metricas.kwpInstalados} kWp`}
          sub="potência acumulada"
          icon={<Zap size={16} />}
          trend={{ value: pct(metricas.kwpInstalados, metricas.kwpAnterior), positive: metricas.kwpInstalados >= metricas.kwpAnterior }}
          delay={60}
        />
        <MetricCard
          label="Faturamento"
          value={fmt(metricas.faturamento)}
          sub="receita bruta estimada"
          icon={<DollarSign size={16} />}
          trend={{ value: pct(metricas.faturamento, metricas.faturamentoAnterior), positive: metricas.faturamento >= metricas.faturamentoAnterior }}
          delay={120}
        />
        <MetricCard
          label="Ticket Médio"
          value={`R$ ${metricas.ticketMedio.toLocaleString('pt-BR')}`}
          sub="por contrato"
          icon={<Target size={16} />}
          trend={{ value: pct(metricas.ticketMedio, metricas.ticketAnterior), positive: metricas.ticketMedio >= metricas.ticketAnterior }}
          delay={180}
        />
      </div>

      {/* ── Meta do mês ── */}
      <div
        className="glass rounded-2xl p-5 animate-slideUp"
        style={{ animationDelay: '180ms' }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Award size={16} style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
              Progresso das Metas — Dez/2025
            </p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{
              background: pctMeta >= 100 ? 'oklch(0.72 0.17 145 / 0.15)' : 'var(--color-primary-subtle)',
              color: pctMeta >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
              border: `1px solid ${pctMeta >= 100 ? 'oklch(0.72 0.17 145 / 0.25)' : 'var(--color-primary-glow)'}`,
            }}
          >
            {pctMeta >= 100 ? '🎉 Meta batida!' : `${pctMeta}% da meta`}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Faturamento meta */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-muted)' }}>Faturamento · R$ {metricas.faturamento.toLocaleString('pt-BR')}</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                Meta: {fmt(metricas.metaReais)}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctMeta}%`, background: 'linear-gradient(90deg, var(--color-primary-dim), var(--color-primary))' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {pctMeta >= 100
                ? `Superou em R$ ${(metricas.faturamento - metricas.metaReais).toLocaleString('pt-BR')}`
                : `Faltam R$ ${(metricas.metaReais - metricas.faturamento).toLocaleString('pt-BR')}`}
            </p>
          </div>
          {/* kWp meta */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-muted)' }}>kWp vendido · {metricas.kwpInstalados} kWp</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                Meta: {metricas.metaKwp} kWp
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctMetaKwp}%`, background: 'linear-gradient(90deg, oklch(0.65 0.17 145), var(--color-success))' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {pctMetaKwp >= 100
                ? `Superou em ${(metricas.kwpInstalados - metricas.metaKwp).toFixed(1)} kWp`
                : `Faltam ${(metricas.metaKwp - metricas.kwpInstalados).toFixed(1)} kWp`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Area chart - faturamento */}
        <div className="glass rounded-2xl p-5 lg:col-span-2 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
                Evolução do Faturamento
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Janeiro – Dezembro 2025 · Seus resultados</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vendasMensais} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.78 0.18 65)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="oklch(0.78 0.18 65)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 250 / 0.5)" />
              <XAxis dataKey="mes" tick={{ fill: 'oklch(0.60 0.02 250)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="faturamento"
                name="Faturamento"
                stroke="oklch(0.78 0.18 65)"
                strokeWidth={2.5}
                fill="url(#gradFat)"
                dot={false}
                activeDot={{ r: 5, fill: 'oklch(0.78 0.18 65)', stroke: '#0a0a0a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radial bar - pipeline */}
        <div className="glass rounded-2xl p-5 animate-slideUp" style={{ animationDelay: '260ms' }}>
          <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
            Meu Pipeline
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>Distribuição por etapa</p>
          <ResponsiveContainer width="100%" height={190}>
            <RadialBarChart innerRadius="30%" outerRadius="90%" data={statusPipeline} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" background={{ fill: 'oklch(0.20 0.03 250)' }} cornerRadius={4} />
              <Tooltip content={<ChartTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {statusPipeline.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} />
                  <span style={{ color: 'var(--color-muted)' }}>{s.name}</span>
                </div>
                <span style={{ color: 'var(--color-foreground)' }} className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bar chart contratos ── */}
      <div className="glass rounded-2xl p-5 animate-slideUp" style={{ animationDelay: '300ms' }}>
        <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
          Contratos por Mês
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>Volume de contratos fechados em 2025</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={vendasMensais} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 250 / 0.5)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: 'oklch(0.60 0.02 250)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="contratos"
              name="Contratos"
              fill="oklch(0.78 0.18 65)"
              radius={[6, 6, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
