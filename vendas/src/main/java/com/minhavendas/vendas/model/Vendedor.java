package com.minhavendas.vendas.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Vendedor {

    // #region atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;

    private String email;

    private String senha;

    private String regiaoAtuacao;

    private Double metaMensal;

    private Double metaKwp;

    @jakarta.persistence.Column(columnDefinition = "bytea")
    private byte[] fotoPerfil;

    // #endregion

    // #region GEts e setters
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

    public byte[] getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(byte[] fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }

    // #endregion
}
