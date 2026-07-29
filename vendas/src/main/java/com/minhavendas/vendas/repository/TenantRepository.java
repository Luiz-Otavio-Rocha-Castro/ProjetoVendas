package com.minhavendas.vendas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.minhavendas.vendas.model.Tenant;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Integer> {

    Optional<Tenant> findByCnpj(String cnpj);

    Optional<Tenant> findByStripeCustomerId(String stripeCustomerId);
}
