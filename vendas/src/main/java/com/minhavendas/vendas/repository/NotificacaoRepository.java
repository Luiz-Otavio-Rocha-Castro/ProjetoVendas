package com.minhavendas.vendas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.minhavendas.vendas.model.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {
    List<Notificacao> findByVendedorIdOrderByDataCriacaoDesc(Integer vendedorId);
}
