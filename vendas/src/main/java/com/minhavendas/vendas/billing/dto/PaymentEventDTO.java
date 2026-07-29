package com.minhavendas.vendas.billing.dto;

/**
 * DTO para registrar o resultado de um evento de pagamento
 * que chega via webhook do gateway (ex: Stripe, Asaas, Mercado Pago).
 */
public class PaymentEventDTO {

    /** ID do evento gerado pelo gateway (para idempotência). Ex: "evt_1Pq2abc..." */
    private String gatewayEventId;

    /**
     * Tipo do evento enviado pelo gateway.
     * Exemplos Stripe: "invoice.payment_succeeded", "invoice.payment_failed", "customer.subscription.deleted"
     * Exemplos Asaas: "PAYMENT_CONFIRMED", "PAYMENT_OVERDUE", "SUBSCRIPTION_DELETED"
     */
    private String eventType;

    /** ID do cliente no gateway de pagamento (ex: "cus_Nffrts...") */
    private String gatewayCustomerId;

    /** Valor pago, em centavos (ou unidade da moeda sem decimal) */
    private Long amountPaid;

    /** Moeda do pagamento (ex: "brl", "usd") */
    private String currency;

    // Getters e Setters
    public String getGatewayEventId() { return gatewayEventId; }
    public void setGatewayEventId(String gatewayEventId) { this.gatewayEventId = gatewayEventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getGatewayCustomerId() { return gatewayCustomerId; }
    public void setGatewayCustomerId(String gatewayCustomerId) { this.gatewayCustomerId = gatewayCustomerId; }

    public Long getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Long amountPaid) { this.amountPaid = amountPaid; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
