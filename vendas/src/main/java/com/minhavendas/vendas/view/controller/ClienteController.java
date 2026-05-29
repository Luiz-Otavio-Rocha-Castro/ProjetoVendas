package com.minhavendas.vendas.view.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
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

import com.minhavendas.vendas.services.ClienteService;
import com.minhavendas.vendas.shared.ClienteDTO;
import com.minhavendas.vendas.view.model.Cliente.ClienteRequest;
import com.minhavendas.vendas.view.model.Cliente.ClienteResponse;

@RestController
@RequestMapping("api/vendas-cliente")
public class ClienteController {
    
    @Autowired
    private ClienteService clienteService;

    private ModelMapper mapper = new ModelMapper();

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> obterTodos(){
        List<ClienteDTO> clientes = clienteService.obterTodos();

        List<ClienteResponse> resposta = clientes.stream()
        .map(clienteDto -> mapper.map(clienteDto, ClienteResponse.class))
        .collect(Collectors.toList());

        return new ResponseEntity<>(resposta,HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> obterClienteId(@PathVariable Integer id){
        ClienteDTO clienteDto = clienteService.obterClienteId(id);
        ClienteResponse clienteResponse = mapper.map(clienteDto, ClienteResponse.class);
        return new ResponseEntity<>(clienteResponse, HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<ClienteResponse> adicionar(@RequestBody ClienteRequest clienteRequest){
        ClienteDTO clienteDTO = mapper.map(clienteRequest, ClienteDTO.class);
        clienteDTO = clienteService.adicionar(clienteDTO);
        return new ResponseEntity<>(mapper.map(clienteDTO, ClienteResponse.class), HttpStatus.CREATED);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletar(@PathVariable Integer id){
        clienteService.deletar(id);
        return new ResponseEntity<>("Cliente do id: " + id + " removido com sucesso", HttpStatus.NO_CONTENT);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> atualizar(@PathVariable Integer id, @RequestBody ClienteRequest clienteRequest){
        ClienteDTO clienteDTO = mapper.map(clienteRequest, ClienteDTO.class);
    
        clienteDTO = clienteService.atualizar(clienteDTO, id);

         return new ResponseEntity<>(mapper.map(clienteDTO, ClienteResponse.class), HttpStatus.OK);

    }

}
