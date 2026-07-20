import { useState, useCallback, useMemo, useEffect } from 'react'
import { type Contrato, type ContratoStatus } from '../features/vendas/mockVendas'
import { obterVendas, cadastrarVenda, atualizarVenda, deletarVenda } from '../services/vendas/vendaService'


export function useVendas() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    obterVendas()
      .then((dadosReais) => {
        if (isMounted) setContratos(dadosReais);
      })
      .catch((erro) => {
        if (isMounted) {
          console.error("Erro ao carregar contratos:", erro);
          setError("Falha ao carregar vendas da API.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
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

  const adicionarContrato = useCallback(async (dados: Omit<Contrato, 'id' | 'dataCriacao'>): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      const novo = await cadastrarVenda(dados)
      setContratos((prev) => [novo, ...prev])
      setPagina(1)
      return true;
    } catch (erro) {
      console.error("Erro ao cadastrar contrato:", erro)
      setError("Falha ao salvar a venda no sistema.")
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  const removerContrato = useCallback(async (id: string): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      const idNumerico = parseInt(id.replace(/\D/g, ''), 10);
      await deletarVenda(idNumerico);
      setContratos((prev) => prev.filter((c) => c.id !== id))
      return true;
    } catch (erro) {
      console.error("Erro ao deletar contrato:", erro);
      setError("Falha ao deletar a venda.");
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  const editarContrato = useCallback(async (id: string, dados: Omit<Contrato, 'id' | 'dataCriacao'>): Promise<boolean> => {
    if (isMutating) return false;
    setIsMutating(true);
    try {
      const idNumerico = parseInt(id.replace(/\D/g, ''), 10);
      const atualizado = await atualizarVenda(idNumerico, dados);
      setContratos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...atualizado } : c))
      )
      return true;
    } catch (erro) {
      console.error("Erro ao atualizar contrato:", erro);
      setError("Falha ao atualizar a venda.");
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating])

  return {
    contratos,
    isLoading,
    isMutating,
    error,
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
