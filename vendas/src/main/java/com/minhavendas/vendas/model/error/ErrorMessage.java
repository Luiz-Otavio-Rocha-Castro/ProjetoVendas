package com.minhavendas.vendas.model.error;

import java.time.LocalDateTime;

public class ErrorMessage {
    private LocalDateTime timestamp;
    private Integer status;
    private String erro;
    private String mensagem;
    public ErrorMessage(Integer status, String erro, String mensagem) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.erro = erro;
        this.mensagem = mensagem;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public Integer getStatus() {
        return status;
    }
    public void setStatus(Integer status) {
        this.status = status;
    }
    public String getErro() {
        return erro;
    }
    public void setErro(String erro) {
        this.erro = erro;
    }
    public String getMensagem() {
        return mensagem;
    }
    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
    
}
