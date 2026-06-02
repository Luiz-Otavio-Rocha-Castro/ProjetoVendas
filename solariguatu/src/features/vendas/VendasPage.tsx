import { useEffect, useState } from 'react'
import {
  Plus, Search, FileText,
  ChevronLeft, ChevronRight, DollarSign,
  TrendingUp, CheckCircle2, Edit2, Trash2,
} from 'lucide-react'
import { useVendas } from '../../hooks/useVendas'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import NovoContratoModal from './NovoContratoModal'
import ContratoSheet from './ContratoSheet'
import type { Contrato, ContratoStatus } from './mockVendas'
import { STATUS_OPTIONS } from './mockVendas'
// Importando usando os pontinhos que você usa no projeto
import { api } from '../../services/api';





const STATUS_STYLE: Record<ContratoStatus, { badge: string; dot: string; label: string }> = {
  Aprovado:        { badge: 'badge badge-success', dot: 'oklch(0.72 0.17 145)', label: 'Aprovado' },
  Pendente:        { badge: 'badge badge-warning', dot: 'oklch(0.82 0.15 80)',  label: 'Pag. Pendente' },
  Cancelado:       { badge: 'badge badge-danger',  dot: 'oklch(0.65 0.22 25)',  label: 'Cancelado' },
  'Em Instalação': { badge: 'badge badge-info',    dot: 'oklch(0.72 0.15 220)', label: 'Em Instalação' },
  Concluído:       { badge: 'badge badge-muted',   dot: 'oklch(0.55 0.15 180)', label: 'Concluído' },
}

const fmt = (v: number) =>
  v >= 100_000
    ? `R$ ${(v / 1000).toFixed(0)}k`
    : `R$ ${v.toLocaleString('pt-BR')}`

const fmtFull = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type AllStatus = ContratoStatus | 'Todos'

