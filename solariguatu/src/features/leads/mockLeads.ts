export type LeadStatus = 'Prospecção' | 'Em Negociação' | 'Proposta Enviada'

export interface Lead {
  id: string
  cliente: string
  telefone: string
  cidade: string
  kwp: number
  valorProposta: number
  status: LeadStatus
  dataContato: string
  origem: 'Indicação' | 'Instagram' | 'WhatsApp' | 'Visita' | 'Google'
  observacao?: string
}

export const mockLeads: Lead[] = [
  {
    id: 'LD-001',
    cliente: 'Raimundo Nonato Filho',
    telefone: '(88) 99201-4432',
    cidade: 'Iguatu',
    kwp: 6.6,
    valorProposta: 22400,
    status: 'Prospecção',
    dataContato: '2025-12-20',
    origem: 'WhatsApp',
    observacao: 'Interessado em financiamento BNDES',
  },
  {
    id: 'LD-002',
    cliente: 'Tereza Cristina Lopes',
    telefone: '(88) 98851-7721',
    cidade: 'Cedro',
    kwp: 3.85,
    valorProposta: 13100,
    status: 'Prospecção',
    dataContato: '2025-12-19',
    origem: 'Indicação',
  },
  {
    id: 'LD-003',
    cliente: 'Posto Estrela do Norte',
    telefone: '(88) 99300-8890',
    cidade: 'Quixeré',
    kwp: 28.6,
    valorProposta: 94000,
    status: 'Em Negociação',
    dataContato: '2025-12-15',
    origem: 'Visita',
    observacao: 'Aguardando aprovação do proprietário',
  },
  {
    id: 'LD-004',
    cliente: 'Clínica Ortopédica Iguatu',
    telefone: '(88) 99410-2233',
    cidade: 'Iguatu',
    kwp: 11.0,
    valorProposta: 37000,
    status: 'Em Negociação',
    dataContato: '2025-12-14',
    origem: 'Google',
    observacao: 'Segunda visita agendada para sexta',
  },
  {
    id: 'LD-005',
    cliente: 'Armazém da Família Silva',
    telefone: '(88) 99600-5544',
    cidade: 'Acopiara',
    kwp: 4.4,
    valorProposta: 14900,
    status: 'Em Negociação',
    dataContato: '2025-12-10',
    origem: 'Instagram',
  },
  {
    id: 'LD-006',
    cliente: 'Escola Particular São Lucas',
    telefone: '(88) 99155-0011',
    cidade: 'Iguatu',
    kwp: 18.7,
    valorProposta: 62500,
    status: 'Proposta Enviada',
    dataContato: '2025-12-08',
    origem: 'Indicação',
    observacao: 'Proposta enviada, aguardando retorno da diretoria',
  },
  {
    id: 'LD-007',
    cliente: 'Fazenda Palmeira Verde',
    telefone: '(88) 99802-6677',
    cidade: 'Orós',
    kwp: 44.0,
    valorProposta: 143000,
    status: 'Proposta Enviada',
    dataContato: '2025-12-05',
    origem: 'Visita',
    observacao: 'Grande projeto – precisa de BNDES rural',
  },
  {
    id: 'LD-008',
    cliente: 'Mercadinho Bom Preço',
    telefone: '(88) 99233-1198',
    cidade: 'Jucás',
    kwp: 5.5,
    valorProposta: 18700,
    status: 'Proposta Enviada',
    dataContato: '2025-12-01',
    origem: 'WhatsApp',
  },
]
