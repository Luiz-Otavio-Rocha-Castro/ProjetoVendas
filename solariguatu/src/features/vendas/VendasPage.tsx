import { useEffect, useState } from 'react'
import {
  Plus, Search, FileText,
  ChevronLeft, ChevronRight, DollarSign,
  TrendingUp, CheckCircle2, Edit2, Trash2,
} from 'lucide-react'
import { useVendas } from '../../hooks/useVendas'
import Button from '../../components/ui/Button'
import NovoContratoModal from './NovoContratoModal'
import ContratoSheet from './ContratoSheet'
import type { Contrato, ContratoStatus } from './mockVendas'
import { STATUS_OPTIONS } from './mockVendas'
import { api } from '../../services/api';

const STATUS_STYLE: Record<ContratoStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  Aprovado:        { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',               dot: '#16A34A', label: 'Aprovado' },
  Pendente:        { color: '#CA8A04', bg: '#FEFCE8', border: 'rgba(202,138,4,0.30)',  dot: '#CA8A04', label: 'Pag. Pendente' },
  Cancelado:       { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',               dot: '#DC2626', label: 'Cancelado' },
  'Em Instalação': { color: '#2563EB', bg: '#EFF6FF', border: 'rgba(37,99,235,0.25)', dot: '#2563EB', label: 'Em Instalação' },
  Concluído:       { color: '#0F766E', bg: '#F0FDFA', border: 'rgba(15,118,110,0.25)',dot: '#0F766E', label: 'Concluído' },
}

const fmt = (v: number) =>
  v >= 100_000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v.toLocaleString('pt-BR')}`

const fmtFull = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type AllStatus = ContratoStatus | 'Todos'

const cardBase: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(15,25,41,0.06)',
}

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

  const totalAprovados = contratos.filter((c) => c.status === 'Aprovado').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
            color: 'var(--color-foreground)',
          }}>
            Contratos
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>
            {total} contrato{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={15} />}
          onClick={() => { setEditContrato(null); setModalOpen(true) }}
        >
          Novo Contrato
        </Button>
      </div>

      {/* ── Cards de indicadores ── */}
      <div className="vendas-cards-grid">

        {/* Valor Total */}
        <div style={{
          ...cardBase,
          gridColumn: 'var(--card-wide-span)',
          padding: '18px',
          borderColor: 'var(--color-primary-border)',
          boxShadow: '0 4px 16px var(--color-primary-glow)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #E8901A, #F5A93A)',
            borderRadius: '12px 12px 0 0',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DollarSign size={17} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 3px' }}>Valor Total de Vendas</p>
              <p style={{
                fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1,
                fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
                color: 'var(--color-primary)',
              }}>
                {fmtFull(totalVendas)}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '3px 0 0' }}>
                {contratos.length} contratos ao total
              </p>
            </div>
          </div>
        </div>

        {/* Comissão */}
        <div style={{
          ...cardBase,
          gridColumn: 'var(--card-wide-span)',
          padding: '18px',
          borderColor: 'var(--color-success-border)',
          boxShadow: '0 4px 16px rgba(22,163,74,0.10)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #16A34A, #4ADE80)',
            borderRadius: '12px 12px 0 0',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={17} color="var(--color-success)" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 3px' }}>Comissão Total</p>
              <p style={{
                fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1,
                fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
                color: 'var(--color-success)',
              }}>
                {fmtFull(totalComissao)}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '3px 0 0' }}>
                Comissões por venda
              </p>
            </div>
          </div>
        </div>

        {/* Mini-cards */}
        {[
          { icon: <FileText size={14} />, label: 'Total', value: contratos.length, color: 'var(--color-foreground)' },
          { icon: <CheckCircle2 size={14} />, label: 'Aprovados', value: totalAprovados, color: 'var(--color-success)' },
        ].map((item, i) => (
          <div key={i} style={{
            ...cardBase, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ color: item.color }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: item.color, fontFamily: 'var(--font-display)' }}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ ...cardBase, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '340px', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted-light)', pointerEvents: 'none', display: 'flex', alignItems: 'center',
          }}>
            <Search size={14} />
          </span>
          <input
            className="input-base"
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar por cliente, código ou produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {filterOptions.map((s) => {
            const active = filtroStatus === s
            return (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                style={{
                  padding: '6px 12px', borderRadius: '8px',
                  fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s === 'Pendente' ? 'Pag. Pendente' : s}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ ...cardBase, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'var(--font-body)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-background)',
              }}>
                {['Código', 'Cliente', 'Cidade', 'Produto', 'Valor', 'Comissão', 'Pagamento', 'Status', 'Data', 'Ações'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '12px 14px',
                      fontSize: '0.68rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: 'var(--color-muted)', whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itensPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: 'center', padding: '48px', color: 'var(--color-muted)', fontSize: '0.875rem' }}
                  >
                    Nenhum contrato encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensPagina.map((c, i) => {
                  const ss = STATUS_STYLE[c.status]
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSheetContrato(c)}
                      className="animate-slideUp"
                      style={{
                        borderBottom: '1px solid var(--color-border-soft)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        animationDelay: `${i * 35}ms`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-background)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {c.id}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', maxWidth: '140px' }}>
                        <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, color: 'var(--color-foreground)' }}>
                          {c.cliente}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.cpfCnpj}
                        </p>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                        {c.cidade}
                      </td>
                      <td style={{ padding: '11px 14px', maxWidth: '160px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-foreground-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {c.produto}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--color-foreground)' }}>
                        {fmt(c.valorTotal)}
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--color-success)' }}>
                        {fmt(c.comissao)}
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 600,
                          padding: '3px 9px', borderRadius: '99px',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-foreground-2)',
                        }}>
                          {c.financiamento}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '0.72rem', fontWeight: 600,
                          padding: '3px 9px', borderRadius: '99px',
                          background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                          {ss.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: 'var(--color-muted)', fontSize: '0.78rem' }}>
                        {new Date(c.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleEditar(c, e)}
                            title="Editar contrato"
                            style={{
                              padding: '6px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                              background: 'transparent', color: 'var(--color-muted)',
                              transition: 'all 0.15s ease', display: 'flex', alignItems: 'center',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-light)'
                              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleRemover(c.id, e)}
                            title="Remover contrato"
                            style={{
                              padding: '6px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                              background: 'transparent', color: 'var(--color-muted)',
                              transition: 'all 0.15s ease', display: 'flex', alignItems: 'center',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-danger-bg)'
                              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)'
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid var(--color-border)',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0 }}>
              Página {pagina} de {totalPaginas}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                style={{
                  padding: '6px', borderRadius: '7px', border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-muted)',
                  cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagina === 1 ? 0.35 : 1, display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    fontSize: '0.78rem', fontWeight: 600,
                    border: n === pagina ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: n === pagina ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    color: n === pagina ? 'var(--color-primary)' : 'var(--color-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={{
                  padding: '6px', borderRadius: '7px', border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-muted)',
                  cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                  opacity: pagina === totalPaginas ? 0.35 : 1, display: 'flex', alignItems: 'center',
                }}
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
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,25,41,0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '14px', padding: '24px',
              width: '100%', maxWidth: '380px', margin: '0 16px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 60px rgba(15,25,41,0.20)',
            }}
            className="animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Trash2 size={18} color="var(--color-danger)" />
            </div>
            <h3 style={{
              fontSize: '1rem', fontWeight: 700, margin: '0 0 6px',
              color: 'var(--color-foreground)', fontFamily: 'var(--font-display)',
            }}>
              Remover Contrato
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0 0 20px' }}>
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={confirmarRemocao}
                style={{
                  background: 'var(--color-danger)',
                  boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
                }}
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
