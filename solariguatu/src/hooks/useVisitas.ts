import { useState, useEffect, useCallback } from 'react'
import {
  listarVisitas,
  adicionarVisita,
  atualizarVisita,
  deletarVisita,
  type VisitaResponse,
  type VisitaRequest,
} from '../services/visitas/visitasService'
import { listarClientes, type ClienteSimples } from '../services/documentos/documentosService'

export function useVisitas() {
  const [visitas, setVisitas] = useState<VisitaResponse[]>([])
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, cls] = await Promise.all([listarVisitas(), listarClientes()])
      setVisitas(data)
      setClientes(cls)
    } catch {
      setError('Não foi possível carregar as visitas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const adicionar = useCallback(async (data: VisitaRequest): Promise<boolean> => {
    try {
      const nova = await adicionarVisita(data)
      setVisitas(prev => [nova, ...prev])
      return true
    } catch {
      setError('Erro ao adicionar visita.')
      return false
    }
  }, [])

  const atualizar = useCallback(async (id: number, data: VisitaRequest): Promise<boolean> => {
    try {
      const atualizada = await atualizarVisita(id, data)
      setVisitas(prev => prev.map(v => v.id === id ? atualizada : v))
      return true
    } catch {
      setError('Erro ao atualizar visita.')
      return false
    }
  }, [])

  const remover = useCallback(async (id: number): Promise<void> => {
    try {
      await deletarVisita(id)
      setVisitas(prev => prev.filter(v => v.id !== id))
    } catch {
      setError('Erro ao remover visita.')
    }
  }, [])

  const agendadas  = visitas.filter(v => v.status === 'Agendada')
  const realizadas = visitas.filter(v => v.status === 'Realizada')
  const canceladas = visitas.filter(v => v.status === 'Cancelada')

  return { visitas, agendadas, realizadas, canceladas, clientes, loading, error, adicionar, atualizar, remover }
}
