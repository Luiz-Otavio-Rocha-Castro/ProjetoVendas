package com.minhavendas.vendas.dto.request;

/**
 * DTO do formulário de cadastro (Signup Flow).
 *
 * Captura em uma única requisição os dados do primeiro usuário (Administrador)
 * e os dados da empresa que está assinando o sistema.
 *
 * O backend garante que Vendedor + Tenant sejam criados atomicamente
 * em uma única transação de banco de dados.
 */
public class OnboardingRequest {

    // --- Dados da Empresa (Tenant) ---
    private String nomeEmpresa;
    private String cnpj; // Opcional, mas recomendado para NF e cobrança

    // --- Dados do Primeiro Usuário (Admin da Empresa) ---
    private String nomeVendedor;
    private String email;
    private String senha;
    private String regiaoAtuacao;

    // Getters e Setters
    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getNomeVendedor() { return nomeVendedor; }
    public void setNomeVendedor(String nomeVendedor) { this.nomeVendedor = nomeVendedor; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getRegiaoAtuacao() { return regiaoAtuacao; }
    public void setRegiaoAtuacao(String regiaoAtuacao) { this.regiaoAtuacao = regiaoAtuacao; }
}
