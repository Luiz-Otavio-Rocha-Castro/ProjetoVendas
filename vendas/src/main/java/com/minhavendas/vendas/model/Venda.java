package com.minhavendas.vendas.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Venda {
    //#region atributos vendas
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private Integer vendedorId;

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

    public Integer getVendedorId() { return vendedorId; }
    public void setVendedorId(Integer vendedorId) { this.vendedorId = vendedorId; }

    //#endregion
}