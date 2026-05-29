package com.minhavendas.vendas.view.model.Venda;


public class VendaRequest {
    //#region
    private String produto;
    
    private Double valorTotal;
    
    private Double percentualComissao;
    
    private String formaPagamento;
    
    private Integer clienteIdentificador;

    private Integer vendedorIdentificador;

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
       public Integer getClienteIdentificador() {
        return clienteIdentificador;
    }

    public void setClienteIdentificador(Integer clienteId) {
        this.clienteIdentificador = clienteId;
    }

    public Integer getVendedorIdentificador() {
        return vendedorIdentificador;
    }

    public void setVendedorIdentificador(Integer vendedorId) {
        this.vendedorIdentificador = vendedorId;
    }

    //#endregion
}
