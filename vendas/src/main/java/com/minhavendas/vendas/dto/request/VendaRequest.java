package com.minhavendas.vendas.dto.request;


public class VendaRequest {
    //#region
    private String produto;

    private Integer quantidadePainel;

    private String status;
    
    private Double saldoDevedor;

    private Double valorTotal;
    
    private Double percentualComissao;
    
    private String formaPagamento;

    //#endregion

    //#region gets e setts
     public String getProduto() {
        return produto;
    }

    public void setProduto(String produto) {
        this.produto = produto;
    }

    public Double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }

    public Double getPercentualComissao() {
        return percentualComissao;
    }

    public void setPercentualComissao(Double percentualComissao) {
        this.percentualComissao = percentualComissao;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public Integer getQuantidadePainel() {
        return quantidadePainel;
    }

    public void setQuantidadePainel(Integer quantidadePainel) {
        this.quantidadePainel = quantidadePainel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getSaldoDevedor() {
        return saldoDevedor;
    }

    public void setSaldoDevedor(Double saldoDevedor) {
        this.saldoDevedor = saldoDevedor;
    }

    //#endregion
}

