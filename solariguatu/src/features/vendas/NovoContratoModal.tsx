import { useState, FormEvent } from 'react'
import { PlusCircle } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import type { Contrato, ContratoStatus } from './mockVendas'
import { CIDADES, STATUS_OPTIONS } from './mockVendas'

type Dados = Omit<Contrato, 'id' | 'dataCriacao'>

const empty: Dados = {
  cliente: '', cpfCnpj: '', telefone: '', cidade: CIDADES[0],
  vendedor: 'Lucas Araújo', kwp: 0, valorTotal: 0,
  status: 'Pendente', paineis: 0, financiamento: 'Financiado',
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (d: Dados) => void
}

export default function NovoContratoModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<Dados>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Dados, string>>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Dados>(k: K, v: Dados[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.cliente.trim())  e.cliente   = 'Campo obrigatório'
    if (!form.cpfCnpj.trim())  e.cpfCnpj   = 'Campo obrigatório'
    if (!form.telefone.trim()) e.telefone  = 'Campo obrigatório'
    if (form.kwp <= 0)         e.kwp       = 'Valor deve ser maior que 0'
    if (form.valorTotal <= 0)  e.valorTotal = 'Valor deve ser maior que 0'
    if (form.paineis <= 0)     e.paineis   = 'Informe a quantidade de painéis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    onSave(form)
    setSaving(false)
    setForm(empty)
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setForm(empty)
    setErrors({})
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo Contrato" subtitle="Preencha os dados do cliente e do sistema solar" width="600px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* ── Seção: Cliente ── */}
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
              />
            </div>
            <Input
              label="CPF / CNPJ *"
              placeholder="000.000.000-00"
              value={form.cpfCnpj}
              onChange={(e) => set('cpfCnpj', e.target.value)}
              error={errors.cpfCnpj}
            />
            <Input
              label="Telefone *"
              placeholder="(00) 90000-0000"
              value={form.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              error={errors.telefone}
            />
            <Select
              label="Cidade"
              value={form.cidade}
              onChange={(e) => set('cidade', e.target.value)}
              options={CIDADES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* ── Seção: Sistema Solar ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
            Sistema Solar
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="Potência (kWp) *"
              type="number"
              placeholder="Ex: 5.5"
              min={0}
              step={0.1}
              value={form.kwp || ''}
              onChange={(e) => set('kwp', parseFloat(e.target.value) || 0)}
              error={errors.kwp}
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
            <Input
              label="Valor Total (R$) *"
              type="number"
              placeholder="Ex: 18700"
              min={0}
              value={form.valorTotal || ''}
              onChange={(e) => set('valorTotal', parseFloat(e.target.value) || 0)}
              error={errors.valorTotal}
              className="sm:col-span-2"
            />
            <Select
              label="Status Inicial"
              value={form.status}
              onChange={(e) => set('status', e.target.value as ContratoStatus)}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
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
            leftIcon={<PlusCircle size={15} />}
            style={{ boxShadow: '0 4px 20px var(--color-primary-glow)' }}
          >
            Salvar Contrato
          </Button>
        </div>
      </form>
    </Modal>
  )
}
