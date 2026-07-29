package com.minhavendas.vendas.billing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minhavendas.vendas.billing.dto.BillingResponseDTO;
import com.minhavendas.vendas.billing.dto.PaymentEventDTO;

/**
 * Controller de Webhooks do Gateway de Pagamento.
 *
 * SEGURANÇA CRÍTICA: Esta rota é chamada diretamente pelo servidor do gateway (Stripe, Asaas, etc.),
 * NÃO pelo frontend. Por isso:
 * 1. Ela está liberada no WebSecurity (.requestMatchers("/billing/webhook").permitAll())
 * 2. A segurança é feita pela assinatura HMAC no header (X-Webhook-Signature),
 *    que provamos ser do gateway antes de processar qualquer evento.
 *
 * Configure a URL deste endpoint no painel do seu gateway:
 * https://sua-api.com/billing/webhook
 */
@RestController
@RequestMapping("/billing")
public class WebhookController {

    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Chave secreta do webhook, configurada no painel do gateway e salva no application.properties.
     * Usada para validar a assinatura HMAC do evento antes de processar.
     */
    @Value("${billing.webhook.secret:WEBHOOK_SECRET_NAO_CONFIGURADO}")
    private String webhookSecret;

    /**
     * Endpoint que recebe todos os eventos do gateway de pagamento.
     *
     * @param signatureHeader Assinatura HMAC enviada pelo gateway no header (ex: "X-Webhook-Signature").
     * @param event           Payload do evento já deserializado.
     * @return 200 OK se processado, 400 se assinatura inválida.
     */
    @PostMapping("/webhook")
    public ResponseEntity<BillingResponseDTO> receberWebhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signatureHeader,
            @RequestBody PaymentEventDTO event) {

        logger.info("Webhook recebido: eventId={}, type={}", event.getGatewayEventId(), event.getEventType());

        // VALIDAÇÃO DA ASSINATURA: Garante que o evento veio realmente do gateway,
        // prevenindo ataques onde alguém forja um evento de "pagamento aprovado".
        if (!validarAssinaturaWebhook(signatureHeader, event)) {
            logger.error("Assinatura de webhook inválida para eventId={}. Possível ataque!", event.getGatewayEventId());
            return ResponseEntity.badRequest()
                    .body(BillingResponseDTO.erro("Assinatura de webhook inválida."));
        }

        // Delega o processamento ao SubscriptionService (lógica de negócio separada do HTTP)
        BillingResponseDTO resultado = subscriptionService.processarWebhook(event);

        return ResponseEntity.ok(resultado);
    }

    /**
     * Valida a assinatura HMAC do webhook.
     *
     * IMPLEMENTAÇÃO REAL: Você deve usar a biblioteca do seu gateway para isso.
     * - Stripe: Stripe.Webhook.constructEvent(payload, sigHeader, webhookSecret)
     * - Asaas: Comparar o header "asaas-access-token" com o token do seu painel
     *
     * TODO: Substituir este método pela implementação real do gateway escolhido.
     */
    private boolean validarAssinaturaWebhook(String signatureHeader, PaymentEventDTO event) {
        // Stub de validação: Em desenvolvimento, aceita qualquer assinatura para facilitar testes.
        // Em PRODUÇÃO, implemente a verificação HMAC-SHA256 real aqui.
        if (webhookSecret.equals("WEBHOOK_SECRET_NAO_CONFIGURADO")) {
            logger.warn("AVISO: Validação de webhook DESABILITADA. Configure billing.webhook.secret em produção!");
            return true; // Aceita em dev sem secret configurado
        }

        // Exemplo de validação HMAC (implementação real dependente do gateway):
        // String expectedSignature = HmacUtils.hmacSha256Hex(webhookSecret, payload);
        // return MessageDigest.isEqual(expectedSignature.getBytes(), signatureHeader.getBytes());

        return signatureHeader != null && !signatureHeader.isBlank();
    }
}
