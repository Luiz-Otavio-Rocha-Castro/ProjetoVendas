package com.minhavendas.vendas.security.jwt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
    
    @Value("${projeto.jwtSecret}")
    private String jwtSecret;

       
    @Value("${projeto.jweExpirationMs}")
    private int jwtExpirationsMs;

    

}
