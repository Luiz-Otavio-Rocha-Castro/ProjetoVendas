import { api } from '../api'

export interface VisitaResponse {
  id: number
  nomeProspecto: string
  endereco: string
  dataVisita: string
  cpfCnpj?: string | null
  anotacoes: string | null
  status: 'Agendada' | 'Realizada' | 'Cancelada'
}

export interface VisitaRequest {
  nomeProspecto: string
  endereco: string
  dataVisita: string
  cpfCnpj?: string
  anotacoes?: string
  status: string
}

export async function listarVisitas(): Promise<VisitaResponse[]> {
  const resp = await api.get<VisitaResponse[]>('/api/visitas')
  return resp.data
}

export async function adicionarVisita(data: VisitaRequest): Promise<VisitaResponse> {
  const resp = await api.post<VisitaResponse>('/api/visitas', data)
  return resp.data
}

export async function atualizarVisita(id: number, data: VisitaRequest): Promise<VisitaResponse> {
  const resp = await api.put<VisitaResponse>(`/api/visitas/${id}`, data)
  return resp.data
}

export async function deletarVisita(id: number): Promise<void> {
  await api.delete(`/api/visitas/${id}`)
}
