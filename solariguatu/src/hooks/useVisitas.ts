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
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async (isMounted = true) => {
    setLoading(true)
    setError(null)
    try {
      const [data, cls] = await Promise.all([listarVisitas(), listarClientes()])
      if (isMounted) {
        setVisitas(data)
        setClientes(cls)
      }
    } catch {
      if (isMounted) setError('Não foi possível carregar as visitas.')
    } finally {
      if (isMounted) setLoading(false)
    }
  }, [])

  useEffect(() => { 
    let isMounted = true;
    carregar(isMounted);
    return () => { isMounted = false; };
  }, [carregar])

  const adicionar = useCallback(async (data: VisitaRequest): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      const nova = await adicionarVisita(data)
      setVisitas(prev => [nova, ...prev])
      return true
    } catch {
      setError('Erro ao adicionar visita.')
      return false
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  const atualizar = useCallback(async (id: number, data: VisitaRequest): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      const atualizada = await atualizarVisita(id, data)
      setVisitas(prev => prev.map(v => v.id === id ? atualizada : v))
      return true
    } catch {
      setError('Erro ao atualizar visita.')
      return false
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  const remover = useCallback(async (id: number): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      await deletarVisita(id)
      setVisitas(prev => prev.filter(v => v.id !== id))
      return true;
    } catch {
      setError('Erro ao remover visita.')
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  const agendadas  = visitas.filter(v => v.status === 'Agendada')
  const realizadas = visitas.filter(v => v.status === 'Realizada')
  const canceladas = visitas.filter(v => v.status === 'Cancelada')

  return { visitas, agendadas, realizadas, canceladas, clientes, loading, isMutating, error, adicionar, atualizar, remover }
}

