import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Plus, Trash2, CheckCircle2, Clock, XCircle,
  FileText, Calendar, ChevronDown, ChevronUp,
  AlertCircle, ShoppingBag, UserCheck,
} from 'lucide-react'
import { useVisitas } from '../../hooks/useVisitas'
import { useToast } from '../../contexts/ToastContext'
import type { VisitaResponse, VisitaRequest } from '../../services/visitas/visitasService'
import type { ClienteSimples } from '../../services/documentos/documentosService'

type Status = 'Agendada' | 'Realizada' | 'Cancelada'

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  Agendada: { label: 'Agendadas', icon: <Clock size={14} />, color: 'oklch(0.78 0.15 80)', bg: 'oklch(0.78 0.15 80 / 0.10)', border: 'oklch(0.78 0.15 80 / 0.25)' },
  Realizada: { label: 'Realizadas', icon: <CheckCircle2 size={14} />, color: 'oklch(0.72 0.17 145)', bg: 'oklch(0.72 0.17 145 / 0.10)', border: 'oklch(0.72 0.17 145 / 0.25)' },
  Cancelada: { label: 'Canceladas', icon: <XCircle size={14} />, color: 'oklch(0.65 0.22 25)', bg: 'oklch(0.65 0.22 25 / 0.10)', border: 'oklch(0.65 0.22 25 / 0.25)' },
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function abrirGoogleMaps(endereco: string) {
  const q = encodeURIComponent(endereco)
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
}

/* ── Modal de Nova/Editar Visita ── */
interface ModalProps {
  visita?: VisitaResponse
  clientes: ClienteSimples[]
  onClose: () => void
  onSave: (data: VisitaRequest) => Promise<boolean>
}

