export type ContratoStatus = 'Pendente' | 'Aprovado' | 'Cancelado' | 'Em Instalação' | 'Concluído'

export interface Contrato {
  id: string
  cliente: string
  cpfCnpj: string
  telefone: string
  cidade: string
  vendedor: string
  kwp: number
  valorTotal: number
  status: ContratoStatus
  dataCriacao: string
  paineis: number
  financiamento: 'Financiado' | 'À Vista' | 'BNDES'
}

// Todos os contratos pertencem ao vendedor logado: Lucas Araújo
export const mockContratos: Contrato[] = [
  { id: 'CT-00124', cliente: 'Fazenda Boa Esperança',  cpfCnpj: '12.345.678/0001-90', telefone: '(88) 99801-2345', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 28.6, valorTotal: 95000,  status: 'Concluído',     dataCriacao: '2025-12-01', paineis: 52, financiamento: 'BNDES' },
  { id: 'CT-00123', cliente: 'João Pedro Alves',       cpfCnpj: '045.678.901-23',     telefone: '(88) 99712-0001', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 5.5,  valorTotal: 18700,  status: 'Aprovado',      dataCriacao: '2025-12-02', paineis: 10, financiamento: 'Financiado' },
  { id: 'CT-00122', cliente: 'Supermercado Quixeré',   cpfCnpj: '98.765.432/0001-11', telefone: '(88) 99650-4321', cidade: 'Quixeré',  vendedor: 'Lucas Araújo', kwp: 14.3, valorTotal: 47000,  status: 'Em Instalação', dataCriacao: '2025-11-28', paineis: 26, financiamento: 'BNDES' },
  { id: 'CT-00121', cliente: 'Maria das Graças Lima',  cpfCnpj: '321.654.987-00',     telefone: '(88) 98800-5678', cidade: 'Cedro',     vendedor: 'Lucas Araújo', kwp: 3.3,  valorTotal: 11200,  status: 'Pendente',      dataCriacao: '2025-11-30', paineis: 6,  financiamento: 'Financiado' },
  { id: 'CT-00120', cliente: 'Posto Ipiranga Centro',  cpfCnpj: '11.223.344/0001-55', telefone: '(88) 99301-1122', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 18.7, valorTotal: 61000,  status: 'Aprovado',      dataCriacao: '2025-11-25', paineis: 34, financiamento: 'À Vista' },
  { id: 'CT-00119', cliente: 'André Luis Rodrigues',   cpfCnpj: '789.012.345-67',     telefone: '(88) 99500-7890', cidade: 'Icó',       vendedor: 'Lucas Araújo', kwp: 6.6,  valorTotal: 22400,  status: 'Cancelado',     dataCriacao: '2025-11-20', paineis: 12, financiamento: 'Financiado' },
  { id: 'CT-00118', cliente: 'Escola Municipal Iguatu',cpfCnpj: '44.556.677/0001-88', telefone: '(88) 99200-4455', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 8.8,  valorTotal: 29700,  status: 'Aprovado',      dataCriacao: '2025-11-18', paineis: 16, financiamento: 'BNDES' },
  { id: 'CT-00117', cliente: 'Carlos Eduardo Braga',   cpfCnpj: '567.890.123-45',     telefone: '(88) 99111-5678', cidade: 'Acopiara',  vendedor: 'Lucas Araújo', kwp: 4.4,  valorTotal: 14900,  status: 'Pendente',      dataCriacao: '2025-11-15', paineis: 8,  financiamento: 'À Vista' },
  { id: 'CT-00116', cliente: 'Agropecuária São Bento', cpfCnpj: '77.889.900/0001-22', telefone: '(88) 99050-7788', cidade: 'Orós',      vendedor: 'Lucas Araújo', kwp: 22.0, valorTotal: 72000,  status: 'Em Instalação', dataCriacao: '2025-11-10', paineis: 40, financiamento: 'BNDES' },
  { id: 'CT-00115', cliente: 'Hotel Serra Verde',      cpfCnpj: '33.445.566/0001-99', telefone: '(88) 99900-3344', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 11.0, valorTotal: 36000,  status: 'Concluído',     dataCriacao: '2025-11-05', paineis: 20, financiamento: 'À Vista' },
  { id: 'CT-00114', cliente: 'Francisco Bezerra Neto', cpfCnpj: '123.456.789-01',     telefone: '(88) 99600-1234', cidade: 'Cariús',    vendedor: 'Lucas Araújo', kwp: 3.85, valorTotal: 13100,  status: 'Cancelado',     dataCriacao: '2025-11-01', paineis: 7,  financiamento: 'Financiado' },
  { id: 'CT-00113', cliente: 'Padaria Estrela do Sol', cpfCnpj: '55.667.788/0001-33', telefone: '(88) 99750-5566', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 5.5,  valorTotal: 18700,  status: 'Aprovado',      dataCriacao: '2025-10-28', paineis: 10, financiamento: 'Financiado' },
  { id: 'CT-00112', cliente: 'Ana Carolina Ferreira',  cpfCnpj: '890.123.456-78',     telefone: '(88) 99400-8901', cidade: 'Jucás',     vendedor: 'Lucas Araújo', kwp: 5.5,  valorTotal: 18700,  status: 'Aprovado',      dataCriacao: '2025-10-25', paineis: 10, financiamento: 'À Vista' },
  { id: 'CT-00111', cliente: 'Condomínio Residencial', cpfCnpj: '22.334.455/0001-77', telefone: '(88) 99850-2233', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 16.5, valorTotal: 54000,  status: 'Em Instalação', dataCriacao: '2025-10-20', paineis: 30, financiamento: 'BNDES' },
  { id: 'CT-00110', cliente: 'Sebastião Moura Lima',   cpfCnpj: '456.789.012-34',     telefone: '(88) 99550-4567', cidade: 'Quixeré',  vendedor: 'Lucas Araújo', kwp: 4.95, valorTotal: 16800,  status: 'Pendente',      dataCriacao: '2025-10-18', paineis: 9,  financiamento: 'Financiado' },
  { id: 'CT-00109', cliente: 'Clínica Saúde Plena',    cpfCnpj: '66.778.899/0001-44', telefone: '(88) 99350-6677', cidade: 'Iguatu',    vendedor: 'Lucas Araújo', kwp: 7.7,  valorTotal: 25600,  status: 'Concluído',     dataCriacao: '2025-10-15', paineis: 14, financiamento: 'À Vista' },
]

export const CIDADES = ['Iguatu','Quixeré','Cedro','Orós','Icó','Acopiara','Cariús','Jucás']
export const STATUS_OPTIONS: ContratoStatus[] = ['Pendente','Aprovado','Cancelado','Em Instalação','Concluído']
