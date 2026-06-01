package com.minhavendas.vendas.view.model;

import com.minhavendas.vendas.view.model.Cliente.ClienteRequest;
import com.minhavendas.vendas.view.model.Venda.VendaRequest;

public class CadastroCompleto {

    private ClienteRequest cliente;
    private VendaRequest venda;   


    public ClienteRequest getCliente() { return cliente; }
    public void setCliente(ClienteRequest cliente) { this.cliente = cliente; }

    public VendaRequest getVenda() { return venda; }
    public void setVenda(VendaRequest venda) { this.venda = venda; 
}
}