import { Contrato } from '../../features/vendas/mockVendas';
import { api } from '../api';

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

interface ClienteResponse{
    id : number;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
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


interface CadastroCompletoJavaResponse{
  cliente: ClienteResponse;
  venda: VendaResponseJava;
}


// 2. A função do service que busca e "traduz" os dados para o React
export async function obterVendas(): Promise<Contrato[]> {
  try {
    const [resposta, clientes] = await Promise.all([
      api.get<VendaResponseJava[]>('/api/venda'),
      api.get<ClienteResponse[]>('/api/vendas-cliente')
    ]);

    const dadosJava = resposta.data;
    const dadosJavaCliente = clientes.data;
    
    // AQUI CRIA A LISTA CADASTRO COMPLETO UNIFICANDO OS DADOS
    const listaDeContratos: CadastroCompletoJavaResponse[] = dadosJava.map(venda => {
      const clienteEncontrado = dadosJavaCliente.find(
        (cliente) => cliente.nome === venda.clienteNome
      );

      return {
        venda: venda,
        cliente: clienteEncontrado || {
          id: 0,
          nome: venda.clienteNome || "Cliente Desconhecido",
          cpf: "000.000.000-00",
          telefone: "N/A",
          endereco: "N/A"
        }
      };
    });

    // 3. Mapeamos (traduzimos) os campos do Java para os campos do React
    return listaDeContratos.map(contrato => ({
      id: `CT-${String(contrato.venda.id).padStart(5, '0')}`, // Transforma o ID numérico do banco em "CT-00001"
      cliente: contrato.venda.clienteNome || 'Cliente Não Informado',
      cpfCnpj:  contrato.cliente.cpf ||'00.000.000/0001-00', // Campo padrão caso não venha do banco
      telefone: contrato.cliente.telefone || '(88) 99999-9999',
      cidade: contrato.cliente.endereco ||'Iguatu',
      produto: contrato.venda.produto,
      kwp: (contrato.venda.quantidadePainel || 0) * 0.55,
      valorTotal: contrato.venda.valorTotal,
      comissao: contrato.venda.valorComissao || ((contrato.venda.percentualComissao || 0) * (contrato.venda.valorTotal || 0) / 100) || 0,
      saldoDevedor: contrato.venda.saldoDevedor || 0,
      // Garante que o status do Java (ex: 'APROVADO') bata com o esperado pelo React (ex: 'Aprovado')
      status: normalizarStatus(contrato.venda.status),
      dataCriacao: contrato.venda.dataVenda || new Date().toISOString().split('T')[0],
      paineis: contrato.venda.quantidadePainel || 0,
      financiamento: normalizarFinanciamento(contrato.venda.formaPagamento)
    }));
  } catch (error) {
    console.error("Erro ao carregar contratos:", error);
    throw new Error("Erro ao carregar contratos do servidor.");
  }
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

  try {
    const resposta = await api.post('/api/venda', requestPayload);
    const respostaJson = resposta.data;

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
  } catch (error) {
    console.error("Erro ao salvar a nova venda no servidor:", error);
    throw new Error("Erro ao salvar a nova venda no servidor.");
  }
}

export async function atualizarVenda(idDoContrato: number, dados: any): Promise<any> {
  // 1. Montamos o payload exatamente como o seu Java espera receber (CadastroContratoCompletoRequest)
  const requestPayload = {
    cliente: {
      nome: dados.cliente,
      cpf: dados.cpfCnpj,
      telefone: dados.telefone,
      endereco: dados.cidade // Ajuste se no Java for 'cidade' ou 'endereco'
    },
    venda: {
      produto: dados.produto,
      quantidadePainel: dados.paineis,
      status: dados.status,
      saldoDevedor: dados.saldoDevedor,
      valorTotal: dados.valorTotal,
      percentualComissao: dados.valorTotal > 0 ? (dados.comissao / dados.valorTotal) * 100 : 5,
      formaPagamento: dados.financiamento
    }
  };

  try {
    // 2. Fazemos a requisição PUT enviando o ID na URL
    const resposta = await api.put(`/api/venda/${idDoContrato}`, requestPayload);
    const respostaJson = resposta.data;

    // 3. Pegamos o retorno do Java (que pode vir unificado ou direto)
    const vendaSalva = respostaJson.venda || respostaJson;
    const clienteSalvo = respostaJson.cliente || {};

    // 4. Traduzimos de volta para o formato que as telas do seu React entendem
    return {
      id: `CT-${String(vendaSalva.id).padStart(5, '0')}`,
      cliente: clienteSalvo.nome || vendaSalva.clienteNome || dados.cliente,
      cpfCnpj: clienteSalvo.cpf || dados.cpfCnpj,
      telefone: clienteSalvo.telefone || dados.telefone,
      cidade: clienteSalvo.endereco || dados.cidade,
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
  } catch (error) {
    console.error("Erro ao atualizar a venda no servidor:", error);
    throw new Error("Erro ao atualizar a venda no servidor.");
  }
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

export async function deletarVenda(idDoContrato: number): Promise<void> {
  try {
    await api.delete(`/api/venda/${idDoContrato}`);
  } catch (error) {
    console.error("Erro ao deletar a venda no servidor:", error);
    throw new Error("Erro ao deletar a venda no servidor.");
  }
}

