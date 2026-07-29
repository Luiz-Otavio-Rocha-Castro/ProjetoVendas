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

import com.minhavendas.vendas.security.TenantContext;
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

                // TRUE STATELESS: Todos os dados de sessão vêm das Claims do JWT assinado.
                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                String username = claims.getSubject();
                Integer id      = claims.get("id", Integer.class);
                String nome     = claims.get("nome", String.class);
                Integer tenantId = claims.get("tenantId", Integer.class);
                String subscriptionStatus = claims.get("subscriptionStatus", String.class);

                // GUARDA DE ASSINATURA: Bloqueia acesso antes de qualquer Controller.
                // Contas canceladas ou inativas ficam travadas aqui, sem precisar checar em cada Service.
                if ("CANCELED".equals(subscriptionStatus) || "INACTIVE".equals(subscriptionStatus)) {
                    logger.warn("Acesso negado para user={} com subscriptionStatus={}", username, subscriptionStatus);
                    response.setStatus(HttpServletResponse.SC_PAYMENT_REQUIRED); // 402
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\":\"Assinatura inativa. Renove seu plano para continuar.\"}"
                    );
                    return; // Interrompe a cadeia de filtros sem chamar o Controller
                }

                // Popula o ThreadLocal com o tenantId para o TenantFilterAspect
                if (tenantId != null) {
                    TenantContext.setCurrentTenant(tenantId);
                } else {
                    logger.warn("tenantId ausente no JWT para user={}. Verifique o cadastro do Tenant.", username);
                }

                // Reconstrói o VendedorDetails em memória com contexto completo (sem bater no banco)
                VendedorDetails userDetails = new VendedorDetails(
                    id, nome, username, null,
                    tenantId, subscriptionStatus,
                    new ArrayList<>()
                );

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            logger.error("Erro ao processar token JWT: {}", e.getMessage(), e);
        } finally {
            filterChain.doFilter(request, response);
            // CRÍTICO: Limpa o TenantContext para evitar memory leak no pool de Threads do Tomcat
            TenantContext.clear();
        }
    }

    private String getToken(HttpServletRequest request) {
        String headerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(headerToken) && headerToken.startsWith("Bearer ")) {
            return headerToken.substring(7);
        }
        return null;
    }
}