function VisitaModal({ visita, clientes, onClose, onSave }: ModalProps) {
  const isEdit = Boolean(visita)
  const [form, setForm] = useState<VisitaRequest>({
    nomeProspecto: visita?.nomeProspecto ?? '',
    endereco: visita?.endereco ?? '',
    dataVisita: visita?.dataVisita ?? new Date().toISOString().split('T')[0],
    horaVisita: visita?.horaVisita ?? '',
    cpfCnpj: visita?.cpfCnpj ?? '',
    anotacoes: visita?.anotacoes ?? '',
    status: visita?.status ?? 'Agendada',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof VisitaRequest, string>>>({})
  const [clienteSelecionado, setClienteSelecionado] = useState<string>(visita?.cpfCnpj ?? '')

  const set = (key: keyof VisitaRequest, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.nomeProspecto.trim()) e.nomeProspecto = 'Nome obrigatório'
    if (!form.endereco.trim()) e.endereco = 'Endereço obrigatório'
    if (!form.dataVisita) e.dataVisita = 'Data obrigatória'
    if (!form.horaVisita) e.horaVisita = 'Horário obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const ok = await onSave(form)
    setSaving(false)
    if (ok) onClose()
  }

  const handleClienteSelect = (cpf: string) => {
    setClienteSelecionado(cpf)
    if (!cpf) return
    const found = clientes.find((c) => c.cpf === cpf)
    if (found) {
      setForm((f) => ({
        ...f,
        nomeProspecto: found.nome,
        cpfCnpj: found.cpf,
      }))
      setErrors((e) => ({ ...e, nomeProspecto: undefined }))
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    display: 'block', marginBottom: '6px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '9px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background)', color: 'var(--color-foreground)',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,25,41,0.55)', backdropFilter: 'blur(5px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)', borderRadius: '16px',
          padding: '24px', width: '100%', maxWidth: '440px',
          maxHeight: '90dvh', overflowY: 'auto',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px rgba(15,25,41,0.25)',
        }}
        className="animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{
          fontSize: '1rem', fontWeight: 700, margin: '0 0 20px',
          fontFamily: 'var(--font-display)', color: 'var(--color-foreground)',
        }}>
          {isEdit ? 'Editar Visita' : 'Nova Visita'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Vincular Cliente */}
          <div style={{
            background: 'var(--color-primary-light)', padding: '12px 14px',
            borderRadius: '10px', border: '1px solid var(--color-primary-border)',
            display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} color="var(--color-primary)" />
              <label style={{ ...labelStyle, marginBottom: 0, color: 'var(--color-primary)' }}>
                Vincular a cliente existente (Opcional)
              </label>
            </div>
            <select
              style={{ ...inputStyle, borderColor: 'var(--color-primary-border)', background: 'var(--color-surface)' }}
              value={clienteSelecionado}
              onChange={(e) => handleClienteSelect(e.target.value)}
            >
              <option value="">— Novo prospecto (não cadastrado) —</option>
              {clientes.map(c => (
                <option key={c.id} value={c.cpf}>
                  {c.nome} {c.cpf ? `· ${c.cpf}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome do Prospecto *</label>
            <input
              disabled={!!clienteSelecionado}
              style={{
                ...inputStyle,
                borderColor: errors.nomeProspecto ? 'var(--color-danger)' : 'var(--color-border)',
                opacity: clienteSelecionado ? 0.6 : 1,
                cursor: clienteSelecionado ? 'not-allowed' : 'text',
              }}
              placeholder="Ex: João da Silva"
              value={form.nomeProspecto}
              onChange={e => set('nomeProspecto', e.target.value)}
            />
            {errors.nomeProspecto && <p style={{ fontSize: '0.72rem', color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.nomeProspecto}</p>}
          </div>

          {/* Endereço */}
          <div>
            <label style={labelStyle}>Endereço Completo *</label>
            <input
              style={{ ...inputStyle, borderColor: errors.endereco ? 'var(--color-danger)' : 'var(--color-border)' }}
              placeholder="Ex: Rua das Flores 123, Centro, Iguatu CE"
              value={form.endereco}
              onChange={e => set('endereco', e.target.value)}
            />
            {errors.endereco && <p style={{ fontSize: '0.72rem', color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.endereco}</p>}
            <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
              Quanto mais completo, melhor o GPS vai localizar
            </p>
          </div>

          {/* Data + Hora */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Data da Visita *</label>
              <input
                type="date"
                style={{ ...inputStyle, borderColor: errors.dataVisita ? 'var(--color-danger)' : 'var(--color-border)' }}
                value={form.dataVisita}
                onChange={e => set('dataVisita', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Horário *</label>
              <input
                type="time"
                style={{ ...inputStyle, borderColor: errors.horaVisita ? 'var(--color-danger)' : 'var(--color-border)' }}
                value={form.horaVisita}
                onChange={e => set('horaVisita', e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={inputStyle}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="Agendada">Agendada</option>
              <option value="Realizada">Realizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Anotações de Campo */}
          <div>
            <label style={labelStyle}>Anotações de Campo</label>
            <textarea
              style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
              placeholder="Ex: Telhado inclinado, cliente interessado no kit de 10 painéis..."
              value={form.anotacoes}
              onChange={e => set('anotacoes', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: '9px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)', color: 'var(--color-foreground)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: '9px', border: 'none',
              background: 'var(--color-primary)', color: '#fff',
              fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px var(--color-primary-glow)',
            }}
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Adicionar Visita'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Card de Visita ── */
interface CardProps {
  visita: VisitaResponse
  columnColor: string
  columnBg: string
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Status) => void
  onCloseDeal: () => void
}

function VisitaCard({ visita, columnColor, columnBg, onEdit, onDelete, onStatusChange, onCloseDeal }: CardProps) {
  const [notasAberta, setNotasAberta] = useState(false)

  return (
    <div
      style={{
        background: 'var(--color-surface)', borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 4px rgba(15,25,41,0.06)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(15,25,41,0.10)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,25,41,0.06)'}
    >
      {/* Topo do card */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <p style={{
            fontSize: '0.9rem', fontWeight: 700, margin: 0,
            color: 'var(--color-foreground)', fontFamily: 'var(--font-display)',
            lineHeight: 1.3,
          }}>
            {visita.nomeProspecto}
          </p>
          {/* Trocar status */}
          <select
            value={visita.status}
            onChange={e => onStatusChange(e.target.value as Status)}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: '0.68rem', fontWeight: 700, borderRadius: '20px',
              padding: '3px 8px', border: `1px solid ${STATUS_CONFIG[visita.status as Status].border}`,
              background: STATUS_CONFIG[visita.status as Status].bg,
              color: STATUS_CONFIG[visita.status as Status].color,
              cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}
          >
            <option value="Agendada">Agendada</option>
            <option value="Realizada">Realizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        {/* Endereço */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
          <MapPin size={12} color="var(--color-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            {visita.endereco}
          </p>
        </div>

        {/* Data e Hora */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={11} color="var(--color-muted)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
            {formatDate(visita.dataVisita)} {visita.horaVisita ? `às ${visita.horaVisita.substring(0, 5)}` : ''}
          </p>
          
          {/* Alerta Visual de Proximidade */}
          {visita.status === 'Agendada' && visita.horaVisita && (() => {
            const dataHora = new Date(`${visita.dataVisita}T${visita.horaVisita}`);
            const agora = new Date();
            const diffMinutos = (dataHora.getTime() - agora.getTime()) / (1000 * 60);
            
            // Se faltam entre 0 e 180 minutos (3 horas)
            if (diffMinutos >= 0 && diffMinutos <= 180) {
              return (
                <div title="Visita se aproximando!" style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'oklch(0.85 0.15 85 / 0.2)', color: 'oklch(0.65 0.18 80)',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                  marginLeft: 'auto'
                }}>
                  <span style={{ 
                    display: 'inline-block', width: '6px', height: '6px', 
                    borderRadius: '50%', background: 'oklch(0.65 0.18 80)',
                    animation: 'pulse 2s infinite'
                  }} />
                  Em breve
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Anotações (expansível) */}
      {visita.anotacoes && (
        <div>
          <button
            onClick={() => setNotasAberta(o => !o)}
            style={{
              width: '100%', padding: '8px 14px',
              border: 'none', borderTop: '1px solid var(--color-border)',
              background: notasAberta ? 'var(--color-background)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600,
              transition: 'background 0.15s ease',
            }}
          >
            <FileText size={11} />
            Anotações
            {notasAberta ? <ChevronUp size={11} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={11} style={{ marginLeft: 'auto' }} />}
          </button>
          {notasAberta && (
            <div style={{
              padding: '10px 14px 12px',
              background: 'var(--color-background)',
              borderTop: '1px solid var(--color-border-soft)',
            }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-foreground-2)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {visita.anotacoes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div style={{
        display: 'flex', gap: '6px', padding: '10px 14px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-background)',
        flexWrap: 'wrap',
      }}>
        {/* Google Maps */}
        <button
          onClick={() => abrirGoogleMaps(visita.endereco)}
          title="Abrir no Google Maps"
          style={{
            flex: '1 1 calc(50% - 4px)', minWidth: '80px', minHeight: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: columnBg,
            color: columnColor,
            fontWeight: 700, fontSize: '0.78rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.15)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)' }}
        >
          <MapPin size={13} />
          Maps
        </button>

        {/* Fechar Compra (Oculto se cancelada) */}
        {visita.status !== 'Cancelada' && (
          <button
            onClick={onCloseDeal}
            title="Fechar Venda (Gerar Contrato)"
            style={{
              flex: '1 1 calc(50% - 4px)', minWidth: '80px', minHeight: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: columnColor,
              color: '#fff',
              fontWeight: 700, fontSize: '0.78rem',
              transition: 'all 0.15s ease',
              boxShadow: `0 2px 8px ${columnColor}40`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)' }}
          >
            <ShoppingBag size={13} />
            Fechar Venda
          </button>
        )}

        {/* Editar + Remover na mesma linha */}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          <button
            onClick={onEdit}
            title="Editar visita"
            style={{
              flex: 1, minHeight: '40px',
              padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-foreground)'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-foreground)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
            }}
          >
            Editar
          </button>

          <button
            onClick={onDelete}
            title="Remover visita"
            style={{
              minHeight: '40px', minWidth: '44px',
              padding: '8px', borderRadius: '8px', border: 'none',
              background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-danger-bg)'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Coluna Kanban ── */
interface ColunaProps {
  status: Status
  visitas: VisitaResponse[]
  onEdit: (v: VisitaResponse) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: Status) => void
  onCloseDeal: (v: VisitaResponse) => void
}

function KanbanColuna({ status, visitas, onEdit, onDelete, onStatusChange, onCloseDeal }: ColunaProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{
      flex: 1, minWidth: '260px', maxWidth: '400px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {/* Cabeçalho da coluna */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 14px', borderRadius: '10px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
      }}>
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: cfg.color }}>
          {cfg.label}
        </p>
        <span style={{
          marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700,
          padding: '2px 8px', borderRadius: '20px',
          background: cfg.border, color: cfg.color,
        }}>
          {visitas.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '60px' }}>
        {visitas.length === 0 ? (
          <div style={{
            border: '2px dashed var(--color-border)', borderRadius: '10px',
            padding: '24px', textAlign: 'center', color: 'var(--color-muted)',
            fontSize: '0.78rem',
          }}>
            Nenhuma visita {cfg.label.toLowerCase()}
          </div>
        ) : (
          visitas.map(v => (
            <VisitaCard
              key={v.id}
              visita={v}
              columnColor={cfg.color}
              columnBg={cfg.bg}
              onEdit={() => onEdit(v)}
              onDelete={() => onDelete(v.id)}
              onStatusChange={(s) => onStatusChange(v.id, s)}
              onCloseDeal={() => onCloseDeal(v)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ── Página Principal ── */
export default function VisitasPage() {
  const { agendadas, realizadas, canceladas, clientes, loading, error, adicionar, atualizar, remover } = useVisitas()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editVisita, setEditVisita] = useState<VisitaResponse | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const total = agendadas.length + realizadas.length + canceladas.length

  const handleSave = async (data: VisitaRequest) => {
    if (editVisita) {
      const ok = await atualizar(editVisita.id, data)
      if (ok) toast('success', 'Visita atualizada!', `${data.nomeProspecto} foi atualizado.`)
      return ok
    } else {
      const ok = await adicionar(data)
      if (ok) toast('success', 'Visita adicionada!', `${data.nomeProspecto} agendado com sucesso.`)
      return ok
    }
  }

  const handleDelete = async () => {
    if (confirmDelete === null) return
    await remover(confirmDelete)
    setConfirmDelete(null)
    toast('info', 'Visita removida', 'O prospecto foi removido da agenda.')
  }

  const handleStatusChange = async (id: number, status: Status) => {
    const v = [...agendadas, ...realizadas, ...canceladas].find(x => x.id === id)
    if (!v) return
    const req: VisitaRequest = {
      nomeProspecto: v.nomeProspecto,
      endereco: v.endereco,
      dataVisita: v.dataVisita,
      cpfCnpj: v.cpfCnpj ?? undefined,
      anotacoes: v.anotacoes ?? undefined,
      status,
    }
    await atualizar(id, req)
  }

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
            Visitas &amp; Prospectos
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>
            {loading ? 'Carregando...' : `${total} visita${total !== 1 ? 's' : ''} no total · ${agendadas.length} agendada${agendadas.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Botão desktop — ocultado no mobile, substituiído pelo FAB */}
        <button
          onClick={() => { setEditVisita(undefined); setModalOpen(true) }}
          className="visitas-add-btn-desktop"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            background: 'var(--color-primary)', color: '#fff',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            boxShadow: '0 4px 16px var(--color-primary-glow)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
        >
          <Plus size={15} />
          Nova Visita
        </button>
      </div>

      {/* FAB — visível apenas no mobile */}
      <button
        onClick={() => { setEditVisita(undefined); setModalOpen(true) }}
        title="Nova Visita"
        style={{
          position: 'fixed', bottom: '88px', right: '16px', zIndex: 50,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none',
          background: 'var(--color-primary)', color: '#fff',
          display: 'none', /* controlado via media query no CSS */
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(232,144,26,0.50)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        } as React.CSSProperties}
        className="visitas-fab"
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(232,144,26,0.65)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(232,144,26,0.50)'
        }}
      >
        <Plus size={22} />
      </button>

      {/* ── Erro ── */}
      {error && (
        <div style={{
          background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
          borderRadius: '10px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertCircle size={15} color="var(--color-danger)" />
          <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ── Kanban ── */}
      {loading ? (
        /* Skeleton Loader */
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '8px' }}>
          {[0, 1, 2].map(col => (
            <div key={col} style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Cabeçalho skeleton */}
              <div className="skeleton" style={{ height: '44px', borderRadius: '10px' }} />
              {/* Cards skeleton */}
              {[0, 1].map(card => (
                <div key={card} style={{
                  background: 'var(--color-surface)', borderRadius: '12px',
                  border: '1px solid var(--color-border)', overflow: 'hidden', padding: '14px',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div className="skeleton" style={{ height: '18px', width: '70%', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '50%', borderRadius: '6px' }} />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <div className="skeleton" style={{ height: '36px', flex: 1, borderRadius: '8px' }} />
                    <div className="skeleton" style={{ height: '36px', flex: 1, borderRadius: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          overflowX: 'auto', paddingBottom: '8px',
        }}>
          <KanbanColuna
            status="Agendada"
            visitas={agendadas}
            onEdit={v => { setEditVisita(v); setModalOpen(true) }}
            onDelete={id => setConfirmDelete(id)}
            onStatusChange={handleStatusChange}
            onCloseDeal={v => navigate('/vendas', { state: { novoContrato: true, cliente: v.nomeProspecto, cpfCnpj: v.cpfCnpj } })}
          />
          <KanbanColuna
            status="Realizada"
            visitas={realizadas}
            onEdit={v => { setEditVisita(v); setModalOpen(true) }}
            onDelete={id => setConfirmDelete(id)}
            onStatusChange={handleStatusChange}
            onCloseDeal={v => navigate('/vendas', { state: { novoContrato: true, cliente: v.nomeProspecto, cpfCnpj: v.cpfCnpj } })}
          />
          <KanbanColuna
            status="Cancelada"
            visitas={canceladas}
            onEdit={v => { setEditVisita(v); setModalOpen(true) }}
            onDelete={id => setConfirmDelete(id)}
            onStatusChange={handleStatusChange}
            onCloseDeal={v => navigate('/vendas', { state: { novoContrato: true, cliente: v.nomeProspecto, cpfCnpj: v.cpfCnpj } })}
          />
        </div>
      )}

      {/* ── Modal Nova/Editar Visita ── */}
      {modalOpen && (
        <VisitaModal
          visita={editVisita}
          clientes={clientes}
          onClose={() => { setModalOpen(false); setEditVisita(undefined) }}
          onSave={handleSave}
        />
      )}

      {/* ── Confirmar remoção ── */}
      {confirmDelete !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,25,41,0.45)', backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: '14px', padding: '24px',
              width: '100%', maxWidth: '360px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 60px rgba(15,25,41,0.20)',
            }}
            className="animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
            }}>
              <Trash2 size={18} color="var(--color-danger)" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
              Remover Visita
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0 0 20px' }}>
              Este prospecto será removido permanentemente. Deseja continuar?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '9px 18px', borderRadius: '9px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)', color: 'var(--color-foreground)',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >Cancelar</button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '9px 18px', borderRadius: '9px', border: 'none',
                  background: 'var(--color-danger)', color: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
                }}
              >Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos mobile-only para FAB e botão desktop */}
      <style>{`
        @media (max-width: 768px) {
          .visitas-fab { display: flex !important; }
          .visitas-add-btn-desktop { display: none !important; }
        }
      `}</style>
    </div>
  )
}
