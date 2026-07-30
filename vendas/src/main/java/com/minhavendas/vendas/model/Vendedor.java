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

    @jakarta.persistence.Column(unique = true)
    private String email;

    private String senha;

    private String regiaoAtuacao;

    private Double metaMensal;

    private Double metaKwp;

    // Vínculo Multi-Tenant: qual empresa este vendedor pertence
    @jakarta.persistence.Column(name = "tenant_id")
    private Integer tenantId;

    @jakarta.persistence.Column(columnDefinition = "bytea")
    private byte[] fotoPerfil;

    // Campos de Verificação de E-mail
    private Boolean emailVerificado = false; // Default: conta nasce bloqueada
    
    @jakarta.persistence.Column(unique = true)
    private String tokenVerificacao;
    
    private java.time.LocalDateTime dataExpiracaoToken;

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

    public Integer getTenantId() { return tenantId; }
    public void setTenantId(Integer tenantId) { this.tenantId = tenantId; }

    public Boolean getEmailVerificado() { return emailVerificado; }
    public void setEmailVerificado(Boolean emailVerificado) { this.emailVerificado = emailVerificado; }

    public String getTokenVerificacao() { return tokenVerificacao; }
    public void setTokenVerificacao(String tokenVerificacao) { this.tokenVerificacao = tokenVerificacao; }

    public java.time.LocalDateTime getDataExpiracaoToken() { return dataExpiracaoToken; }
    public void setDataExpiracaoToken(java.time.LocalDateTime dataExpiracaoToken) { this.dataExpiracaoToken = dataExpiracaoToken; }

    // #endregion
}
