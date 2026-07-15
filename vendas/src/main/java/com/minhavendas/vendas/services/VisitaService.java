package com.minhavendas.vendas.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.minhavendas.vendas.dto.request.VisitaRequest;
import com.minhavendas.vendas.dto.response.VisitaResponse;
import com.minhavendas.vendas.model.Visita;
import com.minhavendas.vendas.repository.VisitaRepository;

@Service
public class VisitaService {

    @Autowired
    private VisitaRepository visitaRepository;

    private ModelMapper mapper = new ModelMapper();

    public List<VisitaResponse> listarTodas() {
        return visitaRepository.findAll()
                .stream()
                .map(v -> mapper.map(v, VisitaResponse.class))
                .collect(Collectors.toList());
    }

    public VisitaResponse adicionar(VisitaRequest request) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("Agendada");
        }
        Visita visita = mapper.map(request, Visita.class);
        visita.setId(null);
        visita = visitaRepository.save(visita);
        return mapper.map(visita, VisitaResponse.class);
    }

    public VisitaResponse atualizar(Integer id, VisitaRequest request) {
        Optional<Visita> opt = visitaRepository.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Visita não encontrada: " + id);
        }
        Visita visita = opt.get();
        visita.setNomeProspecto(request.getNomeProspecto());
        visita.setEndereco(request.getEndereco());
        visita.setDataVisita(request.getDataVisita());
        visita.setAnotacoes(request.getAnotacoes());
        visita.setStatus(request.getStatus());
        visita = visitaRepository.save(visita);
        return mapper.map(visita, VisitaResponse.class);
    }

    public void deletar(Integer id) {
        if (!visitaRepository.existsById(id)) {
            throw new RuntimeException("Visita não encontrada: " + id);
        }
        visitaRepository.deleteById(id);
    }
}
