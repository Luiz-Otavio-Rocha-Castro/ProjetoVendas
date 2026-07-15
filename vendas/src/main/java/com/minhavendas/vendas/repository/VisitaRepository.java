package com.minhavendas.vendas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minhavendas.vendas.model.Visita;

import org.springframework.data.jpa.repository.Query;

public interface VisitaRepository extends JpaRepository<Visita, Integer> {
    List<Visita> findByStatusOrderByDataVisitaAsc(String status);
    
    @Query("SELECT v FROM Visita v WHERE v.status = :status AND (v.alertaEnviado = false OR v.alertaEnviado IS NULL)")
    List<Visita> buscarPendentesDeAlerta(String status);

    List<Visita> findByVendedorIdOrVendedorIdIsNull(Integer vendedorId);
}
