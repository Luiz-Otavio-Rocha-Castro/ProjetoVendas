package com.minhavendas.vendas.billing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.billing.dto.BillingResponseDTO;
import com.minhavendas.vendas.billing.dto.PaymentEventDTO;
import com.minhavendas.vendas.model.Tenant;
import com.minhavendas.vendas.repository.TenantRepository;

/**
 * Serviço central de faturamento (Billing) do módulo SaaS.
 *
 * Responsabilidades:
 * 1. Criar/vincular um cliente no gateway de pagamentos (Stripe, Asaas, etc.)
 * 2. Processar webhooks de pagamento aprovado, atualizado e cancelado
 * 3. Bloquear/desbloquear o acesso com base no status da assinatura
 *
 * DESIGN: Este serviço é intencionalmente agnóstico ao gateway de pagamento.
 * A integração HTTP com Stripe/Asaas deve ficar em uma classe GatewayClient separada,
 * injetada aqui via @Autowired, facilitando a troca de gateway sem reescrever a lógica de negócio.
 */
@Service
public class SubscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);

    // Status possíveis para o campo subscription_status na tabela tenant
    public static final String STATUS_TRIAL    = "TRIAL";
    public static final String STATUS_ACTIVE   = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";  // Pagamento pendente/vencido
    public static final String STATUS_CANCELED = "CANCELED";  // Assinatura encerrada

    // Tipos de eventos do gateway (mapeados para o padrão interno)
    // Você pode criar um Enum para isso no futuro
    private static final String EVENT_PAYMENT_SUCCESS  = "PAYMENT_CONFIRMED";
    private static final String EVENT_PAYMENT_FAILED   = "PAYMENT_OVERDUE";
    private static final String EVENT_SUBSCRIPTION_DEL = "SUBSCRIPTION_DELETED";

    @Autowired
    private TenantRepository tenantRepository;

    // TODO: Injetar o client HTTP do seu gateway de pagamento aqui (Passo 3.5)
    // @Autowired
    // private GatewayPaymentClient gatewayClient;

    // =========================================================================
    // MÉTODO 1: Criar cliente no gateway de pagamentos
    // Chamado durante o Onboarding (Passo 4) ao criar uma nova empresa no sistema.
    // =========================================================================

    /**
     * Registra o Tenant como cliente no gateway de pagamentos e salva o ID retornado.
     * Este ID (ex: "cus_Nffrts...") é a chave de vínculo entre seu banco e o gateway.
     *
     * @param tenantId ID do Tenant já criado no banco de dados.
     * @return BillingResponseDTO com o resultado da operação.
     */
    @Transactional
    public BillingResponseDTO criarClienteNoGateway(Integer tenantId) {
        Tenant tenant = buscarTenantOuLancarErro(tenantId);

        if (tenant.getStripeCustomerId() != null) {
            logger.info("Tenant id={} já possui gatewayCustomerId={}. Operação ignorada.", tenantId, tenant.getStripeCustomerId());
            return BillingResponseDTO.ok("Cliente já cadastrado no gateway.", tenant.getSubscriptionStatus());
        }

        // TODO: Substituir pelo client real do gateway:
        // String gatewayId = gatewayClient.criarCliente(tenant.getNomeEmpresa(), tenant.getCnpj());
        String gatewayId = "cus_MOCK_" + tenantId; // Mock para compilar sem integração ativa

        tenant.setStripeCustomerId(gatewayId);
        tenantRepository.save(tenant);

        logger.info("Tenant id={} vinculado ao gateway com customerId={}.", tenantId, gatewayId);
        return BillingResponseDTO.ok("Cliente criado no gateway com sucesso.", tenant.getSubscriptionStatus());
    }

    // =========================================================================
    // MÉTODO 2: Processar webhook do gateway
    // Ponto de entrada de TODOS os eventos de pagamento (roteador de eventos).
    // =========================================================================

    /**
     * Recebe e roteia eventos de pagamento enviados pelo gateway via webhook.
     * O Controller chama este método após validar a assinatura do webhook.
     *
     * @param event DTO com os dados do evento recebido.
     * @return BillingResponseDTO com o novo status da assinatura.
     */
    @Transactional
    public BillingResponseDTO processarWebhook(PaymentEventDTO event) {
        logger.info("Webhook recebido: eventId={}, type={}, customer={}",
                event.getGatewayEventId(), event.getEventType(), event.getGatewayCustomerId());

        // Roteador de eventos: cada tipo de evento dispara uma ação de negócio
        return switch (event.getEventType()) {
            case EVENT_PAYMENT_SUCCESS  -> registrarPagamentoAprovado(event.getGatewayCustomerId());
            case EVENT_PAYMENT_FAILED   -> bloquearPorInadimplencia(event.getGatewayCustomerId());
            case EVENT_SUBSCRIPTION_DEL -> cancelarAssinatura(event.getGatewayCustomerId());
            default -> {
                logger.warn("Tipo de evento desconhecido recebido: {}", event.getEventType());
                yield BillingResponseDTO.ok("Evento recebido e ignorado (não mapeado).", null);
            }
        };
    }

    // =========================================================================
    // MÉTODOS INTERNOS DE AÇÃO (chamados pelo roteador de webhooks)
    // =========================================================================

    /**
     * Pagamento aprovado: Ativa o Tenant.
     * Chamado quando o gateway confirma que o boleto/cartão foi pago com sucesso.
     */
    private BillingResponseDTO registrarPagamentoAprovado(String gatewayCustomerId) {
        Tenant tenant = buscarTenantPorGatewayIdOuLancarErro(gatewayCustomerId);
        tenant.setSubscriptionStatus(STATUS_ACTIVE);
        tenantRepository.save(tenant);
        logger.info("Tenant id={} ATIVADO após pagamento aprovado.", tenant.getId());
        return BillingResponseDTO.ok("Assinatura ativada com sucesso.", STATUS_ACTIVE);
    }

    /**
     * Pagamento vencido/falhou: Bloqueia o Tenant.
     * Chamado quando a fatura vence sem pagamento.
     * O AuthFilterToken responderá 402 para usuários deste Tenant automaticamente.
     */
    private BillingResponseDTO bloquearPorInadimplencia(String gatewayCustomerId) {
        Tenant tenant = buscarTenantPorGatewayIdOuLancarErro(gatewayCustomerId);
        tenant.setSubscriptionStatus(STATUS_INACTIVE);
        tenantRepository.save(tenant);
        logger.warn("Tenant id={} BLOQUEADO por inadimplência.", tenant.getId());
        return BillingResponseDTO.ok("Assinatura marcada como inativa por inadimplência.", STATUS_INACTIVE);
    }

    /**
     * Assinatura cancelada: Desativa permanentemente o Tenant.
     * O acesso é bloqueado e os dados são mantidos por conformidade (LGPD).
     */
    private BillingResponseDTO cancelarAssinatura(String gatewayCustomerId) {
        Tenant tenant = buscarTenantPorGatewayIdOuLancarErro(gatewayCustomerId);
        tenant.setSubscriptionStatus(STATUS_CANCELED);
        tenantRepository.save(tenant);
        logger.info("Tenant id={} CANCELADO.", tenant.getId());
        return BillingResponseDTO.ok("Assinatura cancelada.", STATUS_CANCELED);
    }

    // =========================================================================
    // MÉTODOS UTILITÁRIOS PRIVADOS
    // =========================================================================

    private Tenant buscarTenantOuLancarErro(Integer tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tenant não encontrado: " + tenantId));
    }

    private Tenant buscarTenantPorGatewayIdOuLancarErro(String gatewayCustomerId) {
        return tenantRepository.findByStripeCustomerId(gatewayCustomerId)
                .orElseThrow(() -> {
                    logger.error("Webhook recebido para gatewayCustomerId={} sem Tenant correspondente.", gatewayCustomerId);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Nenhum Tenant encontrado para o customer do gateway: " + gatewayCustomerId);
                });
    }
}
