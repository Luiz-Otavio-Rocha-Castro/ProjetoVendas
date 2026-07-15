package com.minhavendas.vendas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.minhavendas.vendas.model.Cliente;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente,Integer>{
    List<Cliente> findByVendedorIdOrVendedorIdIsNull(Integer vendedorId);
}
