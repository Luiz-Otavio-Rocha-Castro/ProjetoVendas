import { useState, useCallback, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from './useAuth'

export interface PerfilVendedor {
  nome: string
  email: string
  regiao: string
  avatar: string
  metaReais: number
  metaKwp: number
  faturamentoAtual: number
  kwpAtual: number
  contratosAtual: number
  fotoUrl: string
}

const PERFIL_INICIAL: PerfilVendedor = {
  nome: '',
  email: '',
  regiao: '',
  avatar: 'V',
  metaReais: 0,
  metaKwp: 0,
  faturamentoAtual: 0,
  kwpAtual: 0,
  contratosAtual: 0,
  fotoUrl: ''
}

export function usePerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<PerfilVendedor>(PERFIL_INICIAL)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      setLoading(true)
      api.get(`/api/vendas-vendedor/${user.id}`)
        .then(response => {
          const data = response.data
          const nomeVendedor = data.nome || 'Vendedor'
          const partesNome = nomeVendedor.trim().split(' ')
          const avatar = partesNome.length > 1
            ? (partesNome[0][0] + partesNome[1][0]).toUpperCase()
            : nomeVendedor.substring(0, 2).toUpperCase()

          setPerfil(prev => ({
            ...prev,
            nome: data.nome || '',
            email: data.email || '',
            regiao: data.regiaoAtuacao || '',
            metaReais: data.metaMensal || 0,
            metaKwp: data.metaKwp || 0,
            faturamentoAtual: data.faturamentoAtual || 0,
            kwpAtual: data.kwpAtual || 0,
            contratosAtual: data.contratosAtual || 0,
            fotoUrl: `${api.defaults.baseURL || 'http://localhost:8080'}/api/vendas-vendedor/${user.id}/foto`,
            avatar,
          }))
        })
        .catch(err => console.error('Erro ao buscar perfil:', err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const updatePerfil = useCallback(
    async (dados: Partial<PerfilVendedor> & { senha?: string, senhaAntiga?: string }): Promise<void> => {
      if (!user?.id) return
      setSaving(true)
      try {
        const payload = {
          nome: dados.nome !== undefined ? dados.nome : perfil.nome,
          email: dados.email !== undefined ? dados.email : perfil.email,
          regiaoAtuacao: dados.regiao !== undefined ? dados.regiao : perfil.regiao,
          metaMensal: dados.metaReais !== undefined ? dados.metaReais : perfil.metaReais,
          metaKwp: dados.metaKwp !== undefined ? dados.metaKwp : perfil.metaKwp,
          senha: dados.senha,
          senhaAntiga: dados.senhaAntiga
        }

        const response = await api.put(`/api/vendas-vendedor/${user.id}`, payload)
        const updatedData = response.data

        const nomeVendedor = updatedData.nome || 'Vendedor'
        const partesNome = nomeVendedor.trim().split(' ')
        const avatar = partesNome.length > 1
          ? (partesNome[0][0] + partesNome[1][0]).toUpperCase()
          : nomeVendedor.substring(0, 2).toUpperCase()

        setPerfil(prev => ({
          ...prev,
          nome: updatedData.nome,
          email: updatedData.email,
          regiao: updatedData.regiaoAtuacao || '',
          metaReais: updatedData.metaMensal || 0,
          metaKwp: updatedData.metaKwp || 0,
          avatar
        }))
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        throw error
      } finally {
        setSaving(false)
      }
    },
    [user?.id, perfil]
  )

  const uploadFoto = useCallback(async (file: File) => {
    if (!user?.id) return
    const formData = new FormData()
    formData.append('foto', file)
    try {
      await api.post(`/api/vendas-vendedor/${user.id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Force image refresh by appending timestamp
      setPerfil(prev => ({ ...prev, fotoUrl: `${api.defaults.baseURL || 'http://localhost:8080'}/api/vendas-vendedor/${user.id}/foto?t=${new Date().getTime()}` }))
    } catch (error) {
      console.error('Erro ao enviar foto', error)
      throw error
    }
  }, [user?.id])

  return { perfil, saving, loading, updatePerfil, uploadFoto }
}
