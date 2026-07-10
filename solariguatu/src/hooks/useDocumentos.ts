import { useState, useEffect, useCallback } from 'react'
import {
  listarDocumentos,
  listarClientes,
  uploadDocumento,
  deletarDocumento,
  abrirDocumento,
  type DocumentoResponse,
  type ClienteSimples,
} from '../services/documentos/documentosService'

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([])
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [docs, cls] = await Promise.all([listarDocumentos(), listarClientes()])
      setDocumentos(docs)
      setClientes(cls)
    } catch (e) {
      console.error('Erro ao carregar documentos:', e)
      setError('Não foi possível carregar os documentos. Verifique a conexão.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const upload = useCallback(
    async (clienteId: number, arquivo: File): Promise<boolean> => {
      setUploading(true)
      setError(null)
      try {
        const novo = await uploadDocumento(clienteId, arquivo)
        setDocumentos((prev) => [novo, ...prev])
        return true
      } catch (e: any) {
        const msg =
          e?.response?.status === 415
            ? 'Apenas arquivos PDF são aceitos.'
            : 'Falha ao fazer upload. Tente novamente.'
        setError(msg)
        return false
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const remover = useCallback(async (id: number) => {
    try {
      await deletarDocumento(id)
      setDocumentos((prev) => prev.filter((d) => d.id !== id))
    } catch {
      setError('Erro ao remover documento.')
    }
  }, [])

  const abrir = useCallback(async (id: number) => {
    try {
      await abrirDocumento(id)
    } catch {
      setError('Erro ao abrir documento.')
    }
  }, [])

  return {
    documentos,
    clientes,
    loading,
    uploading,
    error,
    upload,
    remover,
    abrir,
    recarregar: carregar,
  }
}
