package com.minhavendas.vendas.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nomeProspecto;

    private String endereco;

    private LocalDate dataVisita;

    private String cpfCnpj;

    @Column(columnDefinition = "TEXT")
    private String anotacoes;

    private String status; // "Agendada", "Realizada", "Cancelada"

    // getters e setters
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
