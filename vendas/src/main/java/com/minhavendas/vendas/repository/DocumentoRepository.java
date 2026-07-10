package com.minhavendas.vendas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minhavendas.vendas.model.Documento;

public interface DocumentoRepository extends JpaRepository<Documento, Integer> {
    List<Documento> findByClienteId(Integer clienteId);
}
