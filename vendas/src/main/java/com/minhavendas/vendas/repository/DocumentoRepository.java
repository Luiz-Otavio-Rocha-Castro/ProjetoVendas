package com.minhavendas.vendas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minhavendas.vendas.model.Documento;

public interface DocumentoRepository extends JpaRepository<Documento, Integer> {
    List<Documento> findByClienteId(Integer clienteId);
    
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Documento d WHERE d.vendedorId = :vendedorId OR d.vendedorId IS NULL")
    List<Documento> findByVendedorIdOrVendedorIdIsNull(@org.springframework.data.repository.query.Param("vendedorId") Integer vendedorId);
}
