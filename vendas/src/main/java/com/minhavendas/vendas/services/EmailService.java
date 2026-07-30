package com.minhavendas.vendas.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serviço de integração com a API do Resend.com para envio de e-mails.
 * 
 * Durante o desenvolvimento local (sem chave de API configurada),
 * este serviço imprimirá o link de ativação no console para facilitar testes.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${resend.api.key:NAO_CONFIGURADO}")
    private String resendApiKey;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envia o e-mail de verificação para novos clientes (SaaS Onboarding).
     */
    public void enviarEmailVerificacao(String emailDestino, String nomeDestino, String token) {
        // O link que o usuário vai clicar no e-mail
        // Ex: http://localhost:5173/verificar-email?token=123-abc
        String linkVerificacao = frontendUrl + "/verificar-email?token=" + token;
        
        // 1. MODO DESENVOLVIMENTO: Loga no console se não houver chave
        if ("NAO_CONFIGURADO".equals(resendApiKey) || resendApiKey.isBlank()) {
            logger.warn("======================================================");
            logger.warn("CHAVE DO RESEND NÃO CONFIGURADA (resend.api.key).");
            logger.warn("E-mail não enviado para {}.", emailDestino);
            logger.warn("Para ativar a conta manualmente em localhost, ACESSE O LINK ABAIXO:");
            logger.warn("👉 {}", linkVerificacao);
            logger.warn("======================================================");
            return;
        }
        
        // 2. MODO PRODUÇÃO: Dispara a requisição para a API do Resend
        try {
            String url = "https://api.resend.com/emails";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);
            
            // Corpo da requisição para o Resend
            Map<String, Object> body = new HashMap<>();
            body.put("from", "Equipe Solvy <contato@solvyapp.online>"); // Dominio oficial!
            body.put("to", List.of(emailDestino));
            body.put("subject", "Bem-vindo! Verifique seu e-mail");
            
            // HTML simples, ideal seria um template externo, mas mantemos coeso aqui
            String htmlContent = String.format(
                "<h2>Olá, %s!</h2>" +
                "<p>Obrigado por se cadastrar na <b>Solvy</b>.</p>" +
                "<p>Para ativar sua conta e acessar o painel, clique no botão abaixo:</p>" +
                "<a href='%s' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Verificar E-mail</a>" +
                "<p>Se o botão não funcionar, copie e cole o link no seu navegador:</p>" +
                "<p><a href='%s'>%s</a></p>" +
                "<p>Este link expira em 24 horas.</p>",
                nomeDestino, linkVerificacao, linkVerificacao, linkVerificacao
            );
            
            body.put("html", htmlContent);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("E-mail de verificação enviado para {} com sucesso via Resend.", emailDestino);
            } else {
                logger.error("Falha ao enviar e-mail via Resend. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            }
            
        } catch (Exception e) {
            // Não estouramos a exceção para não quebrar a transação de cadastro por causa do e-mail.
            // O usuário pode pedir o reenvio do e-mail depois.
            logger.error("Erro inesperado ao chamar a API do Resend: {}", e.getMessage(), e);
        }
    }
}
