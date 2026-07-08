package com.minhavendas.vendas.dto;

public class AcessDTO {
    private String token;
    private VendedorDTO vendedor;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
    
    public VendedorDTO getVendedor() {
        return vendedor;
    }
    
    public void setVendedor(VendedorDTO vendedor) {
        this.vendedor = vendedor;
    }

    public AcessDTO(String token, VendedorDTO vendedor) {
        this.token = token;
        this.vendedor = vendedor;
    }
}

