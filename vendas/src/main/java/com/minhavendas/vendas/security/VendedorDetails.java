package com.minhavendas.vendas.security;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.minhavendas.vendas.model.Vendedor;

/**
 * Adaptador entre a entidade Vendedor e o contrato UserDetails do Spring Security.
 * Carrega também os dados de tenant para que o JwtUtils possa assiná-los no token,
 * eliminando a necessidade de consultar o banco em cada requisição.
 */
public class VendedorDetails implements UserDetails {

    private Integer id;
    private String nome;
    private String email;
    private String senha;
    private Integer tenantId;
    private String subscriptionStatus;
    private Collection<? extends GrantedAuthority> authorities;

    public VendedorDetails(Integer id, String nome, String email, String senha,
                           Integer tenantId, String subscriptionStatus,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.tenantId = tenantId;
        this.subscriptionStatus = subscriptionStatus;
        this.authorities = authorities;
    }

    /**
     * Constrói o VendedorDetails a partir da entidade Vendedor.
     * Para o login, o Tenant e seu status são buscados aqui e assinados no JWT,
     * evitando buscas ao banco em cada requisição subsequente.
     */
    public static VendedorDetails build(Vendedor vendedor) {
        return new VendedorDetails(
            vendedor.getId(),
            vendedor.getNome(),
            vendedor.getEmail(),
            vendedor.getSenha(),
            vendedor.getTenantId(),
            "ACTIVE", // Default até o Passo 3 (Billing) ser implementado
            new ArrayList<>()
        );
    }

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public Integer getTenantId() { return tenantId; }
    public String getSubscriptionStatus() { return subscriptionStatus; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return email; }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
