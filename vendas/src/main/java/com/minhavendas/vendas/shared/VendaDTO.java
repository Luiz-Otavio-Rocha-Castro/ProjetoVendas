package com.minhavendas.vendas.shared;

import java.time.LocalDate;

import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.model.Vendedor;

public class VendaDTO {
    //#region
    private Integer id;

    private String produto;

    private Integer quantidadePainel;

    private String status;
    
    private Double saldoDevedor;
    
    private LocalDate dataVenda;
    
    private Double valorTotal;
    
    private Double percentualComissao;
    
    private Double ValorComissao;
    
    private String formaPagamento;
    
    private Cliente cliente;

    private Vendedor vendedor;

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
       public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Vendedor getVendedor() {
        return vendedor;
    }

    public void setVendedor(Vendedor vendedor) {
        this.vendedor = vendedor;
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
