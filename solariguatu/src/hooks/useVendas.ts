import { useState, useCallback, useMemo, useEffect } from 'react'
import { type Contrato, type ContratoStatus } from '../features/vendas/mockVendas'
import { obterVendas, cadastrarVenda, atualizarVenda, deletarVenda } from '../services/vendas/vendaService'


export function useVendas() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
    // Busca os dados da sua API do Spring Boot
    obterVendas()
      .then((dadosReais) => {
        setContratos(dadosReais)
      })
      .catch((erro) => {
        console.error("Erro ao carregar contratos do backend:", erro)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const [busca, setBusca] = useState('')
  const [mesReferencia, setMesReferencia] = useState<Date>(new Date())
  const [pagina, setPagina] = useState(1)
  const itensPorPagina = 8

  const filtrados = useMemo(() => {
    return contratos.filter((c) => {
      const matchBusca =
        busca === '' ||
        c.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        c.id.toLowerCase().includes(busca.toLowerCase()) ||
        c.produto.toLowerCase().includes(busca.toLowerCase())

      const d = new Date(c.dataCriacao)
      const matchMes = 
        d.getMonth() === mesReferencia.getMonth() && 
        d.getFullYear() === mesReferencia.getFullYear()

      return matchBusca && matchMes
    })
  }, [contratos, busca, mesReferencia])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const itensPagina = filtrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  // Métricas gerais (sobre TODOS os contratos filtrados pelo mês)
  const totalVendas = useMemo(
    () => filtrados.reduce((s, c) => s + c.valorTotal, 0),
    [filtrados]
  )
  const totalComissao = useMemo(
    () => filtrados.reduce((s, c) => s + c.comissao, 0),
    [filtrados]
  )
  const contratosPendentes = useMemo(
    () => contratos.filter((c) => c.status === 'Pendente'),
    [contratos]
  )
  const totalSaldoDevedor = useMemo(
    () => contratosPendentes.reduce((s, c) => s + c.saldoDevedor, 0),
    [contratosPendentes]
  )

  const adicionarContrato = useCallback(async (dados: Omit<Contrato, 'id' | 'dataCriacao'>) => {
    try {
      // Chama o service para cadastrar no backend
      const novo = await cadastrarVenda(dados)
      // Atualiza o estado com o contrato que retornou do backend (com ID real)
      setContratos((prev) => [novo, ...prev])
      setPagina(1)
    } catch (erro) {
      console.error("Erro ao cadastrar contrato no backend:", erro)
      alert("Falha ao salvar a venda no sistema.")
    }
  }, [])

  const removerContrato = useCallback(async (id: string) => {
    try {
      const idNumerico = parseInt(id.replace(/\D/g, ''), 10);
      await deletarVenda(idNumerico);
      setContratos((prev) => prev.filter((c) => c.id !== id))
    } catch (erro) {
      console.error("Erro ao deletar contrato:", erro);
      alert("Falha ao deletar a venda.");
    }
  }, [])

  const editarContrato = useCallback(async (id: string, dados: Omit<Contrato, 'id' | 'dataCriacao'>) => {
    try {
      const idNumerico = parseInt(id.replace(/\D/g, ''), 10);
      const atualizado = await atualizarVenda(idNumerico, dados);
      setContratos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...atualizado } : c))
      )
    } catch (erro) {
      console.error("Erro ao atualizar contrato:", erro);
      alert("Falha ao atualizar a venda.");
    }
  }, [])

  return {
    contratos,
    isLoading,
    itensPagina,
    filtrados,
    busca,
    setBusca,
    mesReferencia,
    setMesReferencia: (d: Date) => { setMesReferencia(d); setPagina(1) },
    pagina: paginaAtual,
    setPagina,
    totalPaginas,
    adicionarContrato,
    removerContrato,
    editarContrato,
    total: filtrados.length,
    totalVendas,
    totalComissao,
    contratosPendentes,
    totalSaldoDevedor,
  }
}
