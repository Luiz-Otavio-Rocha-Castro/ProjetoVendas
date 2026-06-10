package com.minhavendas.vendas.dto.response;

public class VendedorResponse {
    //#region atributos
    private Integer id;

    private String nome;

    private String email;

    private String regiaoAtuacao;

    private Double metaMensal;

    private Double metaKwp;
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

    
    //#endregion
}

