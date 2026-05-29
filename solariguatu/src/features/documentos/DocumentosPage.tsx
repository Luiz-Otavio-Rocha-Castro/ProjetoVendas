import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Trash2, Eye, Search,
  File, CheckCircle2, Clock, Send,
  FolderOpen, CloudUpload,
} from 'lucide-react'
import { mockDocumentos, type Documento, type DocStatus } from './mockDocumentos'
import { useToast } from '../../contexts/ToastContext'
import Input from '../../components/ui/Input'

const STATUS_STYLE: Record<DocStatus, { badge: string; icon: React.ReactNode; color: string }> = {
  'Assinado':           { badge: 'badge badge-success', icon: <CheckCircle2 size={11} />, color: 'oklch(0.72 0.17 145)' },
  'Pendente Assinatura':{ badge: 'badge badge-warning',  icon: <Clock size={11} />,        color: 'oklch(0.82 0.15 80)'  },
  'Enviado':            { badge: 'badge badge-info',     icon: <Send size={11} />,          color: 'oklch(0.72 0.15 220)' },
}

function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface DocPreviewModalProps {
  doc: Documento
  onClose: () => void
}

function DocPreviewModal({ doc, onClose }: DocPreviewModalProps) {
  const st = STATUS_STYLE[doc.status]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.70)' }}
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl p-8 w-full max-w-md animate-scaleIn"
        style={{ border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* PDF icon */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'oklch(0.65 0.22 25 / 0.15)', border: '1px solid oklch(0.65 0.22 25 / 0.25)' }}
          >
            <FileText size={36} style={{ color: 'oklch(0.65 0.22 25)' }} />
          </div>
          <div className="text-center">
            <p
              className="text-base font-semibold break-all"
              style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}
            >
              {doc.nomeArquivo}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              {formatKb(doc.tamanhoKb)} · Enviado em {formatDate(doc.dataEnvio)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {[
            { label: 'Cliente', value: doc.clienteAssociado },
            { label: 'Contrato', value: doc.contratoId },
            { label: 'Status', value: <span className={st.badge}>{st.icon}{doc.status}</span> },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>{value}</span>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl px-4 py-3 text-xs text-center mb-4"
          style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)' }}
        >
          Preview de PDF não disponível no ambiente demo. Em produção, o arquivo seria exibido aqui.
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>(mockDocumentos)
  const [busca, setBusca] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<Documento | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const filtrados = docs.filter(
    (d) =>
      busca === '' ||
      d.clienteAssociado.toLowerCase().includes(busca.toLowerCase()) ||
      d.nomeArquivo.toLowerCase().includes(busca.toLowerCase())
  )

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const newDocs: Documento[] = Array.from(files)
      .filter((f) => f.name.endsWith('.pdf') || f.type === 'application/pdf')
      .map((f) => ({
        id: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nomeArquivo: f.name,
        clienteAssociado: '— Não associado —',
        contratoId: '—',
        dataEnvio: new Date().toISOString().split('T')[0],
        tamanhoKb: Math.round(f.size / 1024) || 10,
        status: 'Enviado' as DocStatus,
      }))

    if (newDocs.length === 0) {
      toast('error', 'Formato inválido', 'Apenas arquivos PDF são aceitos.')
      return
    }
    setDocs((prev) => [...newDocs, ...prev])
    toast('success', `${newDocs.length} arquivo(s) adicionado(s)`, 'Documentos prontos para associar a um contrato.')
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
    toast('info', 'Documento removido', 'O arquivo foi excluído da lista.')
  }

  const totalDocs = docs.length
  const assinados = docs.filter((d) => d.status === 'Assinado').length
  const pendentes = docs.filter((d) => d.status === 'Pendente Assinatura').length

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
          >
            Documentos & Contratos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Gerencie e envie seus PDFs de propostas e contratos
          </p>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-3 stagger">
        {[
          { label: 'Total de Arquivos', value: String(totalDocs), icon: <FolderOpen size={14} />, color: 'var(--color-foreground)' },
          { label: 'Assinados', value: String(assinados), icon: <CheckCircle2 size={14} />, color: 'var(--color-success)' },
          { label: 'Pend. Assinatura', value: String(pendentes), icon: <Clock size={14} />, color: 'var(--color-warning)' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl px-4 py-3 flex items-center gap-3 animate-slideUp">
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
              <p className="text-base font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dropzone ── */}
      <div
        className={`dropzone flex flex-col items-center justify-center gap-4 py-12 px-6 text-center cursor-pointer ${isDragging ? 'dropzone-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{
            background: isDragging ? 'var(--color-primary)' : 'var(--color-primary-subtle)',
            border: `1px solid ${isDragging ? 'var(--color-primary)' : 'var(--color-primary-glow)'}`,
          }}
        >
          <CloudUpload size={28} style={{ color: isDragging ? '#0a0a0a' : 'var(--color-primary)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
            {isDragging ? 'Solte os arquivos aqui!' : 'Arraste e solte seus PDFs aqui'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            ou <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>clique para selecionar</span> · somente PDF
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { icon: <Upload size={12} />, label: 'Upload simples' },
            { icon: <File size={12} />, label: 'Múltiplos arquivos' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
              {icon}
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lista de documentos ── */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="max-w-sm">
            <Input
              placeholder="Buscar por cliente ou arquivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ background: 'oklch(0.16 0.025 250 / 0.60)', borderBottom: '1px solid var(--color-border)' }}>
                {['Arquivo', 'Cliente', 'Contrato', 'Data', 'Tamanho', 'Status', 'Ações'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
                    Nenhum documento encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((doc, i) => {
                  const st = STATUS_STYLE[doc.status]
                  return (
                    <tr
                      key={doc.id}
                      className="animate-slideUp transition-colors hover:bg-white/3"
                      style={{ borderBottom: '1px solid var(--color-border)', animationDelay: `${i * 40}ms` }}
                    >
                      {/* Arquivo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 max-w-60">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'oklch(0.65 0.22 25 / 0.12)', border: '1px solid oklch(0.65 0.22 25 / 0.20)' }}
                          >
                            <FileText size={14} style={{ color: 'oklch(0.65 0.22 25)' }} />
                          </div>
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                            {doc.nomeArquivo}
                          </p>
                        </div>
                      </td>
                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: 'var(--color-foreground)' }}>{doc.clienteAssociado}</p>
                      </td>
                      {/* Contrato */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {doc.contratoId}
                        </span>
                      </td>
                      {/* Data */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                        {formatDate(doc.dataEnvio)}
                      </td>
                      {/* Tamanho */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                        {formatKb(doc.tamanhoKb)}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={st.badge}>
                          {st.icon}
                          {doc.status}
                        </span>
                      </td>
                      {/* Ações */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreview(doc)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--color-primary)' }}
                            title="Visualizar"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--color-danger)' }}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* ── Preview Modal ── */}
      {preview && <DocPreviewModal doc={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
