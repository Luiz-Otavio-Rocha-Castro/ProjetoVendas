package com.minhavendas.vendas.dto.response;

import java.time.LocalDate;

public class VisitaResponse {
    private Integer id;
    private String nomeProspecto;
    private String endereco;
    private LocalDate dataVisita;
    private String cpfCnpj;
    private String anotacoes;
    private String status;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNomeProspecto() { return nomeProspecto; }
    public void setNomeProspecto(String nomeProspecto) { this.nomeProspecto = nomeProspecto; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public LocalDate getDataVisita() { return dataVisita; }
    public void setDataVisita(LocalDate dataVisita) { this.dataVisita = dataVisita; }

    public String getCpfCnpj() { return cpfCnpj; }
    public void setCpfCnpj(String cpfCnpj) { this.cpfCnpj = cpfCnpj; }

    public String getAnotacoes() { return anotacoes; }
    public void setAnotacoes(String anotacoes) { this.anotacoes = anotacoes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
