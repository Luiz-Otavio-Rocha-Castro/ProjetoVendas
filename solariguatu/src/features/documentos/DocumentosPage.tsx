import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Trash2, Eye, Search,
  FolderOpen, CloudUpload, User, X, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useDocumentos } from '../../hooks/useDocumentos'
import { useToast } from '../../contexts/ToastContext'

function formatSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

const cardBase: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(15,25,41,0.06)',
}

export default function DocumentosPage() {
  const { documentos, clientes, loading, uploading, error, upload, remover, abrir } = useDocumentos()
  const { toast } = useToast()

  const [busca, setBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<number | ''>('')
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [pagina, setPagina] = useState(1)
  const itensPorPagina = 5

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Filtro de busca ── */
  const filtrados = documentos.filter(
    (d) =>
      busca === '' ||
      d.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      d.nomeArquivo.toLowerCase().includes(busca.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina))
  const documentosPaginados = filtrados.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina)

  /* ── Seleciona arquivo (valida PDF) ── */
  const handleArquivo = useCallback(
    (file: File | null) => {
      if (!file) return
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast('error', 'Formato inválido', 'Apenas arquivos PDF são aceitos.')
        return
      }
      setArquivoSelecionado(file)
    },
    [toast]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0] ?? null
      handleArquivo(file)
    },
    [handleArquivo]
  )

  /* ── Envia ── */
  const handleUpload = async () => {
    if (!arquivoSelecionado) {
      toast('error', 'Nenhum arquivo', 'Selecione um arquivo PDF.')
      return
    }
    if (!clienteSelecionado) {
      toast('error', 'Nenhum cliente', 'Selecione o cliente ao qual o documento pertence.')
      return
    }
    const ok = await upload(Number(clienteSelecionado), arquivoSelecionado)
    if (ok) {
      toast('success', 'Upload realizado!', `"${arquivoSelecionado.name}" salvo com sucesso.`)
      setArquivoSelecionado(null)
      setClienteSelecionado('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      toast('error', 'Falha no upload', 'Verifique o arquivo e tente novamente.')
    }
  }

  /* ── Remove ── */
  const confirmarRemocao = async () => {
    if (confirmDelete === null) return
    await remover(confirmDelete)
    setConfirmDelete(null)
    toast('info', 'Documento removido', 'O arquivo foi excluído do banco de dados.')
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
            Documentos
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>
            {loading ? 'Carregando...' : `${documentos.length} documento${documentos.length !== 1 ? 's' : ''} armazenado${documentos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* KPI rápido */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            ...cardBase, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <FolderOpen size={15} color="var(--color-primary)" />
            <div>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>{documentos.length}</p>
            </div>
          </div>
          <div style={{
            ...cardBase, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <User size={15} color="var(--color-success)" />
            <div>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clientes</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-success)', fontFamily: 'var(--font-display)' }}>
                {new Set(documentos.map((d) => d.clienteId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Erro global ── */}
      {error && (
        <div style={{
          ...cardBase, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderColor: 'var(--color-danger-border)',
          background: 'var(--color-danger-bg)',
        }}>
          <AlertCircle size={16} color="var(--color-danger)" />
          <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ── Área de Upload ── */}
      <div style={{ ...cardBase, padding: '20px' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--color-primary)', margin: '0 0 14px',
        }}>
          Novo Documento
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--color-primary)' : arquivoSelecionado ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderRadius: '10px',
            padding: '28px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging
              ? 'var(--color-primary-light)'
              : arquivoSelecionado
              ? 'var(--color-success-bg)'
              : 'var(--color-background)',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleArquivo(e.target.files?.[0] ?? null)}
          />
          {arquivoSelecionado ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <FileText size={20} color="var(--color-success)" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground)' }}>
                  {arquivoSelecionado.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
                  {formatSize(arquivoSelecionado.size)} · Clique para trocar
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setArquivoSelecionado(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                style={{
                  marginLeft: 'auto', padding: '4px', borderRadius: '6px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--color-muted)',
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <CloudUpload size={28} color="var(--color-muted-light)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-foreground)' }}>
                Arraste um PDF aqui ou clique para selecionar
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                Somente arquivos <strong>.pdf</strong> são aceitos
              </p>
            </div>
          )}
        </div>

        {/* Seletor de cliente + botão */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'block', marginBottom: '6px',
            }}>
              Cliente *
            </label>
            <select
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value === '' ? '' : Number(e.target.value))}
              className="input-base"
              style={{ width: '100%' }}
            >
              <option value="">— Selecione o cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.cpf ? `· ${c.cpf}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !arquivoSelecionado || !clienteSelecionado}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '10px',
              border: 'none', cursor: uploading || !arquivoSelecionado || !clienteSelecionado ? 'not-allowed' : 'pointer',
              background: uploading || !arquivoSelecionado || !clienteSelecionado
                ? 'var(--color-border)'
                : 'var(--color-primary)',
              color: uploading || !arquivoSelecionado || !clienteSelecionado
                ? 'var(--color-muted)'
                : '#fff',
              fontWeight: 700, fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              boxShadow: uploading || !arquivoSelecionado || !clienteSelecionado
                ? 'none'
                : '0 4px 16px var(--color-primary-glow)',
              whiteSpace: 'nowrap',
            }}
          >
            <Upload size={14} />
            {uploading ? 'Enviando...' : 'Enviar Documento'}
          </button>
        </div>
      </div>

      {/* ── Busca ── */}
      <div style={{ ...cardBase, padding: '12px 14px', position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={15} color="var(--color-muted-light)" style={{ flexShrink: 0 }} />
        <input
          className="input-base"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 0', outline: 'none' }}
          placeholder="Buscar por cliente ou nome do arquivo..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
        />
      </div>

      {/* ── Lista de documentos ── */}
      <div style={{ ...cardBase, overflow: 'hidden' }}>
        {loading ? (
          /* Skeleton: linhas da tabela */
          <div style={{ padding: '8px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px', borderBottom: '1px solid var(--color-border-soft)',
              }}>
                <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '5px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '40%', borderRadius: '5px' }} />
                </div>
                <div className="skeleton" style={{ height: '12px', width: '60px', borderRadius: '5px', flexShrink: 0 }} />
                <div className="skeleton" style={{ height: '12px', width: '80px', borderRadius: '5px', flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '7px' }} />
                  <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '7px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FolderOpen size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>
              {busca ? 'Nenhum documento encontrado para a busca.' : 'Nenhum documento armazenado.'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
              Faça upload de um PDF acima para começar.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'var(--font-body)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
                  {['Arquivo', 'Cliente', 'Tamanho', 'Data de Upload', 'Ações'].map((h) => (
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
                {documentosPaginados.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className="animate-slideUp"
                    style={{
                      borderBottom: '1px solid var(--color-border-soft)',
                      transition: 'background 0.15s ease',
                      animationDelay: `${i * 35}ms`,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-background)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    {/* Arquivo */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                          background: 'oklch(0.65 0.22 25 / 0.12)',
                          border: '1px solid oklch(0.65 0.22 25 / 0.20)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FileText size={15} style={{ color: 'oklch(0.65 0.22 25)' }} />
                        </div>
                        <span style={{
                          fontWeight: 600, color: 'var(--color-foreground)',
                          maxWidth: '180px', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                        }}>
                          {doc.nomeArquivo}
                        </span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} color="var(--color-muted)" />
                        <span style={{ color: 'var(--color-foreground-2)', fontSize: '0.82rem', fontWeight: 500 }}>
                          {doc.clienteNome}
                        </span>
                      </div>
                    </td>

                    {/* Tamanho */}
                    <td style={{ padding: '12px 14px', color: 'var(--color-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatSize(doc.tamanhoBytes)}
                    </td>

                    {/* Data */}
                    <td style={{ padding: '12px 14px', color: 'var(--color-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(doc.dataEnvio)}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                          onClick={() => abrir(doc.id)}
                          title="Abrir PDF"
                          style={{
                            width: '44px', height: '44px',
                            borderRadius: '7px', border: 'none', cursor: 'pointer',
                            background: 'transparent', color: 'var(--color-muted)',
                            transition: 'all 0.15s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, position: 'relative', zIndex: 1,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-light)'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
                          }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(doc.id)}
                          title="Remover documento"
                          style={{
                            width: '44px', height: '44px',
                            borderRadius: '7px', border: 'none', cursor: 'pointer',
                            background: 'transparent', color: 'var(--color-muted)',
                            transition: 'all 0.15s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, position: 'relative', zIndex: 1,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-danger-bg)'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)'
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Controles de Paginação */}
            {totalPaginas > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderTop: '1px solid var(--color-border)',
                background: 'var(--color-background)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                  Página <strong style={{ color: 'var(--color-foreground)' }}>{pagina}</strong> de {totalPaginas}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
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
                  {[...Array(totalPaginas)].map((_, i) => {
                    const n = i + 1;
                    if (totalPaginas > 5 && n !== 1 && n !== totalPaginas && Math.abs(pagina - n) > 1) {
                      if (n === 2 || n === totalPaginas - 1) return <span key={n} style={{ padding: '0 4px', color: 'var(--color-muted)' }}>...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={n}
                        onClick={() => setPagina(n)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '7px', border: 'none',
                          background: pagina === n ? 'var(--color-primary)' : 'transparent',
                          color: pagina === n ? '#fff' : 'var(--color-muted)',
                          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {n}
                      </button>
                    )
                  })}
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
        )}
      </div>

      {/* ── Modal de confirmação de remoção ── */}
      {confirmDelete !== null && (
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
              Remover Documento
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0 0 20px' }}>
              O arquivo será removido permanentemente do banco de dados. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '9px 18px', borderRadius: '9px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-foreground)',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemocao}
                style={{
                  padding: '9px 18px', borderRadius: '9px',
                  border: 'none',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
                }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
