package com.minhavendas.vendas.dto.response;

/**
 * DTO de resposta do Onboarding.
 * Retorna ao frontend os dados essenciais para redirecionar o usuário
 * ao dashboard logo após o cadastro (sem exigir um segundo login).
 */
public class OnboardingResponse {

    private Integer tenantId;
    private String nomeEmpresa;
    private String subscriptionStatus;

    private Integer vendedorId;
    private String nomeVendedor;
    private String email;

    /** Mensagem para o usuário informando os próximos passos. */
    private String mensagem;

    // Getters e Setters
    public Integer getTenantId() { return tenantId; }
    public void setTenantId(Integer tenantId) { this.tenantId = tenantId; }

    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }

    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public Integer getVendedorId() { return vendedorId; }
    public void setVendedorId(Integer vendedorId) { this.vendedorId = vendedorId; }

    public String getNomeVendedor() { return nomeVendedor; }
    public void setNomeVendedor(String nomeVendedor) { this.nomeVendedor = nomeVendedor; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
}
