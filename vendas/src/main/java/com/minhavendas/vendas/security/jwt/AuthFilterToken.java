package com.minhavendas.vendas.security.jwt;

import java.io.IOException;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.minhavendas.vendas.security.VendedorDetails;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthFilterToken extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthFilterToken.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getToken(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                // TRUE STATELESS: Não consultamos mais o banco de dados aqui.
                // Extraímos os dados diretamente das "Claims" (cargas) do JWT.
                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                String username = claims.getSubject();
                Integer id = claims.get("id", Integer.class);
                String nome = claims.get("nome", String.class);

                // Criamos o usuário em memória apenas com o necessário para a Sessão, evitando I/O no banco.
                VendedorDetails userDetails = new VendedorDetails(id, nome, username, null, new ArrayList<>());

                UsernamePasswordAuthenticationToken auth = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            logger.error("Ocorreu um erro ao processar o token JWT: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String getToken(HttpServletRequest request) {
        String headerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(headerToken) && headerToken.startsWith("Bearer ")) {
            return headerToken.substring(7);
        }
        return null;
    }
}

