import { useState, FormEvent, useEffect } from 'react'
import { PlusCircle, UserCheck, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import type { Contrato, ContratoStatus } from './mockVendas'
import { CIDADES, STATUS_OPTIONS, mockContratos } from './mockVendas'

type Dados = Omit<Contrato, 'id' | 'dataCriacao'>

const empty: Dados = {
  cliente: '', cpfCnpj: '', telefone: '', cidade: CIDADES[0],
  vendedor: 'Lucas Araújo', produto: '', kwp: 0, valorTotal: 0,
  comissao: 0, saldoDevedor: 0,
  status: 'Pendente', paineis: 0, financiamento: 'Financiado',
}

// Lista de clientes únicos do mock para o autocomplete
const clientesExistentes = Array.from(
  new Map(mockContratos.map((c) => [c.cpfCnpj, c])).values()
).map((c) => ({ label: c.cliente, value: c.cpfCnpj, data: c }))

interface Props {
  open: boolean
  onClose: () => void
  onSave: (d: Dados) => void
  initialData?: Partial<Contrato> // para modo edição
  editId?: string
}

export default function NovoContratoModal({ open, onClose, onSave, initialData, editId }: Props) {
  const isEdit = Boolean(editId)
  const [form, setForm] = useState<Dados>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Dados, string>>>({})
  const [saving, setSaving] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('') // cpfCnpj do cliente
  const [comissaoPct, setComissaoPct] = useState<number | string>(5) // default 5%

  // Popula formulário com dados iniciais (modo edição)
  useEffect(() => {
    if (open && initialData) {
      setForm({ ...empty, ...initialData } as Dados)
      if (initialData.valorTotal && initialData.valorTotal > 0 && initialData.comissao !== undefined) {
        setComissaoPct((initialData.comissao / initialData.valorTotal) * 100)
      } else {
        setComissaoPct(5)
      }
      setClienteSelecionado('')
    } else if (open && !initialData) {
      setForm(empty)
      setComissaoPct(5)
      setClienteSelecionado('')
    }
    setErrors({})
  }, [open, initialData])

  const set = <K extends keyof Dados>(k: K, v: Dados[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // Ao selecionar cliente existente, preenche campos de cliente automaticamente
  const handleClienteSelect = (cpfCnpj: string) => {
    setClienteSelecionado(cpfCnpj)
    if (!cpfCnpj) return
    const found = clientesExistentes.find((c) => c.value === cpfCnpj)
    if (found) {
      setForm((f) => ({
        ...f,
        cliente: found.data.cliente,
        cpfCnpj: found.data.cpfCnpj,
        telefone: found.data.telefone,
        cidade: found.data.cidade,
      }))
    }
  }

  const handleLimparCliente = () => {
    setClienteSelecionado('')
    setForm((f) => ({ ...f, cliente: '', cpfCnpj: '', telefone: '', cidade: CIDADES[0] }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.cliente.trim())  e.cliente    = 'Campo obrigatório'
    if (!form.cpfCnpj.trim())  e.cpfCnpj    = 'Campo obrigatório'
    if (!form.telefone.trim()) e.telefone   = 'Campo obrigatório'
    if (!form.produto.trim())  e.produto    = 'Campo obrigatório'
    if (form.valorTotal <= 0)  e.valorTotal  = 'Valor deve ser maior que 0'
    if (Number(comissaoPct) < 0) e.comissao   = 'Comissão não pode ser negativa'
    if (form.paineis <= 0)     e.paineis    = 'Informe a quantidade de painéis'
    if (form.status === 'Pendente' && form.saldoDevedor <= 0)
      e.saldoDevedor = 'Informe o saldo devedor para contratos Pendentes'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    // Calcula a comissão em R$ a partir da porcentagem e zera saldo devedor se não for Pendente
    const finalComissao = (Number(comissaoPct) / 100) * form.valorTotal
    onSave({
      ...form,
      comissao: finalComissao,
      saldoDevedor: form.status === 'Pendente' ? form.saldoDevedor : 0
    })
    setSaving(false)
    setForm(empty)
    setErrors({})
    setClienteSelecionado('')
    onClose()
  }

  const handleClose = () => {
    setForm(empty)
    setErrors({})
    setClienteSelecionado('')
    onClose()
  }

  const camposClienteBloqueados = Boolean(clienteSelecionado)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Editar Contrato' : 'Novo Contrato'}
      subtitle={isEdit ? 'Atualize os dados do contrato' : 'Preencha os dados do cliente e da venda'}
      width="640px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Seção: Selecionar Cliente Existente ── */}
        {!isEdit && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
              Selecionar Cliente Existente (Opcional)
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="Cliente cadastrado"
                  value={clienteSelecionado}
                  onChange={(e) => handleClienteSelect(e.target.value)}
                  options={[
                    { value: '', label: '— Novo cliente (preencher manualmente) —' },
                    ...clientesExistentes.map((c) => ({ value: c.value, label: c.label })),
                  ]}
                />
              </div>
              {clienteSelecionado && (
                <button
                  type="button"
                  onClick={handleLimparCliente}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                  style={{
                    background: 'oklch(0.65 0.22 25 / 0.12)',
                    color: 'var(--color-danger)',
                    border: '1px solid oklch(0.65 0.22 25 / 0.25)',
                    height: '40px',
                  }}
                >
                  <X size={12} /> Limpar
                </button>
              )}
            </div>
            {clienteSelecionado && (
              <div
                className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)' }}
              >
                <UserCheck size={13} />
                Cliente selecionado — campos preenchidos automaticamente
              </div>
            )}
          </section>
        )}

        {/* ── Seção: Dados do Cliente ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
            Dados do Cliente
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Nome / Razão Social *"
                placeholder="Ex: João Pedro Alves ou Empresa XYZ Ltda"
                value={form.cliente}
                onChange={(e) => set('cliente', e.target.value)}
                error={errors.cliente}
                disabled={camposClienteBloqueados}
                style={camposClienteBloqueados ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              />
            </div>
            <Input
              label="CPF / CNPJ *"
              placeholder="000.000.000-00"
              value={form.cpfCnpj}
              onChange={(e) => set('cpfCnpj', e.target.value)}
              error={errors.cpfCnpj}
              disabled={camposClienteBloqueados}
              style={camposClienteBloqueados ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            <Input
              label="Telefone *"
              placeholder="(00) 90000-0000"
              value={form.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              error={errors.telefone}
              disabled={camposClienteBloqueados}
              style={camposClienteBloqueados ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            <Select
              label="Cidade"
              value={form.cidade}
              onChange={(e) => set('cidade', e.target.value)}
              options={CIDADES.map((c) => ({ value: c, label: c }))}
              disabled={camposClienteBloqueados}
            />
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* ── Seção: Produto & Sistema ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
            Produto & Sistema
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Produto *"
                placeholder="Ex: Kit Solar 5,5 kWp Residencial"
                value={form.produto}
                onChange={(e) => set('produto', e.target.value)}
                error={errors.produto}
              />
            </div>
            <Input
              label="Potência (kWp)"
              type="number"
              placeholder="Ex: 5.5"
              min={0}
              step={0.1}
              value={form.kwp || ''}
              onChange={(e) => set('kwp', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Qtd. Painéis *"
              type="number"
              placeholder="Ex: 10"
              min={1}
              value={form.paineis || ''}
              onChange={(e) => set('paineis', parseInt(e.target.value) || 0)}
              error={errors.paineis}
            />
            <Select
              label="Financiamento"
              value={form.financiamento}
              onChange={(e) => set('financiamento', e.target.value as Contrato['financiamento'])}
              options={[
                { value: 'Financiado', label: 'Financiado' },
                { value: 'À Vista',    label: 'À Vista' },
                { value: 'BNDES',      label: 'BNDES' },
              ]}
            />
            <Select
              label="Status Inicial"
              value={form.status}
              onChange={(e) => set('status', e.target.value as ContratoStatus)}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* ── Seção: Valores ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
            Valores
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Valor Total (R$) *"
              type="number"
              placeholder="Ex: 18700"
              min={0}
              value={form.valorTotal || ''}
              onChange={(e) => set('valorTotal', parseFloat(e.target.value) || 0)}
              error={errors.valorTotal}
            />
            <Input
              label="Comissão do Vendedor (%) *"
              type="number"
              placeholder="Ex: 5"
              min={0}
              step={0.1}
              value={comissaoPct}
              onChange={(e) => setComissaoPct(e.target.value)}
              error={errors.comissao}
            />
            {form.status === 'Pendente' && (
              <div className="sm:col-span-2">
                <Input
                  label="Saldo Devedor (R$) *"
                  type="number"
                  placeholder="Quanto o cliente ainda deve"
                  min={0}
                  value={form.saldoDevedor || ''}
                  onChange={(e) => set('saldoDevedor', parseFloat(e.target.value) || 0)}
                  error={errors.saldoDevedor}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Actions ── */}
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" size="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            leftIcon={saving ? undefined : <PlusCircle size={15} />}
            style={{ boxShadow: '0 4px 20px var(--color-primary-glow)' }}
          >
            {isEdit ? 'Salvar Alterações' : 'Salvar Contrato'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
