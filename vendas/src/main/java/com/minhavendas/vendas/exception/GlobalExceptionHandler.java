package com.minhavendas.vendas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Argumento inválido
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorMessage> handlerIllegalArgumentException(IllegalArgumentException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.BAD_REQUEST.value(),
            "Requisição Inválida",
            ex.getMessage()
        );
        return new ResponseEntity<>(erro, HttpStatus.BAD_REQUEST);
    }

    // 2. E-mail não encontrado no banco (Optional.get() vazio)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorMessage> handlerNoSuchElementException(NoSuchElementException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.UNAUTHORIZED.value(),
            "Não Autorizado",
            "E-mail ou senha incorretos."
        );
        return new ResponseEntity<>(erro, HttpStatus.UNAUTHORIZED);
    }

    // 3. Senha errada
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorMessage> handlerBadCredentialsException(BadCredentialsException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.UNAUTHORIZED.value(),
            "Não Autorizado",
            "E-mail ou senha incorretos."
        );
        return new ResponseEntity<>(erro, HttpStatus.UNAUTHORIZED);
    }

    // 4. Outros erros de autenticação do Spring Security
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorMessage> handlerAuthenticationException(AuthenticationException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.UNAUTHORIZED.value(),
            "Não Autorizado",
            "E-mail ou senha incorretos."
        );
        return new ResponseEntity<>(erro, HttpStatus.UNAUTHORIZED);
    }

    // 5. Outros erros de runtime
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorMessage> handlerRuntimeException(RuntimeException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Erro Interno",
            ex.getMessage()
        );
        return new ResponseEntity<>(erro, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 6. Plano de contingência
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMessage> handlerGenericException(Exception ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Erro Interno no Servidor",
            "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
        );
        return new ResponseEntity<>(erro, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
