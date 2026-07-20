package com.minhavendas.vendas.services;

import java.io.IOException;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.dto.VendedorDTO;
import com.minhavendas.vendas.security.SecurityUtils;

@Service
public class VendedorService {
    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ModelMapper mapper = new ModelMapper();

    @Autowired
    private com.minhavendas.vendas.repository.VendaRepository vendaRepository;

    @Transactional(readOnly = true)
    public VendedorDTO obterVendedorId(Integer id) {
        validarDono(id);
        
        Vendedor vendedor = vendedorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado"));

        VendedorDTO dto = mapper.map(vendedor, VendedorDTO.class);

        java.time.LocalDate hoje = java.time.LocalDate.now();
        java.time.LocalDate inicioMes = hoje.withDayOfMonth(1);
        java.time.LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        Double faturamento = vendaRepository.sumValorTotalByVendedorIdAndDataVendaBetween(id, inicioMes, fimMes);
        Integer paineis = vendaRepository.sumQuantidadePainelByVendedorIdAndDataVendaBetween(id, inicioMes, fimMes);
        Integer contratos = vendaRepository.countByVendedorIdAndDataVendaBetween(id, inicioMes, fimMes);

        dto.setFaturamentoAtual(faturamento != null ? faturamento : 0.0);
        dto.setKwpAtual(paineis != null ? paineis * 0.55 : 0.0);
        dto.setContratosAtual(contratos != null ? contratos : 0);

        return dto;
    }

    @Transactional
    public VendedorDTO adcionar(VendedorDTO vendedorDTO) {
        if (vendedorDTO.getSenha() == null || vendedorDTO.getSenha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha é obrigatória");
        }
        
        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);
        vendedor.setSenha(passwordEncoder.encode(vendedor.getSenha()));
        vendedorRepository.save(vendedor);

        return mapper.map(vendedor, VendedorDTO.class);
    }

    @Transactional
    public VendedorDTO atualizar(VendedorDTO vendedorDTO, Integer id) {
        validarDono(id);
        Vendedor vendedorAntigo = vendedorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado"));

        vendedorDTO.setId(id);

        if (vendedorDTO.getSenha() == null || vendedorDTO.getSenha().trim().isEmpty()) {
            vendedorDTO.setSenha(vendedorAntigo.getSenha());
        } else {
            if (vendedorDTO.getSenhaAntiga() == null || vendedorDTO.getSenhaAntiga().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha atual é obrigatória para alterar a senha.");
            }
            if (!passwordEncoder.matches(vendedorDTO.getSenhaAntiga(), vendedorAntigo.getSenha())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha atual informada está incorreta.");
            }
            vendedorDTO.setSenha(passwordEncoder.encode(vendedorDTO.getSenha()));
        }

        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);
        // Protege campos sensíveis de serem sobrescritos por acidente
        vendedor.setFotoPerfil(vendedorAntigo.getFotoPerfil()); 
        
        vendedorRepository.save(vendedor);
        return vendedorDTO;
    }

    @Transactional
    public void salvarFoto(Integer id, MultipartFile foto) throws IOException {
        validarDono(id);
        Vendedor vendedor = vendedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado"));
        
        if (foto.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo de foto inválido");
        }
        
        vendedor.setFotoPerfil(foto.getBytes());
        vendedorRepository.save(vendedor);
    }

    @Transactional(readOnly = true)
    public byte[] obterFoto(Integer id) {
        // A foto de perfil geralmente é pública dentro da empresa, mas se quiser fechar o IDOR:
        validarDono(id); 
        Vendedor vendedor = vendedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado"));
        return vendedor.getFotoPerfil();
    }
    
    /* --- MÉTODOS PRIVADOS --- */
    private void validarDono(Integer id) {
        Integer idLogado = SecurityUtils.getVendedorIdLogado();
        if (idLogado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        if (!idLogado.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para alterar o perfil de outro vendedor.");
        }
    }
}

