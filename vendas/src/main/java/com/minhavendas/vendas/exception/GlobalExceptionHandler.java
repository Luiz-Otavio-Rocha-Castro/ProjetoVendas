package com.minhavendas.vendas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.minhavendas.vendas.exception.ErrorMessage;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Captura erros de argumentos inválidos (ex: IDs nulos ou regras de negócio validadas por você)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorMessage> handlerIllegalArgumentException(IllegalArgumentException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.BAD_REQUEST.value(),
            "Requisição Inválida",
            ex.getMessage()
        );
        return new ResponseEntity<>(erro, HttpStatus.BAD_REQUEST);
    }

    // 2. CAPTURA ERRO DE NOT FOUND (Se você lançar uma exceção customizada ou ResourceNotFoundException)
    // Dica: Se no seu Service você usa algo como .orElseThrow(() -> new RuntimeException("Não encontrado")), 
    // você pode capturar RuntimeException aqui para devolver 404 Status.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorMessage> handlerRuntimeException(RuntimeException ex) {
        ErrorMessage erro = new ErrorMessage(
            HttpStatus.NOT_FOUND.value(),
            "Recurso Não Encontrado",
            ex.getMessage()
        );
        return new ResponseEntity<>(erro, HttpStatus.NOT_FOUND);
    }

    // 3. O plano de contingência para qualquer outro erro bizarro não mapeado
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


