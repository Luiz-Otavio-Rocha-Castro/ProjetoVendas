import { api } from '../api'

export interface NotificacaoResponse {
  id: number
  titulo: string
  mensagem: string
  lida: boolean
  dataCriacao: string
}

export const notificacoesService = {
  listarTodas: async (): Promise<NotificacaoResponse[]> => {
    const response = await api.get('/api/notificacoes')
    return response.data
  },

  marcarComoLida: async (id: number): Promise<void> => {
    await api.put(`/api/notificacoes/${id}/ler`)
  }
}
