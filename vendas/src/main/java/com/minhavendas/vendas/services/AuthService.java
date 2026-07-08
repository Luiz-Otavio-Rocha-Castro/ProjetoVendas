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
    
    public AcessDTO login(AuthenticationDTO authDto){
        // 1. Cria o 'crachá temporário' (intenção de login) usando o e-mail e a senha que vieram do React
        UsernamePasswordAuthenticationToken userAuth = 
        new UsernamePasswordAuthenticationToken(authDto.getEmail(), authDto.getPassword());

        // 2. A MÁGICA ACONTECE AQUI: O authenticationManager pega o 'crachá temporário', vai até o banco de dados
        // compara a senha criptografada do banco com a senha que o React enviou e vê se batem.
        Authentication authentication = authenticationManager.authenticate(userAuth);    

        // 3. Se chegou nesta linha, a senha estava correta! Pegamos os detalhes do usuário logado.
        VendedorDetails userAuthenticate = (VendedorDetails)authentication.getPrincipal();

        // 4. Manda o JwtUtils fabricar a string do Token JWT passando o usuário verificado.
        String token = jwtUtils.generateTokenFromVendedorDetails(userAuthenticate);
        
        com.minhavendas.vendas.dto.VendedorDTO vendedorDTO = new com.minhavendas.vendas.dto.VendedorDTO();
        vendedorDTO.setId(userAuthenticate.getId());
        vendedorDTO.setNome(userAuthenticate.getNome());
        vendedorDTO.setEmail(userAuthenticate.getUsername());
        
        return new AcessDTO(token, vendedorDTO);
    }
}
