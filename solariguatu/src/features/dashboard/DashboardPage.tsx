import { useState } from 'react'
import { TrendingUp, DollarSign, Zap, Target, Award, FileText, Download } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import MetricCard from '../../components/ui/MetricCard'
import { useAuth } from '../../hooks/useAuth'
import { useVendas } from '../../hooks/useVendas'
import { usePerfil } from '../../hooks/usePerfil'

const fmt = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2)}M`
    : `R$ ${(v / 1_000).toFixed(0)}k`

const pct = (a: number, b: number) => {
  if (!b) return a > 0 ? '+100.0%' : '0.0%'
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

  const { contratos, isLoading: loadingContratos } = useVendas()
  const { perfil, loading: loadingPerfil } = usePerfil()
  const isLoading = loadingContratos || loadingPerfil

  // Datas Dinâmicas
  const [selectedDate, setSelectedDate] = useState(new Date())
  const now = selectedDate
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const monthName = now.toLocaleString('pt-BR', { month: 'long' })
  const monthString = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentYear}`
  const shortMonthName = now.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
  const shortMonthString = `${shortMonthName.charAt(0).toUpperCase() + shortMonthName.slice(1)}/${currentYear}`

  // Filtros
  const contratosMesAtual = contratos.filter(c => {
    const d = new Date(c.dataCriacao)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const contratosMesAnterior = contratos.filter(c => {
    const d = new Date(c.dataCriacao)
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear
  })

  // KPIs
  const metricas = {
    vendasMes: contratosMesAtual.length,
    vendasMesAnterior: contratosMesAnterior.length,
    kwpInstalados: contratosMesAtual.reduce((acc, c) => acc + (Number(c.kwp) || 0), 0),
    kwpAnterior: contratosMesAnterior.reduce((acc, c) => acc + (Number(c.kwp) || 0), 0),
    faturamento: contratosMesAtual.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
    faturamentoAnterior: contratosMesAnterior.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
    get ticketMedio() { return this.vendasMes > 0 ? this.faturamento / this.vendasMes : 0 },
    get ticketAnterior() { return this.vendasMesAnterior > 0 ? this.faturamentoAnterior / this.vendasMesAnterior : 0 },
    metaReais: perfil?.metaReais || 1,
    metaKwp: perfil?.metaKwp || 1,
  }

  // Pipeline
  const statusPipeline = [
    { name: 'Pendente', value: contratosMesAtual.filter(c => c.status === 'Pendente').length, fill: '#E8901A' },
    { name: 'Aprovado', value: contratosMesAtual.filter(c => c.status === 'Aprovado').length, fill: '#3B82F6' },
    { name: 'Em Instalação', value: contratosMesAtual.filter(c => c.status === 'Em Instalação').length, fill: '#8B5CF6' },
    { name: 'Concluído', value: contratosMesAtual.filter(c => c.status === 'Concluído').length, fill: '#10B981' },
    { name: 'Cancelado', value: contratosMesAtual.filter(c => c.status === 'Cancelado').length, fill: '#EF4444' },
  ]

  // Gráficos (12 meses do ano)
  const vendasMensais = Array.from({ length: 12 }, (_, i) => {
    const mesDate = new Date(currentYear, i, 1)
    const mesNome = mesDate.toLocaleString('pt-BR', { month: 'short' })
    const formatado = mesNome.charAt(0).toUpperCase() + mesNome.slice(1).replace('.', '')
    const contratosNoMes = contratos.filter(c => {
      const d = new Date(c.dataCriacao)
      return d.getMonth() === i && d.getFullYear() === currentYear
    })
    return {
      mes: formatado,
      faturamento: contratosNoMes.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
      contratos: contratosNoMes.length
    }
  })

  const pctMeta    = Math.min(100, Math.round((metricas.faturamento   / metricas.metaReais) * 100))
  const pctMetaKwp = Math.min(100, Math.round((metricas.kwpInstalados / metricas.metaKwp)   * 100))

  // Drawer state — guarda o índice do mês clicado (0=Jan..11=Dez), null = fechado
  const [drawerMesIdx, setDrawerMesIdx] = useState<number | null>(null)
  const [drawerSearch, setDrawerSearch] = useState('')

  const drawerContratos = drawerMesIdx !== null
    ? contratos.filter(c => {
        const d = new Date(c.dataCriacao)
        return d.getMonth() === drawerMesIdx && d.getFullYear() === currentYear
      })
    : []

  const contratosFiltrados = drawerContratos.filter(c =>
    drawerSearch === '' ||
    c.cliente.toLowerCase().includes(drawerSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(drawerSearch.toLowerCase()) ||
    c.status.toLowerCase().includes(drawerSearch.toLowerCase())
  )

  const drawerMesNome = drawerMesIdx !== null
    ? new Date(currentYear, drawerMesIdx, 1).toLocaleString('pt-BR', { month: 'long' })
    : ''

  /* Pipeline como KPI textual (substitui o RadialBarChart) */
  const totalPipeline = statusPipeline.reduce((s: number, x: any) => s + x.value, 0)

  // ── Gerador de PDF ──
  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const PAGE_W = 210
    const MARGIN = 16
    const COL_W = PAGE_W - MARGIN * 2
    let y = 0

    // Paleta
    const AMBER = [232, 144, 26] as [number, number, number]
    const NAVY  = [10,  26,  48] as [number, number, number]
    const GRAY  = [100, 116, 139] as [number, number, number]
    const LIGHT = [248, 250, 252] as [number, number, number]
    const WHITE = [255, 255, 255] as [number, number, number]
    const GREEN = [22, 163,  74] as [number, number, number]
    const RED   = [239,  68,  68] as [number, number, number]

    // ── Cabeçalho ──
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, PAGE_W, 36, 'F')

    doc.setTextColor(...AMBER)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SolarIguatu', MARGIN, 15)

    doc.setTextColor(...WHITE)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Energia Solar | Soluções Sustentáveis', MARGIN, 21)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Relatório de Desempenho — ${monthString}`, PAGE_W - MARGIN, 14, { align: 'right' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Vendedor: ${user?.name ?? 'Vendedor'}`, PAGE_W - MARGIN, 20, { align: 'right' })
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, PAGE_W - MARGIN, 25, { align: 'right' })

    // Linha dourada
    doc.setDrawColor(...AMBER)
    doc.setLineWidth(0.8)
    doc.line(0, 36, PAGE_W, 36)
    y = 44

    // ── Helper: mini card ──
    const miniCard = (x: number, cardY: number, w: number, label: string, value: string, color: [number,number,number]) => {
      doc.setFillColor(...LIGHT)
      doc.roundedRect(x, cardY, w, 22, 3, 3, 'F')
      doc.setDrawColor(220, 230, 240)
      doc.setLineWidth(0.3)
      doc.roundedRect(x, cardY, w, 22, 3, 3, 'S')
      doc.setFillColor(...color)
      doc.roundedRect(x, cardY, 3, 22, 1.5, 1.5, 'F')
      doc.setTextColor(...GRAY)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(label.toUpperCase(), x + 6, cardY + 7)
      doc.setTextColor(...NAVY)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(value, x + 6, cardY + 16)
    }

    // ── Seção: Resumo de KPIs ──
    doc.setTextColor(...NAVY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Mês', MARGIN, y)
    doc.setDrawColor(...AMBER)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, y + 1.5, MARGIN + 38, y + 1.5)
    y += 5

    const totalComissaoMes = contratosMesAtual.reduce((acc, c) => acc + (Number(c.comissao) || 0), 0)

    const cardW = (COL_W - 12) / 5
    miniCard(MARGIN,                     y, cardW, 'Vendas',        `${metricas.vendasMes} contratos`,                                                            AMBER)
    miniCard(MARGIN + (cardW + 3) * 1,   y, cardW, 'Faturamento',   `R$ ${metricas.faturamento.toLocaleString('pt-BR')}`,                                         GREEN)
    miniCard(MARGIN + (cardW + 3) * 2,   y, cardW, 'kWp Vendido',   `${metricas.kwpInstalados.toFixed(1)} kWp`,                                                   [59, 130, 246])
    miniCard(MARGIN + (cardW + 3) * 3,   y, cardW, 'Ticket Medio',  `R$ ${metricas.ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,            [139, 92, 246])
    miniCard(MARGIN + (cardW + 3) * 4,   y, cardW, 'Comissao Total',`R$ ${totalComissaoMes.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`,               [16, 185, 129])
    y += 28

    // ── Seção: Progresso das Metas ──
    doc.setTextColor(...NAVY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Progresso das Metas', MARGIN, y)
    doc.setDrawColor(...AMBER)
    doc.line(MARGIN, y + 1.5, MARGIN + 50, y + 1.5)
    y += 6

    const drawBar = (barY: number, label: string, value: string, pctVal: number, color: [number,number,number]) => {
      doc.setTextColor(...GRAY)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(label, MARGIN, barY)
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica', 'bold')
      doc.text(value, PAGE_W - MARGIN, barY, { align: 'right' })
      const barY2 = barY + 2
      doc.setFillColor(220, 230, 240)
      doc.roundedRect(MARGIN, barY2, COL_W, 4, 1.5, 1.5, 'F')
      doc.setFillColor(...color)
      doc.roundedRect(MARGIN, barY2, Math.max(2, COL_W * pctVal / 100), 4, 1.5, 1.5, 'F')
    }

    drawBar(y, `Faturamento: R$ ${metricas.faturamento.toLocaleString('pt-BR')} / Meta: R$ ${metricas.metaReais.toLocaleString('pt-BR')}`, `${pctMeta}%`, pctMeta, [...AMBER] as [number,number,number])
    y += 10
    drawBar(y, `kWp Vendido: ${metricas.kwpInstalados.toFixed(1)} kWp / Meta: ${metricas.metaKwp} kWp`, `${pctMetaKwp}%`, pctMetaKwp, [...GREEN] as [number,number,number])
    y += 14

    // ── Seção: Pipeline de Contratos ──
    doc.setTextColor(...NAVY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pipeline do Mês (${totalPipeline} contratos)`, MARGIN, y)
    doc.setDrawColor(...AMBER)
    doc.line(MARGIN, y + 1.5, MARGIN + 70, y + 1.5)
    y += 6

    const pipeW = (COL_W - statusPipeline.length * 2) / statusPipeline.length
    const fillMap: Record<string,[number,number,number]> = {
      'Pendente': AMBER, 'Aprovado': [59,130,246], 'Em Instalação': [139,92,246],
      'Concluído': GREEN, 'Cancelado': RED
    }
    statusPipeline.forEach((s, idx) => {
      const px = MARGIN + idx * (pipeW + 2)
      const color = fillMap[s.name] ?? AMBER
      doc.setFillColor(...LIGHT)
      doc.roundedRect(px, y, pipeW, 20, 2, 2, 'F')
      doc.setDrawColor(220, 230, 240)
      doc.setLineWidth(0.3)
      doc.roundedRect(px, y, pipeW, 20, 2, 2, 'S')
      doc.setFillColor(...color)
      doc.circle(px + pipeW / 2, y + 5, 2, 'F')
      doc.setTextColor(...NAVY)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(String(s.value), px + pipeW / 2, y + 12, { align: 'center' })
      doc.setTextColor(...GRAY)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text(s.name, px + pipeW / 2, y + 18, { align: 'center' })
    })
    y += 26

    // ── Seção: Contratos do Mês ──
    if (contratosMesAtual.length > 0) {
      doc.setTextColor(...NAVY)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Contratos do Período', MARGIN, y)
      doc.setDrawColor(...AMBER)
      doc.line(MARGIN, y + 1.5, MARGIN + 52, y + 1.5)
      y += 6

      // Cabeçalho da tabela
      doc.setFillColor(...NAVY)
      doc.rect(MARGIN, y, COL_W, 7, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.text('Nº',         MARGIN + 2,   y + 4.5)
      doc.text('Cliente',    MARGIN + 14,  y + 4.5)
      doc.text('Produto',    MARGIN + 72,  y + 4.5)
      doc.text('Status',     MARGIN + 118, y + 4.5)
      doc.text('Valor',      MARGIN + 148, y + 4.5)
      doc.text('Comissão',   PAGE_W - MARGIN - 2, y + 4.5, { align: 'right' })
      y += 7

      const slicedContratos = contratosMesAtual.slice(0, 10)
      slicedContratos.forEach((c, idx) => {
        const rowColor = idx % 2 === 0 ? [...WHITE] as [number,number,number] : [...LIGHT] as [number,number,number]
        doc.setFillColor(...rowColor)
        doc.rect(MARGIN, y, COL_W, 7, 'F')

        const statusColors: Record<string, [number,number,number]> = {
          'Concluído': GREEN, 'Aprovado': [59,130,246], 'Pendente': AMBER,
          'Em Instalação': [139,92,246], 'Cancelado': RED
        }
        const sColor = statusColors[c.status] ?? GRAY

        doc.setTextColor(...NAVY)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'normal')
        doc.text(c.id.replace('CT-', '#'),                                                                MARGIN + 2,   y + 4.5)
        doc.text(c.cliente.length > 24 ? c.cliente.slice(0, 23) + '…' : c.cliente,                    MARGIN + 14,  y + 4.5)
        doc.text(c.produto.length > 22 ? c.produto.slice(0, 21) + '…' : c.produto,                    MARGIN + 72,  y + 4.5)
        doc.setTextColor(...sColor)
        doc.setFont('helvetica', 'bold')
        doc.text(c.status,                                                                                MARGIN + 118, y + 4.5)
        doc.setTextColor(...NAVY)
        doc.setFont('helvetica', 'normal')
        doc.text(`R$ ${Number(c.valorTotal).toLocaleString('pt-BR')}`,                                   MARGIN + 148, y + 4.5)
        doc.setTextColor(...[16, 185, 129] as [number,number,number])
        doc.setFont('helvetica', 'bold')
        doc.text(`R$ ${Number(c.comissao).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`,       PAGE_W - MARGIN - 2, y + 4.5, { align: 'right' })
        y += 7
      })

      if (contratosMesAtual.length > 10) {
        doc.setTextColor(...GRAY)
        doc.setFontSize(7)
        doc.text(`… e mais ${contratosMesAtual.length - 10} contratos no período.`, MARGIN, y + 4)
        y += 8
      }
    }

    // ── Rodapé ──
    const footerY = 285
    doc.setDrawColor(220, 230, 240)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, footerY, PAGE_W - MARGIN, footerY)
    doc.setTextColor(...GRAY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('SolarIguatu — Documento gerado automaticamente pelo sistema de gestão de vendas.', MARGIN, footerY + 5)
    doc.text(`Página 1/1`, PAGE_W - MARGIN, footerY + 5, { align: 'right' })

    const fileName = `relatorio-${monthString.toLowerCase().replace(' ', '-')}-${user?.name?.split(' ')[0]?.toLowerCase() ?? 'vendedor'}.pdf`
    doc.save(fileName)
  }

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
            Seu desempenho em {monthString}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Seletor de Mês */}
          <input
            type="month"
            value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-')
                setSelectedDate(new Date(Number(y), Number(m) - 1, 1))
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '99px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-foreground)',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Selecionar Mês"
          />

          {/* Botão PDF */}
          <button
            onClick={generatePDF}
            title={`Gerar relatório de ${monthString}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '99px',
              background: 'linear-gradient(135deg, #E8901A, #D07D10)',
              border: 'none',
              fontSize: '0.78rem', fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(232,144,26,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Download size={13} />
            Relatório PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards: 4 col desktop / 2 col mobile ── */}
      {isLoading ? (
        <div className="kpi-grid">
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: '12px', width: '50%', borderRadius: '5px' }} />
                <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
              </div>
              <div className="skeleton" style={{ height: '28px', width: '60%', borderRadius: '6px' }} />
              <div className="skeleton" style={{ height: '10px', width: '80%', borderRadius: '5px' }} />
            </div>
          ))}
        </div>
      ) : (
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
            value={`${metricas.kwpInstalados.toFixed(1)} kWp`}
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
      )}

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
              Progresso das Metas — {shortMonthString}
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
                kWp vendido · {metricas.kwpInstalados.toFixed(1)} kWp
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
            sub={`Janeiro – Dezembro ${currentYear}`}
            badge={String(currentYear)}
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
          <ChartHeader
            title="Contratos por Mês"
            sub={`Clique numa barra para ver os contratos do mês`}
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={vendasMensais}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              barSize={14}
              style={{ cursor: 'pointer' }}
              onClick={(payload) => {
                if (payload?.activeTooltipIndex !== undefined) {
                  setDrawerMesIdx(payload.activeTooltipIndex)
                  setDrawerSearch('')
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(232,144,26,0.07)', radius: 6 }} />
              <Bar
                dataKey="contratos"
                name="Contratos"
                radius={[5, 5, 0, 0]}
                opacity={0.90}
                fill="#E8901A"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Gaveta Lateral ── */}
      {drawerMesIdx !== null && (
        <>
          {/* Overlay */}
          <div
            onClick={() => { setDrawerMesIdx(null); setDrawerSearch('') }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,26,48,0.45)',
              backdropFilter: 'blur(3px)',
              zIndex: 900,
              animation: 'fadeInOverlay 0.25s ease',
            }}
          />

          {/* Painel */}
          <div style={{
            position: 'fixed', top: 0, right: 0,
            width: 'clamp(300px, 90vw, 480px)',
            height: '100dvh',
            background: 'var(--color-surface)',
            borderLeft: '1px solid var(--color-border)',
            boxShadow: '-8px 0 40px rgba(10,26,48,0.18)',
            zIndex: 901,
            display: 'flex', flexDirection: 'column',
            animation: 'slideInDrawer 0.3s cubic-bezier(0.16,1,0.3,1)',
            overflow: 'hidden',
          }}>

            {/* Header do Drawer */}
            <div style={{
              padding: '20px 20px 0',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <p style={{
                    fontSize: '0.95rem', fontWeight: 800, margin: '0 0 2px',
                    fontFamily: 'var(--font-display)', color: 'var(--color-foreground)',
                    letterSpacing: '-0.02em',
                  }}>
                    {drawerMesNome.charAt(0).toUpperCase() + drawerMesNome.slice(1)} de {currentYear}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                    {contratosFiltrados.length} contrato{contratosFiltrados.length !== 1 ? 's' : ''} em {drawerMesNome}
                  </p>
                </div>
                <button
                  onClick={() => { setDrawerMesIdx(null); setDrawerSearch('') }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', color: 'var(--color-muted)',
                    lineHeight: 1, flexShrink: 0,
                  }}
                  aria-label="Fechar"
                >&#x2715;</button>
              </div>

              {/* Barra de Busca */}
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)', display: 'flex', alignItems: 'center',
                  pointerEvents: 'none',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar por cliente, ID ou status..."
                  value={drawerSearch}
                  onChange={e => setDrawerSearch(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 34px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-foreground)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Lista de contratos */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px' }}>
              {contratosFiltrados.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  height: '180px', gap: '8px',
                }}>
                  <span style={{ fontSize: '2rem' }}>🔍</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>Nenhum contrato encontrado</p>
                </div>
              ) : (
                contratosFiltrados.map((c, idx) => {
                  const statusColorMap: Record<string, { bg: string; color: string }> = {
                    'Concluído':      { bg: 'var(--color-success-bg)',    color: 'var(--color-success)' },
                    'Aprovado':       { bg: 'rgba(59,130,246,0.1)',       color: '#3B82F6' },
                    'Pendente':       { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
                    'Em Instalação': { bg: 'rgba(139,92,246,0.1)',      color: '#8B5CF6' },
                    'Cancelado':      { bg: 'rgba(239,68,68,0.1)',        color: '#EF4444' },
                  }
                  const sc = statusColorMap[c.status] ?? { bg: 'var(--color-surface-2)', color: 'var(--color-muted)' }
                  const mes = new Date(c.dataCriacao).toLocaleString('pt-BR', { month: 'short', year: '2-digit' })

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        marginBottom: idx === contratosFiltrados.length - 1 ? 0 : '8px',
                        background: 'var(--color-surface)',
                        transition: 'box-shadow 0.15s',
                        animation: `fadeInItem 0.25s ease ${Math.min(idx, 8) * 30}ms both`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(10,26,48,0.10)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700,
                              color: 'var(--color-muted)',
                              fontFamily: 'var(--font-display)',
                            }}>{c.id}</span>
                            <span style={{
                              fontSize: '0.68rem', color: 'var(--color-muted)',
                            }}>· {mes}</span>
                          </div>
                          <p style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            color: 'var(--color-foreground)',
                            margin: '3px 0 2px',
                            fontFamily: 'var(--font-display)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{c.cliente}</p>
                          <p style={{
                            fontSize: '0.72rem', color: 'var(--color-muted)',
                            margin: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{c.produto}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '99px',
                            background: sc.bg, color: sc.color,
                          }}>{c.status}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
                            R$ {Number(c.valorTotal).toLocaleString('pt-BR')}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>
                            +R$ {Number(c.comissao).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 0 0 4px rgba(22,163,74,0.35); }
        }
        @keyframes slideInDrawer {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInItem {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
