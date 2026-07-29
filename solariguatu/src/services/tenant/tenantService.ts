import { api } from '../api'

export interface TenantConfigRequest {
  nomeEmpresa: string
}

export const tenantService = {
  atualizarConfig: async (data: TenantConfigRequest) => {
    const response = await api.put('/api/tenant/config', data)
    return response.data
  },
  
  uploadLogo: async (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)
    
    // Deixe o Axios calcular o Content-Type automaticamente para injetar o boundary
    const response = await api.post('/api/tenant/logo', formData)
    return response.data
  }
}
