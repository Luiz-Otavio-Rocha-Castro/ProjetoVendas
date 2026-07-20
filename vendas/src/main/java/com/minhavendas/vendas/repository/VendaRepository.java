package com.minhavendas.vendas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.minhavendas.vendas.model.Venda;

import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Integer>{
    List<Venda> findByVendedorIdOrVendedorIdIsNull(Integer vendedorId);
    List<Venda> findByVendedorId(Integer vendedorId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(v.valorTotal) FROM Venda v WHERE (v.vendedorId = :vendedorId OR v.vendedorId IS NULL) AND v.dataVenda BETWEEN :inicio AND :fim")
    Double sumValorTotalByVendedorIdAndDataVendaBetween(@org.springframework.data.repository.query.Param("vendedorId") Integer vendedorId, @org.springframework.data.repository.query.Param("inicio") java.time.LocalDate inicio, @org.springframework.data.repository.query.Param("fim") java.time.LocalDate fim);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(v.quantidadePainel) FROM Venda v WHERE (v.vendedorId = :vendedorId OR v.vendedorId IS NULL) AND v.dataVenda BETWEEN :inicio AND :fim")
    Integer sumQuantidadePainelByVendedorIdAndDataVendaBetween(@org.springframework.data.repository.query.Param("vendedorId") Integer vendedorId, @org.springframework.data.repository.query.Param("inicio") java.time.LocalDate inicio, @org.springframework.data.repository.query.Param("fim") java.time.LocalDate fim);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM Venda v WHERE (v.vendedorId = :vendedorId OR v.vendedorId IS NULL) AND v.dataVenda BETWEEN :inicio AND :fim")
    Integer countByVendedorIdAndDataVendaBetween(@org.springframework.data.repository.query.Param("vendedorId") Integer vendedorId, @org.springframework.data.repository.query.Param("inicio") java.time.LocalDate inicio, @org.springframework.data.repository.query.Param("fim") java.time.LocalDate fim);
}
