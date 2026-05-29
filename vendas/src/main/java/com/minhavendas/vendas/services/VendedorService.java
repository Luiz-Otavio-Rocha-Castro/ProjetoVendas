package com.minhavendas.vendas.services;

import java.util.Optional;



import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.shared.VendedorDTO;

@Service
public class VendedorService {
    @Autowired
    private VendedorRepository vendedorRepository;
    private ModelMapper mapper = new ModelMapper();
    

    public VendedorDTO obterVendedorId(Integer id){
        Optional<Vendedor> vendedor = vendedorRepository.findById(id);

        if(vendedor.isEmpty()){
            throw new IllegalArgumentException("Não existe um vendedor com esse ID");
        }
        return mapper.map(vendedor.get(), VendedorDTO.class);
    }

    public VendedorDTO atualizar(VendedorDTO vendedorDTO, Integer id){
        VendedorDTO testeId = obterVendedorId(id);

        vendedorDTO.setId(id);
        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);
        vendedorRepository.save(vendedor);
        return vendedorDTO;
    }
    
}
