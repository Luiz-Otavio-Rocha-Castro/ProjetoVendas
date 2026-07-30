package com.minhavendas.vendas.model;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.minhavendas.vendas.security.TenantContext;

/**
 * Listener do Hibernate que intercepta qualquer INSERT ou UPDATE
 * e injeta automaticamente o tenantId (ID da empresa) na entidade
 * com base no JWT do usuário logado.
 * 
 * Isso garante que todas as Vendas, Clientes, Visitas e Documentos 
 * sejam vinculados à empresa correta automaticamente, 
 * resolvendo o problema de dados criados com tenantId = null que ficavam "invisíveis".
 */
public class TenantEntityListener {

    private static final Logger logger = LoggerFactory.getLogger(TenantEntityListener.class);

    @PrePersist
    @PreUpdate
    public void setTenantId(Object entity) {
        Integer tenantId = TenantContext.getCurrentTenant();
        
        if (tenantId != null) {
            // Verifica o tipo da entidade e injeta o tenantId correspondente
            if (entity instanceof Venda) {
                ((Venda) entity).setTenantId(tenantId);
            } else if (entity instanceof Cliente) {
                ((Cliente) entity).setTenantId(tenantId);
            } else if (entity instanceof Visita) {
                ((Visita) entity).setTenantId(tenantId);
            } else if (entity instanceof Documento) {
                ((Documento) entity).setTenantId(tenantId);
            }
            // Vendedor e Tenant são geridos manualmente no OnboardingService
        }
    }
}
