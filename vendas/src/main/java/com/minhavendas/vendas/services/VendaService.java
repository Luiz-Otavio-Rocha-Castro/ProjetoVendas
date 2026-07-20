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
        vendaDto.setDataVenda(LocalDate.now());
        vendaDto.setValorComissao(vendaDto.getValorTotal() * (vendaDto.getPercentualComissao() / 100));
        
        Venda venda = mapper.map(vendaDto, Venda.class);
        venda.setCliente(cliente);
        venda.setVendedorId(vendedorId);
        
        venda = vendaRepository.save(venda);
        vendaDto.setId(venda.getId());
        
        return vendaDto;
    }

    @Transactional
    public void deletar(Integer id) {
        Venda venda = buscarVendaValidandoDono(id);
        vendaRepository.delete(venda);
    }

    @Transactional
    public VendaDTO atualizar(VendaDTO vendaDto, Integer id, Integer clienteId) {
        Venda vendaExistente = buscarVendaValidandoDono(id);
        Cliente cliente = buscarClienteOuLancarErro(clienteId);
        
        validarRegrasDeNegocioVenda(vendaDto);

        vendaDto.setId(id);
        vendaDto.setDataVenda(vendaExistente.getDataVenda());
        vendaDto.setValorComissao(vendaDto.getValorTotal() * (vendaDto.getPercentualComissao() / 100));
        
        Venda venda = mapper.map(vendaDto, Venda.class);
        venda.setCliente(cliente);
        venda.setVendedorId(vendaExistente.getVendedorId());
        
        vendaRepository.save(venda);
        return vendaDto;
    }

    /* --- MÉTODOS PRIVADOS DE APOIO --- */

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
        if (vendaDto.getPercentualComissao() == null || vendaDto.getPercentualComissao() < 0 || vendaDto.getPercentualComissao() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O percentual de comissão deve estar entre 0 e 100.");
        }
    }
}

