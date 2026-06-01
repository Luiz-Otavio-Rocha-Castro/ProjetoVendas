import { Contrato } from '../../features/vendas/mockVendas';

// 1. Criamos a representação exata do que o seu Java (VendaResponse.java) envia
interface VendaResponseJava {
  id: number;
  produto: string;
  quantidadePainel: number;
  status: string;
  saldoDevedor: number;
  dataVenda: string; // formato "YYYY-MM-DD"
  valorTotal: number;
  percentualComissao: number;
  valorComissao: number; // ou ValorComissao dependendo da serialização
  formaPagamento: string;
  clienteNome: string;
}

// Representação do que enviamos para o Java (VendaRequest.java)
interface VendaRequestJava {
  produto: string;
  quantidadePainel: number;
  status: string;
  saldoDevedor: number;
  valorTotal: number;
  percentualComissao: number;
  formaPagamento: string;
}

// Representação do objeto completo que o backend espera no POST
interface CadastroCompletoRequestJava {
  cliente: {
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
  };
  venda: VendaRequestJava;
}


// 2. A função do service que busca e "traduz" os dados para o React
export async function obterVendas(): Promise<Contrato[]> {
  const resposta = await fetch("http://localhost:8080/api/venda");

  if (!resposta.ok) {
    throw new Error("Erro ao carregar contratos do servidor.");
  }

  const dadosJava: VendaResponseJava[] = await resposta.json();

  // 3. Mapeamos (traduzimos) os campos do Java para os campos do React
  return dadosJava.map(venda => ({
    id: `CT-${String(venda.id).padStart(5, '0')}`, // Transforma o ID numérico do banco em "CT-00001"
    cliente: venda.clienteNome || 'Cliente Não Informado',
    cpfCnpj: '00.000.000/0001-00', // Campo padrão caso não venha do banco
    telefone: '(88) 99999-9999',
    cidade: 'Iguatu',
    produto: venda.produto,
    kwp: 5.5, // Exemplo de valor padrão para painéis
    valorTotal: venda.valorTotal,
    comissao: venda.valorComissao || 0,
    saldoDevedor: venda.saldoDevedor || 0,
    // Garante que o status do Java (ex: 'APROVADO') bata com o esperado pelo React (ex: 'Aprovado')
    status: normalizarStatus(venda.status),
    dataCriacao: venda.dataVenda || new Date().toISOString().split('T')[0],
    paineis: venda.quantidadePainel || 0,
    financiamento: normalizarFinanciamento(venda.formaPagamento)
  }));
}

// Função para cadastrar uma nova venda via POST
export async function cadastrarVenda(dados: Omit<Contrato, 'id' | 'dataCriacao'>): Promise<Contrato> {
  // Prepara o payload no formato que o backend (CadastroCompleto) espera
  const requestPayload: CadastroCompletoRequestJava = {
    cliente: {
      nome: dados.cliente,
      cpf: dados.cpfCnpj,
      telefone: dados.telefone,
      endereco: dados.cidade,
    },
    venda: {
      produto: dados.produto,
      quantidadePainel: dados.paineis,
      status: dados.status.toUpperCase(), // Backend parece esperar string (talvez em uppercase)
      saldoDevedor: dados.saldoDevedor,
      valorTotal: dados.valorTotal,
      percentualComissao: dados.valorTotal > 0 ? (dados.comissao / dados.valorTotal) * 100 : 5,
      formaPagamento: dados.financiamento,
    }
  };

  const resposta = await fetch("http://localhost:8080/api/venda", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  if (!resposta.ok) {
    throw new Error("Erro ao salvar a nova venda no servidor.");
  }

  const respostaJson = await resposta.json();

  // O backend pode retornar o CadastroCompleto (com .venda e .cliente) ou diretamente a Venda
  const vendaSalva = respostaJson.venda || respostaJson;
  const clienteSalvo = respostaJson.cliente || {};

  // Traduz o retorno do Java de volta para o formato do React
  return {
    id: `CT-${String(vendaSalva.id || Math.floor(Math.random() * 1000)).padStart(5, '0')}`,
    cliente: clienteSalvo.nome || vendaSalva.clienteNome || dados.cliente,
    cpfCnpj: dados.cpfCnpj,
    telefone: dados.telefone,
    cidade: dados.cidade,
    produto: vendaSalva.produto || dados.produto,
    kwp: dados.kwp,
    valorTotal: vendaSalva.valorTotal || dados.valorTotal,
    comissao: vendaSalva.valorComissao || dados.comissao,
    saldoDevedor: vendaSalva.saldoDevedor || dados.saldoDevedor,
    status: normalizarStatus(vendaSalva.status || dados.status),
    dataCriacao: vendaSalva.dataVenda || new Date().toISOString().split('T')[0],
    paineis: vendaSalva.quantidadePainel || dados.paineis,
    financiamento: normalizarFinanciamento(vendaSalva.formaPagamento || dados.financiamento)
  };
}

// Funções auxiliares simples para ajustar os textos padrão do banco para o padrão visual do React
function normalizarStatus(status: string | null | undefined): any {
  if (!status) return 'Concluído';
  const s = status.toLowerCase();
  if (s.includes('aprovado')) return 'Aprovado';
  if (s.includes('pendente')) return 'Pendente';
  if (s.includes('cancelado')) return 'Cancelado';
  if (s.includes('instalacao') || s.includes('instalação')) return 'Em Instalação';
  return 'Concluído';
}

function normalizarFinanciamento(forma: string | null | undefined): any {
  if (!forma) return 'Financiado';
  const f = forma.toLowerCase();
  if (f.includes('vista')) return 'À Vista';
  if (f.includes('bndes')) return 'BNDES';
  return 'Financiado';
}
