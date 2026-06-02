package com.minhavendas.vendas.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.model.Venda;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.repository.VendaRepository;

import com.minhavendas.vendas.shared.VendaDTO;


@Service
public class VendaService {
    @Autowired
    private VendaRepository vendaRepository;
    private ModelMapper mapper = new ModelMapper();
    @Autowired
    private ClienteRepository clienteRepository;

    public List<VendaDTO> obterTodos(){
        List<Venda> Vendas = vendaRepository.findAll();
        return Vendas.stream()
        .map(venda -> {
           VendaDTO vendaDTO = mapper.map(venda, VendaDTO.class);
           return vendaDTO;
        })
        .collect(Collectors.toList());
    } 
    
    public VendaDTO obterVendaId(Integer id){
        Optional<Venda> Venda = vendaRepository.findById(id);

        if(Venda.isEmpty()){
            throw new IllegalArgumentException("Não existe um venda com esse ID");
        }
        VendaDTO vendaDTO = mapper.map(Venda.get(), VendaDTO.class);
        return vendaDTO;
    }

    //obter o id do cliente relacionado a venda;
    public Integer obterIdClienteVenda(Integer idvenda){
       VendaDTO vendaDTO = obterVendaId(idvenda);
       return vendaDTO.getCliente().getId();
    }
    
    public VendaDTO adicionar(VendaDTO vendaDto, Integer clienteId){
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        vendaDto.setId(null);

        if(cliente.isEmpty()){
            throw new IllegalArgumentException("Não existe um cliente com esse ID");
        }
        vendaDto.setDataVenda(LocalDate.now());
        vendaDto.setValorComissao(vendaDto.getValorTotal() * (vendaDto.getPercentualComissao()/100));
        vendaDto.setCliente(cliente.get());

        Venda venda = mapper.map(vendaDto, Venda.class);
        venda = vendaRepository.save(venda);

        vendaDto.setId(venda.getId());

        return vendaDto;
    }

     public void deletar(Integer id){

        Optional<Venda> venda = vendaRepository.findById(id);
        if(venda.isEmpty()){
            throw new IllegalArgumentException("Não existe uma venda com esse ID");
        }
        vendaRepository.deleteById(id);
    }

    public VendaDTO atualizar(VendaDTO vendaDto, Integer id, Integer clienteId){
        Optional<Venda> venda = vendaRepository.findById(id);
        
        if(venda.isEmpty()){
            throw new RuntimeException("Não existe uma venda com esse ID");
        }
        
        if (vendaDto.getValorTotal() <= 0) {
            throw new IllegalArgumentException("O valor total da venda deve ser maior que zero.");
        }

        if (vendaDto.getPercentualComissao() < 0 || vendaDto.getPercentualComissao() > 100) {
            throw new IllegalArgumentException("O percentual de comissão deve estar entre 0% e 100%.");
        }
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);

        if(cliente.isEmpty()){
            throw new RuntimeException("Não existe um cliente com esse ID");
        }
        
        vendaDto.setId(id);
        vendaDto.setDataVenda(venda.get().getDataVenda());
        vendaDto.setValorComissao(vendaDto.getValorTotal() * (vendaDto.getPercentualComissao()/100));
        vendaDto.setCliente(cliente.get());

        Venda VENDA = mapper.map(vendaDto, Venda.class);
        vendaRepository.save(VENDA);
        return vendaDto;

    }


}
