package com.minhavendas.vendas.services;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.dto.request.VisitaRequest;
import com.minhavendas.vendas.dto.response.VisitaResponse;
import com.minhavendas.vendas.model.Visita;
import com.minhavendas.vendas.repository.VisitaRepository;
import com.minhavendas.vendas.security.SecurityUtils;

@Service
public class VisitaService {

    @Autowired
    private VisitaRepository visitaRepository;

    private final ModelMapper mapper = new ModelMapper();

    @Transactional(readOnly = true)
    public List<VisitaResponse> listarTodas() {
        Integer vendedorId = getVendedorLogadoSeguro();
        return visitaRepository.findByVendedorIdOrVendedorIdIsNull(vendedorId)
                .stream()
                .map(v -> mapper.map(v, VisitaResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public VisitaResponse adicionar(VisitaRequest request) {
        Integer vendedorId = getVendedorLogadoSeguro();
        
        if (request.getNomeProspecto() == null || request.getNomeProspecto().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome do prospecto é obrigatório");
        }

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("Agendada");
        }

        Visita visita = mapper.map(request, Visita.class);
        visita.setId(null);
        visita.setVendedorId(vendedorId);
        
        visita = visitaRepository.save(visita);
        return mapper.map(visita, VisitaResponse.class);
    }

    @Transactional
    public VisitaResponse atualizar(Integer id, VisitaRequest request) {
        Visita visita = buscarVisitaValidandoDono(id);
        
        if (request.getNomeProspecto() == null || request.getNomeProspecto().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome do prospecto é obrigatório");
        }

        visita.setNomeProspecto(request.getNomeProspecto());
        visita.setEndereco(request.getEndereco());
        visita.setDataVisita(request.getDataVisita());
        visita.setHoraVisita(request.getHoraVisita());
        visita.setCpfCnpj(request.getCpfCnpj());
        visita.setAnotacoes(request.getAnotacoes());
        visita.setStatus(request.getStatus());
        visita.setAlertaEnviado(false); // Reseta o alerta caso ele mude o horário
        
        visita = visitaRepository.save(visita);
        return mapper.map(visita, VisitaResponse.class);
    }

    @Transactional
    public void deletar(Integer id) {
        Visita visita = buscarVisitaValidandoDono(id);
        visitaRepository.delete(visita);
    }

    /* --- MÉTODOS PRIVADOS DE APOIO --- */

    private Integer getVendedorLogadoSeguro() {
        Integer id = SecurityUtils.getVendedorIdLogado();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return id;
    }

    private Visita buscarVisitaValidandoDono(Integer id) {
        Visita visita = visitaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Visita não encontrada: " + id));
            
        if (visita.getVendedorId() != null && !visita.getVendedorId().equals(getVendedorLogadoSeguro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para acessar esta visita");
        }
        return visita;
    }
}

