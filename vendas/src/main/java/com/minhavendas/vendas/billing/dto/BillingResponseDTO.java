package com.minhavendas.vendas.billing.dto;

/**
 * DTO de resposta para operações de billing.
 * Retornado pelo SubscriptionService para o Controller comunicar o resultado ao gateway ou ao cliente.
 */
public class BillingResponseDTO {

    private boolean sucesso;
    private String mensagem;
    private String subscriptionStatus;

    public BillingResponseDTO(boolean sucesso, String mensagem, String subscriptionStatus) {
        this.sucesso = sucesso;
        this.mensagem = mensagem;
        this.subscriptionStatus = subscriptionStatus;
    }

    public static BillingResponseDTO ok(String mensagem, String status) {
        return new BillingResponseDTO(true, mensagem, status);
    }

    public static BillingResponseDTO erro(String mensagem) {
        return new BillingResponseDTO(false, mensagem, null);
    }

    // Getters
    public boolean isSucesso() { return sucesso; }
    public String getMensagem() { return mensagem; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
}
