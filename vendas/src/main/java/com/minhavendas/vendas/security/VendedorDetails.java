package com.minhavendas.vendas.security;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.minhavendas.vendas.model.Vendedor;

public class VendedorDetails implements UserDetails{

        /**
     * OBJETIVO DA CLASSE: Funciona como um "tradutor" ou adaptador. 
     * Ela pega os dados do seu Vendedor do banco de dados e os envelopa no formato 
     * padrão (UserDetails) que o motor de segurança do Spring Boot consegue entender.
     */


    private Integer id;
    
    private String nome;

    private String email;

    private String senha;

    private Collection <? extends GrantedAuthority> authorities;


    public VendedorDetails(Integer id, String nome, String email, String senha, Collection<? extends GrantedAuthority> authorities) {
            this.id = id;
            this.nome = nome;
            this.email = email;
            this.senha = senha;
            this.authorities = authorities;
        }

    public static VendedorDetails build(Vendedor vendedor){
        return new VendedorDetails(vendedor.getId(), vendedor.getNome(), vendedor.getEmail(), vendedor.getSenha(), new ArrayList<>());
    }
    
    public String getNome() {
        return nome;
    }
    
    public Integer getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // TODO Auto-generated method stub
        return authorities;
    }

    @Override
    public String getPassword() {
        // TODO Auto-generated method stub
        return senha;
    }

    @Override
    public String getUsername() {
        // TODO Auto-generated method stub
       return email;
    }



    // Métodos de controle de conta obrigatórios (todos retornando true)
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    
}
