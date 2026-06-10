package com.minhavendas.vendas.dto;

import com.minhavendas.vendas.dto.request.ClienteRequest;
import com.minhavendas.vendas.dto.request.VendaRequest;

public class CadastroCompleto {

    private ClienteRequest cliente;
    private VendaRequest venda;   


    public ClienteRequest getCliente() { return cliente; }
    public void setCliente(ClienteRequest cliente) { this.cliente = cliente; }

    public VendaRequest getVenda() { return venda; }
    public void setVenda(VendaRequest venda) { this.venda = venda; 
}
}

