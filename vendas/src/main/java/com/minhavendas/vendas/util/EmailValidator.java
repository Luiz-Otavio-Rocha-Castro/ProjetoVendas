package com.minhavendas.vendas.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

/**
 * Utilitário de validação de e-mail.
 * Centraliza a regra em um único lugar para ser reutilizado em qualquer Service.
 *
 * Regra: endereço com formato local@dominio.extensao, rejeitando:
 * - strings sem "@"
 * - domínios sem "."
 * - extensões com menos de 2 caracteres (ex: "a@b.c")
 */
public class EmailValidator {

    // RFC 5322 simplificado — cobre 99,9% dos e-mails reais
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
    );

    /**
     * Valida se o e-mail tem formato válido.
     * Lança ResponseStatusException 400 com mensagem clara para o frontend exibir.
     */
    public static void validarOuLancarErro(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail é obrigatório.");
        }
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "E-mail inválido. Use o formato: nome@empresa.com");
        }
    }

    /** Retorna true/false sem lançar exceção (para uso em validações opcionais). */
    public static boolean isValido(String email) {
        return email != null && EMAIL_PATTERN.matcher(email.trim()).matches();
    }
}
