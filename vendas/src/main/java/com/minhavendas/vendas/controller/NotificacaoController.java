package com.minhavendas.vendas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minhavendas.vendas.model.Notificacao;
import com.minhavendas.vendas.repository.NotificacaoRepository;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @GetMapping
    public ResponseEntity<List<Notificacao>> listarTodas() {
        Integer vendedorId = com.minhavendas.vendas.security.SecurityUtils.getVendedorIdLogado();
        return ResponseEntity.ok(notificacaoRepository.findByVendedorIdOrderByDataCriacaoDesc(vendedorId));
    }

    @PutMapping("/{id}/ler")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Integer id) {
        return notificacaoRepository.findById(id).map(notificacao -> {
            notificacao.setLida(true);
            notificacaoRepository.save(notificacao);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
