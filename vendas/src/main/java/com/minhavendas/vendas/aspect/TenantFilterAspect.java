package com.minhavendas.vendas.aspect;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.minhavendas.vendas.security.TenantContext;

/**
 * Aspecto AOP que intercepta TODAS as chamadas aos Repositórios JPA
 * e ativa automaticamente o filtro de tenant do Hibernate na sessão atual.
 *
 * Isso garante que nenhuma query ao banco de dados retorne dados de um tenant diferente,
 * mesmo que o desenvolvedor esqueça de filtrar manualmente no Service.
 *
 * Esta é a segunda camada de segurança (a primeira é a validação no Service layer).
 */
@Aspect
@Component
public class TenantFilterAspect {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilterAspect.class);

    @Autowired
    private EntityManager entityManager;

    /**
     * Intercepta qualquer método em qualquer repositório do pacote.
     * Antes da query ser executada, ativa o @Filter do Hibernate com o tenantId correto.
     */
    @Before("execution(* com.minhavendas.vendas.repository.*.*(..))")
    public void enableTenantFilter() {
        Integer tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            logger.debug("Filtro multi-tenant ativado para tenantId={}", tenantId);
        } else {
            // Se não houver tenant no contexto (ex: rota pública), o filtro não é ativado
            // e a query retorna os dados sem isolamento (necessário para /auth/login, etc.)
            logger.debug("TenantContext vazio - filtro multi-tenant não aplicado (rota pública?)");
        }
    }
}
