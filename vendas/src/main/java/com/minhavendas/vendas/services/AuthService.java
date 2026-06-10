package com.minhavendas.vendas.services;


import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.minhavendas.vendas.security.jwt.JwtUtils;
import com.minhavendas.vendas.shared.AcessDTO;
import com.minhavendas.vendas.shared.AuthenticationDTO;

@Service
public class AuthService {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AcessDTO login(AuthenticationDTO authDto){
        try{
        //Cria uma intenção de login usando o e-mail e a senha que vieram do React
        UsernamePasswordAuthenticationToken userAuth = 
        new UsernamePasswordAuthenticationToken(authDto.getEmail(), authDto.getPassword());

        //Prepara mecanismo para autenticacao
        Authentication authentication = authenticationManager.authenticate(userAuth);    

        //busca o usuario logado
        VendedorDetails userAuthenticate = (VendedorDetails)authentication.getPrincipal();

        String token = jwtUtils.generateTokenFromVendedorDetails(userAuthenticate);
        
        AcessDTO acessDTO = new AcessDTO(token);

        return acessDTO;

        }catch(BadCredentialsException e){
            
        }
        return new AcessDTO("Acesso Negado");

    }
}