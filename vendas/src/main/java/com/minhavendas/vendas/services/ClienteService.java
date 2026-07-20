package com.minhavendas.vendas.services;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.dto.ClienteDTO;
import com.minhavendas.vendas.security.SecurityUtils;

@Service
public class ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    private final ModelMapper mapper = new ModelMapper();

    @Transactional(readOnly = true)
    public List<ClienteDTO> obterTodos() {
        Integer vendedorId = getVendedorLogadoSeguro();
        List<Cliente> clientes = clienteRepository.findByVendedorIdOrVendedorIdIsNull(vendedorId);
        return clientes.stream()
                .map(cliente -> mapper.map(cliente, ClienteDTO.class))
                .collect(Collectors.toList());
    } 

    @Transactional(readOnly = true)
    public ClienteDTO obterClienteId(Integer id) {
        Cliente cliente = buscarClienteValidandoDono(id);
        return mapper.map(cliente, ClienteDTO.class);
    }

    @Transactional
    public ClienteDTO adicionar(ClienteDTO clientedto) {
        Integer vendedorId = getVendedorLogadoSeguro();
        
        if (clientedto.getNome() == null || clientedto.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do cliente é obrigatório");
        }

        clientedto.setId(null);
        Cliente cliente = mapper.map(clientedto, Cliente.class);
        cliente.setVendedorId(vendedorId);

        cliente = clienteRepository.save(cliente);
        clientedto.setId(cliente.getId());

        return clientedto;
    }

    @Transactional
    public void deletar(Integer id) {
        Cliente cliente = buscarClienteValidandoDono(id);
        clienteRepository.delete(cliente);
    }

    @Transactional
    public ClienteDTO atualizar(ClienteDTO clienteDto, Integer id) { 
        Cliente clienteExistente = buscarClienteValidandoDono(id);
        
        if (clienteDto.getNome() == null || clienteDto.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do cliente é obrigatório");
        }

        clienteDto.setId(id);
        Cliente cliente = mapper.map(clienteDto, Cliente.class);
        cliente.setVendedorId(clienteExistente.getVendedorId());

        clienteRepository.save(cliente);
        return clienteDto;
    }

    /* --- MÉTODOS PRIVADOS DE APOIO --- */

    private Integer getVendedorLogadoSeguro() {
        Integer id = SecurityUtils.getVendedorIdLogado();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return id;
    }

    private Cliente buscarClienteValidandoDono(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
            
        if (cliente.getVendedorId() != null && !cliente.getVendedorId().equals(getVendedorLogadoSeguro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para acessar este cliente");
        }
        return cliente;
    }
}

