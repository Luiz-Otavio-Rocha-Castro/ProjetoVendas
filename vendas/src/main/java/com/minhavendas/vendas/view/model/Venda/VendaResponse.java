package com.minhavendas.vendas.view.model.Venda;

import java.time.LocalDate;

public class VendaResponse {
    //#region
    private Integer id;

    private String produto;
    
    private LocalDate dataVenda;
    
    private Double valorTotal;
    
    private Double percentualComissao;
    
    private Double ValorComissao;
    
    private String formaPagamento;
    
    private String clienteNome;

    private String vendedorNome;

    //#endregion

    //#region gets e setts
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProduto() {
        return produto;
    }

    public void setProduto(String produto) {
        this.produto = produto;
    }


    public LocalDate getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDate dataVenda) {
        this.dataVenda = dataVenda;
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

    public Double getValorComissao() {
        return ValorComissao;
    }

    public void setValorComissao(Double valorComissao) {
        ValorComissao = valorComissao;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
       public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getVendedorNome() {
        return vendedorNome;
    }

    public void setVendedorNome(String vendedorNome) {
        this.vendedorNome = vendedorNome;
    }

    //#endregion
}
