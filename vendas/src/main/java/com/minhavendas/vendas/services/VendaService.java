package com.minhavendas.vendas.services;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.model.Venda;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.repository.VendaRepository;
import com.minhavendas.vendas.dto.VendaDTO;
import com.minhavendas.vendas.security.SecurityUtils;

@Service
public class VendaService {
    
    @Autowired
    private VendaRepository vendaRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    private final ModelMapper mapper = new ModelMapper();

    @Transactional(readOnly = true)
    public List<VendaDTO> obterTodos() {
        Integer vendedorId = getVendedorLogadoSeguro();
        
        // Mantemos "OrIsNull" por segurança de legado caso o usuário precise ver contratos antigos sem dono associado
        // Mas o ideal para strict multitenancy seria: vendaRepository.findByVendedorId(vendedorId);
        List<Venda> vendas = vendaRepository.findByVendedorIdOrVendedorIdIsNull(vendedorId);
        
        return vendas.stream()
                .map(venda -> mapper.map(venda, VendaDTO.class))
                .collect(Collectors.toList());
    } 
    
    @Transactional(readOnly = true)
    public VendaDTO obterVendaId(Integer id) {
        Venda venda = buscarVendaValidandoDono(id);
        return mapper.map(venda, VendaDTO.class);
    }

    public Integer obterIdClienteVenda(Integer idvenda) {
        Venda venda = buscarVendaValidandoDono(idvenda);
        if (venda.getCliente() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não possui cliente vinculado");
        }
        return venda.getCliente().getId();
    }
    
    @Transactional
    public VendaDTO adicionar(VendaDTO vendaDto, Integer clienteId) {
        Integer vendedorId = getVendedorLogadoSeguro();
        Cliente cliente = buscarClienteOuLancarErro(clienteId);
        
        validarRegrasDeNegocioVenda(vendaDto);

        vendaDto.setId(null);
        if (vendaDto.getDataVenda() == null) {
            vendaDto.setDataVenda(LocalDate.now());
        }
        
        Venda venda = mapper.map(vendaDto, Venda.class);
        venda.setCliente(cliente);
        venda.setVendedorId(vendedorId);
        venda.setPercentualComissao(0.0);
        venda.setValorComissao(0.0);
        
        venda = vendaRepository.save(venda);
        vendaRepository.flush();
        
        recalcularComissoesDoMes(vendedorId, venda.getDataVenda());
        
        venda = vendaRepository.findById(venda.getId()).get();
        return mapper.map(venda, VendaDTO.class);
    }

    @Transactional
    public void deletar(Integer id) {
        Venda venda = buscarVendaValidandoDono(id);
        vendaRepository.delete(venda);
        vendaRepository.flush();
        recalcularComissoesDoMes(venda.getVendedorId(), venda.getDataVenda());
    }

    @Transactional
    public VendaDTO atualizar(VendaDTO vendaDto, Integer id, Integer clienteId) {
        Venda vendaExistente = buscarVendaValidandoDono(id);
        LocalDate dataAntiga = vendaExistente.getDataVenda();
        Cliente cliente = buscarClienteOuLancarErro(clienteId);
        
        validarRegrasDeNegocioVenda(vendaDto);

        vendaDto.setId(id);
        if (vendaDto.getDataVenda() == null) {
            vendaDto.setDataVenda(dataAntiga);
        }
        
        Venda venda = mapper.map(vendaDto, Venda.class);
        venda.setCliente(cliente);
        venda.setVendedorId(vendaExistente.getVendedorId());
        venda.setPercentualComissao(vendaExistente.getPercentualComissao());
        venda.setValorComissao(vendaExistente.getValorComissao());
        
        venda = vendaRepository.save(venda);
        vendaRepository.flush();
        
        recalcularComissoesDoMes(venda.getVendedorId(), venda.getDataVenda());
        
        if (dataAntiga != null && (!dataAntiga.getMonth().equals(venda.getDataVenda().getMonth()) || dataAntiga.getYear() != venda.getDataVenda().getYear())) {
            recalcularComissoesDoMes(venda.getVendedorId(), dataAntiga);
        }
        
        venda = vendaRepository.findById(venda.getId()).get();
        return mapper.map(venda, VendaDTO.class);
    }

    /* --- MÉTODOS PRIVADOS DE APOIO --- */

    private void recalcularComissoesDoMes(Integer vendedorId, LocalDate dataVenda) {
        if (vendedorId == null || dataVenda == null) return;
        
        LocalDate inicioMes = dataVenda.withDayOfMonth(1);
        LocalDate fimMes = dataVenda.withDayOfMonth(dataVenda.lengthOfMonth());
        
        Double totalMes = vendaRepository.sumValorTotalElegivelByVendedorIdAndDataVendaBetween(vendedorId, inicioMes, fimMes);
        if (totalMes == null) totalMes = 0.0;
        
        Double novoPercentual = calcularPercentualComissao(totalMes);
        
        List<Venda> vendasDoMes = vendaRepository.findElegiveisByVendedorIdAndDataVendaBetween(vendedorId, inicioMes, fimMes);
        for (Venda v : vendasDoMes) {
            v.setPercentualComissao(novoPercentual);
            v.setValorComissao(v.getValorTotal() * (novoPercentual / 100.0));
            vendaRepository.save(v);
        }
    }

    private Double calcularPercentualComissao(Double totalVendas) {
        if (totalVendas <= 99999.99) return 5.0;
        if (totalVendas <= 149999.99) return 6.0;
        if (totalVendas <= 199999.99) return 6.5;
        return 7.0;
    }

    private Integer getVendedorLogadoSeguro() {
        Integer id = SecurityUtils.getVendedorIdLogado();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return id;
    }

    private Venda buscarVendaValidandoDono(Integer id) {
        Venda venda = vendaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não encontrada"));
            
        // PREVENÇÃO CONTRA IDOR: Se a venda tem dono e não é o logado, bloqueia.
        if (venda.getVendedorId() != null && !venda.getVendedorId().equals(getVendedorLogadoSeguro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para acessar esta venda");
        }
        return venda;
    }

    private Cliente buscarClienteOuLancarErro(Integer clienteId) {
        return clienteRepository.findById(clienteId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    private void validarRegrasDeNegocioVenda(VendaDTO vendaDto) {
        if (vendaDto.getValorTotal() == null || vendaDto.getValorTotal() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor total da venda deve ser maior que zero.");
        }
        // Validação de percentual removida, pois será recalculado.
    }
}

