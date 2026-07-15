package com.minhavendas.vendas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minhavendas.vendas.model.Visita;

public interface VisitaRepository extends JpaRepository<Visita, Integer> {
    List<Visita> findByStatusOrderByDataVisitaAsc(String status);
}
