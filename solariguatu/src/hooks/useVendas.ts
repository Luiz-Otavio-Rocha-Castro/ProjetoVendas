import { useState, useCallback, useMemo } from 'react'
import { mockContratos, type Contrato, type ContratoStatus } from '../features/vendas/mockVendas'

export function useVendas() {
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<ContratoStatus | 'Todos'>('Todos')
  const [pagina, setPagina] = useState(1)
  const itensPorPagina = 8

  const filtrados = useMemo(() => {
    return contratos.filter((c) => {
      const matchBusca =
        busca === '' ||
        c.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        c.id.toLowerCase().includes(busca.toLowerCase())
      const matchStatus = filtroStatus === 'Todos' || c.status === filtroStatus
      return matchBusca && matchStatus
    })
  }, [contratos, busca, filtroStatus])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const itensPagina = filtrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  const adicionarContrato = useCallback((dados: Omit<Contrato, 'id' | 'dataCriacao'>) => {
    const novo: Contrato = {
      ...dados,
      id: `CT-${String(Date.now()).slice(-5)}`,
      dataCriacao: new Date().toISOString().split('T')[0],
    }
    setContratos((prev) => [novo, ...prev])
    setPagina(1)
  }, [])

  return {
    contratos,
    itensPagina,
    filtrados,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus: (s: ContratoStatus | 'Todos') => { setFiltroStatus(s); setPagina(1) },
    pagina: paginaAtual,
    setPagina,
    totalPaginas,
    adicionarContrato,
    total: filtrados.length,
  }
}
