package com.minhavendas.vendas.security.jwt;

import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import com.minhavendas.vendas.security.VendedorDetails;

@Component
public class JwtUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${projeto.jwtSecret}")
    private String jwtSecret;

    @Value("${projeto.jwtExpirationMs}")
    private int jwtExpirationsMs;

    public String generateTokenFromVendedorDetails(VendedorDetails vendedorDetails) {
        return Jwts.builder()
                .setSubject(vendedorDetails.getUsername())
                .claim("id", vendedorDetails.getId())
                .claim("nome", vendedorDetails.getNome())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date().getTime()) + jwtExpirationsMs))
                .signWith(getSigninKey())
                .compact();
    }

    public Key getSigninKey() {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        return key;
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigninKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateJwtToken(String authtoken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigninKey()).build().parseClaimsJws(authtoken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT inválido: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.warn("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT não suportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Claims do Token JWT vazias: {}", e.getMessage());
        }
        return false;
    }
}


