package com.minhavendas.vendas.services;


import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.minhavendas.vendas.security.jwt.JwtUtils;
import com.minhavendas.vendas.dto.AcessDTO;
import com.minhavendas.vendas.dto.AuthenticationDTO;
import com.minhavendas.vendas.security.VendedorDetails;

@Service // Diz ao Spring: "Eu sou a classe que contém a lógica de negócio principal. Crie uma instância minha e injete onde precisarem de mim."
public class AuthService {

    @Autowired // Injeção de Dependência: O Spring automaticamente pega a classe JwtUtils (que tem @Component) e coloca aqui pra você usar.
    private JwtUtils jwtUtils;

    @Autowired // Pega o Gerente de Autenticação configurado na sua classe WebSecurity.
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private com.minhavendas.vendas.repository.VendedorRepository vendedorRepository;

    @Autowired
    private com.minhavendas.vendas.repository.TenantRepository tenantRepository;

    public AcessDTO login(AuthenticationDTO authDto){
        // Verifica o e-mail antes de autenticar para dar uma mensagem clara
        com.minhavendas.vendas.model.Vendedor vendedor = vendedorRepository.findFirstByEmail(authDto.getEmail())
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        if (Boolean.FALSE.equals(vendedor.getEmailVerificado())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "E-mail não verificado. Por favor, verifique sua caixa de entrada para ativar a conta."
            );
        }

        // 1. Cria o 'crachá temporário' (intenção de login) usando o e-mail e a senha que vieram do React
        UsernamePasswordAuthenticationToken userAuth = 
        new UsernamePasswordAuthenticationToken(authDto.getEmail(), authDto.getPassword());

        // 2. A MÁGICA ACONTECE AQUI: O authenticationManager pega o 'crachá temporário', vai até o banco de dados
        // compara a senha criptografada do banco com a senha que o React enviou e vê se batem.
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(userAuth);
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Senha incorreta.");
        }   

        // 3. Se chegou nesta linha, a senha estava correta! Pegamos os detalhes do usuário logado.
        VendedorDetails userAuthenticate = (VendedorDetails)authentication.getPrincipal();

        // 4. Manda o JwtUtils fabricar a string do Token JWT passando o usuário verificado.
        String token = jwtUtils.generateTokenFromVendedorDetails(userAuthenticate);
        
        com.minhavendas.vendas.dto.VendedorDTO vendedorDTO = new com.minhavendas.vendas.dto.VendedorDTO();
        vendedorDTO.setId(userAuthenticate.getId());
        vendedorDTO.setNome(userAuthenticate.getNome());
        vendedorDTO.setEmail(userAuthenticate.getUsername());
        
        // WHITE LABEL: Buscar o Tenant para injetar o nome e a logo no frontend
        if (vendedor.getTenantId() != null) {
            tenantRepository.findById(vendedor.getTenantId()).ifPresent(tenant -> {
                vendedorDTO.setEmpresaNome(tenant.getNomeEmpresa());
                vendedorDTO.setEmpresaLogo(tenant.getLogoUrl());
            });
        }
        
        return new AcessDTO(token, vendedorDTO);
    }
}
