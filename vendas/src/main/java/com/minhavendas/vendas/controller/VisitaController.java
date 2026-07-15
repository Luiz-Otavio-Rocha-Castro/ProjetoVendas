package com.minhavendas.vendas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minhavendas.vendas.dto.request.VisitaRequest;
import com.minhavendas.vendas.dto.response.VisitaResponse;
import com.minhavendas.vendas.services.VisitaService;

@RestController
@RequestMapping("api/visitas")
public class VisitaController {

    @Autowired
    private VisitaService visitaService;

    @GetMapping
    public ResponseEntity<List<VisitaResponse>> listar() {
        return ResponseEntity.ok(visitaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<VisitaResponse> adicionar(@RequestBody VisitaRequest request) {
        VisitaResponse resp = visitaService.adicionar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitaResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody VisitaRequest request) {
        return ResponseEntity.ok(visitaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        visitaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
