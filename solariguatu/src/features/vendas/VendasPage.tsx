import { useState } from 'react'
import {
  Plus, Search, Filter, FileText,
  ChevronLeft, ChevronRight, Zap, DollarSign,
} from 'lucide-react'
import { useVendas } from '../../hooks/useVendas'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import NovoContratoModal from './NovoContratoModal'
import type { ContratoStatus } from './mockVendas'
import { STATUS_OPTIONS } from './mockVendas'

const STATUS_STYLE: Record<ContratoStatus, { badge: string; dot: string }> = {
  Aprovado:       { badge: 'badge badge-success',  dot: 'oklch(0.72 0.17 145)' },
  Pendente:       { badge: 'badge badge-warning',  dot: 'oklch(0.82 0.15 80)'  },
  Cancelado:      { badge: 'badge badge-danger',   dot: 'oklch(0.65 0.22 25)'  },
  'Em Instalação':{ badge: 'badge badge-info',     dot: 'oklch(0.72 0.15 220)' },
  Concluído:      { badge: 'badge badge-muted',    dot: 'oklch(0.55 0.15 180)' },
}

const fmt = (v: number) =>
  v >= 100_000
    ? `R$ ${(v / 1000).toFixed(0)}k`
    : `R$ ${v.toLocaleString('pt-BR')}`

type AllStatus = ContratoStatus | 'Todos'

export default function VendasPage() {
  const {
    itensPagina, filtrados, busca, setBusca,
    filtroStatus, setFiltroStatus, pagina, setPagina,
    totalPaginas, adicionarContrato, total,
  } = useVendas()

  const [modalOpen, setModalOpen] = useState(false)

  const filterOptions: AllStatus[] = ['Todos', ...STATUS_OPTIONS]

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Contratos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {total} contrato{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={15} />}
          onClick={() => setModalOpen(true)}
          style={{ boxShadow: '0 4px 20px var(--color-primary-glow)' }}
        >
          Novo Contrato
        </Button>
      </div>

      {/* ── Sumário rápido ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',         value: total,                          icon: <FileText  size={13}/>, color: 'var(--color-foreground)' },
          { label: 'Aprovados',     value: filtrados.filter(c=>c.status==='Aprovado').length,       icon: <Filter    size={13}/>, color: 'var(--color-success)' },
          { label: 'KWp filtrado',  value: `${filtrados.reduce((s,c)=>s+c.kwp,0).toFixed(1)} kWp`,  icon: <Zap       size={13}/>, color: 'var(--color-primary)' },
          { label: 'Valor filtrado',value: fmt(filtrados.reduce((s,c)=>s+c.valorTotal,0)),           icon: <DollarSign size={13}/>,color: 'var(--color-info)' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-52 max-w-sm">
          <Input
            placeholder="Buscar por cliente ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                background: filtroStatus === s ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: filtroStatus === s ? '#0a0a0a' : 'var(--color-muted)',
                border: `1px solid ${filtroStatus === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                boxShadow: filtroStatus === s ? '0 2px 12px var(--color-primary-glow)' : 'none',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'oklch(0.16 0.025 250 / 0.6)' }}>
                {['Código','Cliente','Cidade','Vendedor','kWp','Valor','Financ.','Status','Data'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="stagger">
              {itensPagina.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
                    Nenhum contrato encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensPagina.map((c, i) => (
                  <tr
                    key={c.id}
                    className="animate-slideUp transition-colors hover:bg-white/3"
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      animationDelay: `${i * 40}ms`,
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {c.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-44">
                      <p className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{c.cliente}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{c.cpfCnpj}</p>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>{c.cidade}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-foreground)' }}>{c.vendedor}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {c.kwp} kWp
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {fmt(c.valorTotal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="badge badge-muted">{c.financiamento}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={STATUS_STYLE[c.status].badge}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_STYLE[c.status].dot }} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                      {new Date(c.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPaginas > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Página {pagina} de {totalPaginas}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-muted)' }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: n === pagina ? 'var(--color-primary)' : 'var(--color-surface-2)',
                    color: n === pagina ? '#0a0a0a' : 'var(--color-muted)',
                    border: `1px solid ${n === pagina ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-muted)' }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <NovoContratoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={adicionarContrato}
      />
    </div>
  )
}
