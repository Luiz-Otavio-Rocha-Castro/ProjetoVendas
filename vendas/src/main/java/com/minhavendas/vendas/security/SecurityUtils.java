package com.minhavendas.vendas.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Integer getVendedorIdLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof VendedorDetails) {
            VendedorDetails detalhes = (VendedorDetails) authentication.getPrincipal();
            return detalhes.getId();
        }
        return null;
    }
}
