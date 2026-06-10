package com.minhavendas.vendas.services;

import java.util.Optional;



import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.dto.VendedorDTO;

@Service
public class VendedorService {
    @Autowired
    private VendedorRepository vendedorRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    private ModelMapper mapper = new ModelMapper();
    

    public VendedorDTO obterVendedorId(Integer id){
        Optional<Vendedor> vendedor = vendedorRepository.findById(id);

        if(vendedor.isEmpty()){
            throw new IllegalArgumentException("Não existe um vendedor com esse ID");
        }
        return mapper.map(vendedor.get(), VendedorDTO.class);
    }


    
    public VendedorDTO adcionar(VendedorDTO vendedorDTO){
        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);

        String senhaLimpa = vendedor.getSenha();

        String senhaCriptografada = passwordEncoder.encode(senhaLimpa);

        vendedor.setSenha(senhaCriptografada);

        vendedorRepository.save(vendedor);
        
        return mapper.map(vendedor, VendedorDTO.class);
    }




    public VendedorDTO atualizar(VendedorDTO vendedorDTO, Integer id){
        VendedorDTO testeId = obterVendedorId(id);

        vendedorDTO.setId(id);
        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);
        vendedorRepository.save(vendedor);
        return vendedorDTO;
    }
    
}

