package com.minhavendas.vendas.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.dto.ClienteDTO;

@Service
public class ClienteService {
    @Autowired

    private ClienteRepository clienteRepository;
    private ModelMapper mapper = new ModelMapper();

    public List<ClienteDTO> obterTodos(){
        List<Cliente> clientes = clienteRepository.findAll();
        return clientes.stream()
        .map(cliente -> mapper.map(cliente, ClienteDTO.class))
        .collect(Collectors.toList());
    } 
    public ClienteDTO obterClienteId(Integer id){
        Optional<Cliente> cliente = clienteRepository.findById(id);

        if(cliente.isEmpty()){
            throw new RuntimeException("Não existe um cliente com esse ID");
        }
        return mapper.map(cliente.get(), ClienteDTO.class);
    }

    public ClienteDTO adicionar(ClienteDTO clientedto){
        clientedto.setId(null);

        Cliente cliente = mapper.map(clientedto, Cliente.class);

        cliente = clienteRepository.save(cliente);

        clientedto.setId(cliente.getId());

        return clientedto;
    }
    public void deletar(Integer id){

        Optional<Cliente> cliente = clienteRepository.findById(id);
        if(cliente.isEmpty()){
            throw new RuntimeException("Não existe um cliente com esse ID");
        }
        clienteRepository.deleteById(id);
    }
    public ClienteDTO atualizar(ClienteDTO clienteDto, Integer id){ 
        Optional<Cliente> clienteOptional = clienteRepository.findById(id);
        
        if(clienteOptional.isEmpty()){
            throw new RuntimeException("Não existe um cliente com esse ID");
        }
        
        clienteDto.setId(id);

        Cliente cliente = mapper.map(clienteDto, Cliente.class);

        clienteRepository.save(cliente);

        return clienteDto;
    }


}
