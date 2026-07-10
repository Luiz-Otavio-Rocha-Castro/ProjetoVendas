import { api } from '../api'

export interface DocumentoResponse {
  id: number
  nomeArquivo: string
  tamanhoBytes: number
  dataEnvio: string
  clienteId: number
  clienteNome: string
}

export interface ClienteSimples {
  id: number
  nome: string
  cpf: string
}

/** Lista todos os documentos salvos no banco */
export async function listarDocumentos(): Promise<DocumentoResponse[]> {
  const resp = await api.get<DocumentoResponse[]>('/api/documentos')
  return resp.data
}

/** Faz upload de um PDF associado a um cliente */
export async function uploadDocumento(
  clienteId: number,
  arquivo: File
): Promise<DocumentoResponse> {
  const form = new FormData()
  form.append('clienteId', String(clienteId))
  form.append('arquivo', arquivo)

  const resp = await api.post<DocumentoResponse>('/api/documentos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data
}

/** Remove um documento pelo ID */
export async function deletarDocumento(id: number): Promise<void> {
  await api.delete(`/api/documentos/${id}`)
}

/** Retorna a URL de download do PDF */
export function urlDownload(id: number): string {
  const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'
  const token = localStorage.getItem('token') || ''
  // Usado via <a href> com Authorization injetado manualmente via fetch no hook
  return `${base}/api/documentos/${id}/download?token=${token}`
}

/** Lista todos os clientes cadastrados (para o seletor de upload) */
export async function listarClientes(): Promise<ClienteSimples[]> {
  const resp = await api.get<ClienteSimples[]>('/api/vendas-cliente')
  return resp.data
}

/** Abre o PDF no browser — faz fetch autenticado e cria blob URL */
export async function abrirDocumento(id: number): Promise<void> {
  const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'
  const token = localStorage.getItem('token') || ''

  const response = await fetch(`${base}/api/documentos/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao baixar documento')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Libera a URL após 60 s
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
