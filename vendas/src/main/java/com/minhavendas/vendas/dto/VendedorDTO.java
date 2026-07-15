package com.minhavendas.vendas.dto;

public class VendedorDTO {
        //#region atributos
    private Integer id;

    private String nome;

    private String email;

    private String senha;

    private String senhaAntiga;

    private String regiaoAtuacao;

    private Double metaMensal;

    private Double metaKwp;

    private Double faturamentoAtual;

    private Double kwpAtual;

    private Integer contratosAtual;

    //#endregion

    //#region GEts e setters
     public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getSenhaAntiga() {
        return senhaAntiga;
    }

    public void setSenhaAntiga(String senhaAntiga) {
        this.senhaAntiga = senhaAntiga;
    }

    public String getRegiaoAtuacao() {
        return regiaoAtuacao;
    }

    public void setRegiaoAtuacao(String regiaoAtuacao) {
        this.regiaoAtuacao = regiaoAtuacao;
    }

    public Double getMetaMensal() {
        return metaMensal;
    }

    public void setMetaMensal(Double metaMensal) {
        this.metaMensal = metaMensal;
    }

    public Double getMetaKwp() {
        return metaKwp;
    }

    public void setMetaKwp(Double metaKwp) {
        this.metaKwp = metaKwp;
    }

    public Double getFaturamentoAtual() {
        return faturamentoAtual;
    }

    public void setFaturamentoAtual(Double faturamentoAtual) {
        this.faturamentoAtual = faturamentoAtual;
    }

    public Double getKwpAtual() {
        return kwpAtual;
    }

    public void setKwpAtual(Double kwpAtual) {
        this.kwpAtual = kwpAtual;
    }

    public Integer getContratosAtual() {
        return contratosAtual;
    }

    public void setContratosAtual(Integer contratosAtual) {
        this.contratosAtual = contratosAtual;
    }
    
    //#endregion

}

