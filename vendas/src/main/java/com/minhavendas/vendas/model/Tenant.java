package com.minhavendas.vendas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Representa uma Empresa (Tenant) que assina o sistema "Minhas Vendas".
 * No modelo Multi-Tenant, cada empresa tem seus dados completamente isolados
 * de outras empresas dentro do mesmo banco de dados.
 */
@Entity
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String nomeEmpresa;

    @Column(unique = true)
    private String cnpj;

    /**
     * Status da assinatura. Possíveis valores:
     * - ACTIVE: Assinatura ativa, acesso liberado.
     * - TRIAL: Período de teste.
     * - INACTIVE: Pagamento pendente, acesso restrito.
     * - CANCELED: Assinatura cancelada.
     */
    @Column(nullable = false)
    private String subscriptionStatus = "TRIAL";

    private String stripeCustomerId; // ID do cliente no gateway de pagamento (Passo 3)

    @Column(columnDefinition = "TEXT")
    private String logoUrl; // URL da logo personalizada da empresa (White Label)

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public String getStripeCustomerId() { return stripeCustomerId; }
    public void setStripeCustomerId(String stripeCustomerId) { this.stripeCustomerId = stripeCustomerId; }
}