export default function VendasPage() {
  const {
    itensPagina, filtrados, busca, setBusca,
    filtroStatus, setFiltroStatus, pagina, setPagina,
    totalPaginas, adicionarContrato, removerContrato, editarContrato,
    total, totalVendas, totalComissao,
    contratos,
  } = useVendas()

  const [modalOpen, setModalOpen] = useState(false)
  const [editContrato, setEditContrato] = useState<Contrato | null>(null)
  const [sheetContrato, setSheetContrato] = useState<Contrato | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filterOptions: AllStatus[] = ['Todos', ...STATUS_OPTIONS]

  const handleEditar = (c: Contrato, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditContrato(c)
    setModalOpen(true)
  }

  const handleRemover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(id)
  }

  const confirmarRemocao = () => {
    if (confirmDelete) {
      removerContrato(confirmDelete)
      if (sheetContrato?.id === confirmDelete) setSheetContrato(null)
    }
    setConfirmDelete(null)
  }

  const handleSave = (dados: Omit<Contrato, 'id' | 'dataCriacao'>) => {
    if (editContrato) {
      editarContrato(editContrato.id, dados)
    } else {
      adicionarContrato(dados)
    }
    setEditContrato(null)
    setModalOpen(false)
  }

  const handleModalClose = () => {
    setEditContrato(null)
    setModalOpen(false)
  }

  // Aprovados do conjunto completo
  const totalAprovados = contratos.filter((c) => c.status === 'Aprovado').length

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
          onClick={() => { setEditContrato(null); setModalOpen(true) }}
          style={{ boxShadow: '0 4px 20px var(--color-primary-glow)' }}
        >
          Novo Contrato
        </Button>
      </div>

      {/* ── Cards de indicadores ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card principal: Valor Total */}
        <div
          className="sm:col-span-2 lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden"
          style={{ border: '1px solid var(--color-primary-glow)', boxShadow: '0 0 24px var(--color-primary-glow)' }}
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-glow)' }}
            >
              <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Valor Total de Vendas</p>
              <p
                className="text-2xl font-extrabold mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
              >
                {fmtFull(totalVendas)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Soma de todos os {contratos.length} contratos
              </p>
            </div>
          </div>
        </div>

        {/* Card principal: Comissão */}
        <div
          className="sm:col-span-2 lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden"
          style={{ border: '1px solid oklch(0.72 0.17 145 / 0.30)', boxShadow: '0 0 20px oklch(0.72 0.17 145 / 0.10)' }}
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.72 0.17 145), transparent)' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(0.72 0.17 145 / 0.12)', border: '1px solid oklch(0.72 0.17 145 / 0.30)' }}
            >
              <TrendingUp size={18} style={{ color: 'oklch(0.72 0.17 145)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Comissão Total do Vendedor</p>
              <p
                className="text-2xl font-extrabold mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.72 0.17 145)' }}
              >
                {fmtFull(totalComissao)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Soma das comissões por venda
              </p>
            </div>
          </div>
        </div>

        {/* Mini-card: Total de contratos */}
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
          <span style={{ color: 'var(--color-foreground)' }}><FileText size={14} /></span>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
              {contratos.length}
            </p>
          </div>
        </div>

        {/* Mini-card: Aprovados */}
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
          <span style={{ color: 'var(--color-success)' }}><CheckCircle2 size={14} /></span>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aprovados</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)' }}>
              {totalAprovados}
            </p>
          </div>
        </div>

        {/* Mini-card: Valor filtrado */}
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
          <span style={{ color: 'var(--color-info)' }}><DollarSign size={14} /></span>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Filtrado</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-info)', fontFamily: 'var(--font-display)' }}>
              {fmt(filtrados.reduce((s, c) => s + c.valorTotal, 0))}
            </p>
          </div>
        </div>

        {/* Mini-card: Comissão filtrada */}
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
          <span style={{ color: 'oklch(0.72 0.17 145)' }}><TrendingUp size={14} /></span>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Comissão</p>
            <p className="text-sm font-bold" style={{ color: 'oklch(0.72 0.17 145)', fontFamily: 'var(--font-display)' }}>
              {fmt(filtrados.reduce((s, c) => s + c.comissao, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-52 max-w-sm">
          <Input
            placeholder="Buscar por cliente, código ou produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
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
              {s === 'Pendente' ? 'Pag. Pendente' : s}
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
                {['Código', 'Cliente', 'Cidade', 'Produto', 'Valor', 'Comissão', 'Pagamento', 'Status', 'Data', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="stagger">
              {itensPagina.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
                    Nenhum contrato encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensPagina.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSheetContrato(c)}
                    className="animate-slideUp transition-colors hover:bg-white/5 cursor-pointer"
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
                    <td className="px-4 py-3 max-w-36">
                      <p className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{c.cliente}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{c.cpfCnpj}</p>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>{c.cidade}</td>
                    <td className="px-4 py-3 max-w-40">
                      <span className="text-xs" style={{ color: 'var(--color-foreground)' }}>{c.produto}</span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {fmt(c.valorTotal)}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-semibold" style={{ color: 'oklch(0.72 0.17 145)' }}>
                      {fmt(c.comissao)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="badge badge-muted">{c.financiamento}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={STATUS_STYLE[c.status].badge}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_STYLE[c.status].dot }} />
                        {STATUS_STYLE[c.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                      {new Date(c.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEditar(c, e)}
                          className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                          style={{ color: 'var(--color-muted)' }}
                          title="Editar contrato"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => handleRemover(c.id, e)}
                          className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                          style={{ color: 'var(--color-muted)' }}
                          title="Remover contrato"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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

      {/* ── Modal Novo/Editar Contrato ── */}
      <NovoContratoModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        initialData={editContrato ?? undefined}
        editId={editContrato?.id}
      />

      {/* ── Gaveta Lateral de Detalhes ── */}
      {sheetContrato && (
        <ContratoSheet
          contrato={sheetContrato}
          onClose={() => setSheetContrato(null)}
        />
      )}

      {/* ── Modal de confirmação de remoção ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'oklch(0 0 0 / 0.60)', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="glass-strong rounded-2xl p-6 w-full max-w-sm mx-4 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
              Remover Contrato
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
              Tem certeza que deseja remover este contrato? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="md" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={confirmarRemocao}
                style={{ background: 'var(--color-danger)', boxShadow: '0 4px 16px oklch(0.65 0.22 25 / 0.30)' }}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
