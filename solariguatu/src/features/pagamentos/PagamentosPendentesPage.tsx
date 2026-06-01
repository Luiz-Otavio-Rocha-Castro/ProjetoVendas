import { useState } from 'react'
import {
  AlertCircle, DollarSign, Users, Package,
  Search, CreditCard, Calendar, TrendingDown,
  ChevronRight,
} from 'lucide-react'
import { useVendas } from '../../hooks/useVendas'
import Input from '../../components/ui/Input'
import ContratoSheet from '../vendas/ContratoSheet'
import type { Contrato } from '../vendas/mockVendas'

const fmtFull = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

// Calcula o percentual pago
function pctPago(valorTotal: number, saldoDevedor: number): number {
  if (valorTotal <= 0) return 0
  const pago = valorTotal - saldoDevedor
  return Math.min(100, Math.max(0, Math.round((pago / valorTotal) * 100)))
}

function ClientePendenteCard({
  contrato,
  onClick,
}: {
  contrato: Contrato
  onClick: () => void
}) {
  const pct = pctPago(contrato.valorTotal, contrato.saldoDevedor)
  const valorPago = contrato.valorTotal - contrato.saldoDevedor

  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl p-5 cursor-pointer hover-lift transition-all"
      style={{
        border: '1px solid oklch(0.82 0.15 80 / 0.30)',
        boxShadow: '0 0 20px oklch(0.82 0.15 80 / 0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge badge-warning"
              style={{ fontSize: '0.65rem' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.82 0.15 80)' }} />
              Pag. Pendente
            </span>
          </div>
          <h3
            className="text-sm font-bold truncate"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            {contrato.cliente}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{contrato.cpfCnpj}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Contrato</p>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--color-primary)' }}>
            {contrato.id}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={11} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Produto</span>
          </div>
          <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--color-foreground)' }}>
            {contrato.produto}
          </p>
        </div>
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard size={11} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Financiamento</span>
          </div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {contrato.financiamento}
          </p>
        </div>
      </div>

      {/* Valores */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Valor Total</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
            {fmtFull(contrato.valorTotal)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Já pago</p>
          <p className="text-sm font-bold" style={{ color: 'oklch(0.72 0.17 145)', fontFamily: 'var(--font-display)' }}>
            {fmtFull(valorPago)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'oklch(0.82 0.15 80)' }}>Saldo Devedor</p>
          <p
            className="text-base font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.82 0.15 80)' }}
          >
            {fmtFull(contrato.saldoDevedor)}
          </p>
        </div>
      </div>

      {/* Barra de progresso do pagamento */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: 'var(--color-muted)' }}>Progresso do pagamento</span>
          <span style={{ color: pct >= 50 ? 'oklch(0.72 0.17 145)' : 'oklch(0.82 0.15 80)', fontWeight: 700 }}>
            {pct}% pago
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct >= 50
                ? 'linear-gradient(90deg, oklch(0.72 0.17 145), oklch(0.78 0.18 65))'
                : 'linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.82 0.15 80))',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: 'var(--color-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Desde {fmtDate(contrato.dataCriacao)}
          </span>
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          Ver detalhes <ChevronRight size={12} />
        </div>
      </div>
    </div>
  )
}

export default function PagamentosPendentesPage() {
  const { contratosPendentes, totalSaldoDevedor } = useVendas()
  const [busca, setBusca] = useState('')
  const [sheetContrato, setSheetContrato] = useState<Contrato | null>(null)

  const filtrados = contratosPendentes.filter((c) =>
    busca === '' ||
    c.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    c.id.toLowerCase().includes(busca.toLowerCase()) ||
    c.produto.toLowerCase().includes(busca.toLowerCase())
  )

  const totalValorContratos = contratosPendentes.reduce((s, c) => s + c.valorTotal, 0)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Pagamentos Pendentes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Clientes com saldo devedor em aberto
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'oklch(0.82 0.15 80 / 0.10)', color: 'oklch(0.82 0.15 80)', border: '1px solid oklch(0.82 0.15 80 / 0.25)' }}
        >
          <AlertCircle size={13} />
          {contratosPendentes.length} cliente{contratosPendentes.length !== 1 ? 's' : ''} pendente{contratosPendentes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Cards de Métricas ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card principal: Total Pendente no Caixa */}
        <div
          className="sm:col-span-1 lg:col-span-1 glass rounded-2xl p-5 relative overflow-hidden"
          style={{
            border: '1px solid oklch(0.82 0.15 80 / 0.40)',
            boxShadow: '0 0 28px oklch(0.82 0.15 80 / 0.15)',
          }}
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.15 80), transparent)' }}
          />
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(0.82 0.15 80 / 0.15)', border: '1px solid oklch(0.82 0.15 80 / 0.30)' }}
            >
              <TrendingDown size={18} style={{ color: 'oklch(0.82 0.15 80)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total Pendente no Caixa</p>
              <p
                className="text-2xl font-extrabold mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.82 0.15 80)' }}
              >
                {fmtFull(totalSaldoDevedor)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Soma de todos os saldos devedores
              </p>
            </div>
          </div>
        </div>

        {/* Card: Valor Total dos Contratos Pendentes */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-glow)' }}
          >
            <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Valor Total dos Contratos</p>
            <p
              className="text-lg font-extrabold mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
            >
              {fmtFull(totalValorContratos)}
            </p>
          </div>
        </div>

        {/* Card: Clientes Pendentes */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'oklch(0.72 0.15 220 / 0.12)', border: '1px solid oklch(0.72 0.15 220 / 0.25)' }}
          >
            <Users size={18} style={{ color: 'oklch(0.72 0.15 220)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Clientes Pendentes</p>
            <p
              className="text-3xl font-extrabold mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.72 0.15 220)' }}
            >
              {contratosPendentes.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Busca ── */}
      <div className="glass rounded-2xl p-4">
        <div className="max-w-sm">
          <Input
            placeholder="Buscar por cliente, código ou produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
      </div>

      {/* ── Lista de Clientes Pendentes ── */}
      {filtrados.length === 0 ? (
        <div
          className="glass rounded-2xl p-16 flex flex-col items-center gap-3 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <AlertCircle size={24} style={{ color: 'var(--color-muted)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {busca ? 'Nenhum resultado encontrado' : 'Nenhum pagamento pendente'}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {busca ? 'Tente buscar por outro termo.' : 'Todos os clientes estão em dia! 🎉'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((c, i) => (
            <div key={c.id} className="animate-slideUp" style={{ animationDelay: `${i * 60}ms` }}>
              <ClientePendenteCard
                contrato={c}
                onClick={() => setSheetContrato(c)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Gaveta Lateral de Detalhes ── */}
      {sheetContrato && (
        <ContratoSheet
          contrato={sheetContrato}
          onClose={() => setSheetContrato(null)}
        />
      )}
    </div>
  )
}
