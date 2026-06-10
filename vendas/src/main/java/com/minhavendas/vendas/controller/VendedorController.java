package com.minhavendas.vendas.controller;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minhavendas.vendas.services.VendedorService;
import com.minhavendas.vendas.dto.VendedorDTO;
import com.minhavendas.vendas.dto.request.VendedorRequest;
import com.minhavendas.vendas.dto.response.VendedorResponse;


@RestController
@RequestMapping("api/vendas-vendedor")
public class VendedorController {
    
    @Autowired
    private VendedorService VendedorService;

    private ModelMapper mapper = new ModelMapper();

    @GetMapping("/{id}")
    public ResponseEntity<VendedorResponse> obterVendedorId(@PathVariable Integer id){
        VendedorDTO VendedorDto = VendedorService.obterVendedorId(id);
        VendedorResponse VendedorResponse = mapper.map(VendedorDto, VendedorResponse.class);
        return new ResponseEntity<>(VendedorResponse, HttpStatus.OK);
    }


    @PostMapping
     public ResponseEntity<VendedorResponse> adicionar(@RequestBody VendedorRequest VendedorRequest){
        VendedorDTO VendedorDTO = mapper.map(VendedorRequest, VendedorDTO.class);
    
        VendedorDTO = VendedorService.adcionar(VendedorDTO);

        return new ResponseEntity<>(mapper.map(VendedorDTO, VendedorResponse.class), HttpStatus.CREATED);

    }

    @PutMapping("/{id}")
    public ResponseEntity<VendedorResponse> atualizar(@PathVariable Integer id, @RequestBody VendedorRequest VendedorRequest){
        VendedorDTO VendedorDTO = mapper.map(VendedorRequest, VendedorDTO.class);
    
        VendedorDTO = VendedorService.atualizar(VendedorDTO, id);

         return new ResponseEntity<>(mapper.map(VendedorDTO, VendedorResponse.class), HttpStatus.OK);

    }

}


