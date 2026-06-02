package com.minhavendas.vendas.view.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.minhavendas.vendas.services.VendaService;
import com.minhavendas.vendas.shared.VendaDTO;
import com.minhavendas.vendas.view.model.CadastroCompleto;
import com.minhavendas.vendas.view.model.Cliente.ClienteResponse;
import com.minhavendas.vendas.view.model.Venda.VendaResponse;

@RestController
@RequestMapping("api/venda")
@CrossOrigin(origins = "http://localhost:5173")

public class VendaController {
    
    @Autowired
    private VendaService vendaService;
    @Autowired 
    private ClienteController clienteController;
    private ModelMapper mapper = new ModelMapper();

    @GetMapping
    public ResponseEntity<List<VendaResponse>> obterTodos(){
        
        List<VendaDTO> vendaDTOs = vendaService.obterTodos();
        List<VendaResponse> resposta = vendaDTOs.stream()
        .map(vendaDto -> {
            VendaResponse vResponse = mapper.map(vendaDto, VendaResponse.class);
            vResponse.setClienteNome(vendaDto.getCliente().getNome());
            return vResponse;
        })
        .collect(Collectors.toList());

        return new ResponseEntity<>(resposta, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponse> obterVendaId(@PathVariable Integer id){
        VendaDTO vendaDto = vendaService.obterVendaId(id);
        VendaResponse vResponse = mapper.map(vendaDto, VendaResponse.class);
        vResponse.setClienteNome(vendaDto.getCliente().getNome());
        return new ResponseEntity<>(vResponse, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<VendaResponse> adicionar(@RequestBody CadastroCompleto requestCompleto) {
    ResponseEntity<Integer> clienteIdResponse = clienteController.adicionar(requestCompleto.getCliente());
    Integer idDoCliente = clienteIdResponse.getBody();
    VendaDTO vendaDTO = mapper.map(requestCompleto.getVenda(), VendaDTO.class);
    vendaDTO = vendaService.adicionar(vendaDTO, idDoCliente);
    return new ResponseEntity<>(mapper.map(vendaDTO, VendaResponse.class), HttpStatus.CREATED);
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Integer id){
        vendaService.deletar(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendaResponse> atualizar(@RequestBody CadastroCompleto requestCompleto, @PathVariable Integer id){
        Integer idDoCliente = vendaService.obterIdClienteVenda(id);
        ResponseEntity<ClienteResponse> retorno = clienteController.atualizar(idDoCliente, requestCompleto.getCliente());
        VendaDTO vendaDTO = mapper.map(requestCompleto.getVenda(), VendaDTO.class);
        vendaDTO = vendaService.atualizar(vendaDTO, id, idDoCliente);
        return new ResponseEntity<>(mapper.map(vendaDTO, VendaResponse.class), HttpStatus.OK);
    }
}   
