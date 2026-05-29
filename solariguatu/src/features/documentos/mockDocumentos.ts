export type DocStatus = 'Enviado' | 'Assinado' | 'Pendente Assinatura'

export interface Documento {
  id: string
  nomeArquivo: string
  clienteAssociado: string
  contratoId: string
  dataEnvio: string
  tamanhoKb: number
  status: DocStatus
}

export const mockDocumentos: Documento[] = [
  {
    id: 'DOC-001',
    nomeArquivo: 'Contrato_FazendaBoaEsperanca_CT00124.pdf',
    clienteAssociado: 'Fazenda Boa Esperança',
    contratoId: 'CT-00124',
    dataEnvio: '2025-12-02',
    tamanhoKb: 512,
    status: 'Assinado',
  },
  {
    id: 'DOC-002',
    nomeArquivo: 'Proposta_JoaoPedroAlves_CT00123.pdf',
    clienteAssociado: 'João Pedro Alves',
    contratoId: 'CT-00123',
    dataEnvio: '2025-12-03',
    tamanhoKb: 284,
    status: 'Pendente Assinatura',
  },
  {
    id: 'DOC-003',
    nomeArquivo: 'Contrato_SupermercadoQuixere_CT00122.pdf',
    clienteAssociado: 'Supermercado Quixeré',
    contratoId: 'CT-00122',
    dataEnvio: '2025-11-29',
    tamanhoKb: 630,
    status: 'Enviado',
  },
  {
    id: 'DOC-004',
    nomeArquivo: 'Laudo_Tecnico_PostoIpiranga_CT00120.pdf',
    clienteAssociado: 'Posto Ipiranga Centro',
    contratoId: 'CT-00120',
    dataEnvio: '2025-11-26',
    tamanhoKb: 198,
    status: 'Assinado',
  },
  {
    id: 'DOC-005',
    nomeArquivo: 'Contrato_EscolaMunicipal_CT00118.pdf',
    clienteAssociado: 'Escola Municipal Iguatu',
    contratoId: 'CT-00118',
    dataEnvio: '2025-11-19',
    tamanhoKb: 445,
    status: 'Pendente Assinatura',
  },
  {
    id: 'DOC-006',
    nomeArquivo: 'Proposta_AgropecuariaSaoBento_CT00116.pdf',
    clienteAssociado: 'Agropecuária São Bento',
    contratoId: 'CT-00116',
    dataEnvio: '2025-11-11',
    tamanhoKb: 750,
    status: 'Enviado',
  },
]
