package com.minhavendas.vendas.services;

import java.util.Optional;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

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

    @Autowired
    private com.minhavendas.vendas.repository.VendaRepository vendaRepository;

    public VendedorDTO obterVendedorId(Integer id) {
        Optional<Vendedor> vendedor = vendedorRepository.findById(id);

        if (vendedor.isEmpty()) {
            throw new IllegalArgumentException("Não existe um vendedor com esse ID");
        }

        VendedorDTO dto = mapper.map(vendedor.get(), VendedorDTO.class);

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

    public VendedorDTO adcionar(VendedorDTO vendedorDTO) {
        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);

        String senhaLimpa = vendedor.getSenha();

        String senhaCriptografada = passwordEncoder.encode(senhaLimpa);

        vendedor.setSenha(senhaCriptografada);

        vendedorRepository.save(vendedor);

        return mapper.map(vendedor, VendedorDTO.class);
    }

    public VendedorDTO atualizar(VendedorDTO vendedorDTO, Integer id) {
        VendedorDTO vendedorAntigo = obterVendedorId(id);

        vendedorDTO.setId(id);

        if (vendedorDTO.getSenha() == null || vendedorDTO.getSenha().trim().isEmpty()) {
            vendedorDTO.setSenha(vendedorAntigo.getSenha());
        } else {
            if (vendedorDTO.getSenhaAntiga() == null || vendedorDTO.getSenhaAntiga().trim().isEmpty()) {
                throw new IllegalArgumentException("A senha atual é obrigatória para alterar a senha.");
            }
            if (!passwordEncoder.matches(vendedorDTO.getSenhaAntiga(), vendedorAntigo.getSenha())) {
                throw new IllegalArgumentException("A senha atual informada está incorreta.");
            }
            vendedorDTO.setSenha(passwordEncoder.encode(vendedorDTO.getSenha()));
        }

        Vendedor vendedor = mapper.map(vendedorDTO, Vendedor.class);
        vendedorRepository.save(vendedor);
        return vendedorDTO;
    }

    public void salvarFoto(Integer id, MultipartFile foto) throws IOException {
        Vendedor vendedor = vendedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor não encontrado"));
        vendedor.setFotoPerfil(foto.getBytes());
        vendedorRepository.save(vendedor);
    }

    public byte[] obterFoto(Integer id) {
        Vendedor vendedor = vendedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor não encontrado"));
        return vendedor.getFotoPerfil();
    }
}
