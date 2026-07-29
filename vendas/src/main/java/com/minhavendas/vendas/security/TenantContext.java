package com.minhavendas.vendas.security;

/**
 * Armazena o tenantId do usuário autenticado na Thread atual da requisição HTTP.
 *
 * Utiliza ThreadLocal para garantir que cada thread do pool do Tomcat
 * possua seu próprio contexto de tenant, sem interferência entre requisições concorrentes.
 *
 * CRÍTICO: O método clear() DEVE ser chamado no finally do filtro HTTP
 * para evitar memory leaks no pool de Threads.
 */
public class TenantContext {

    private static final ThreadLocal<Integer> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(Integer tenantId) {
        currentTenant.set(tenantId);
    }

    public static Integer getCurrentTenant() {
        return currentTenant.get();
    }

    /**
     * Remove o tenantId da Thread atual.
     * Deve ser chamado no finally do AuthFilterToken após a requisição ser processada.
     */
    public static void clear() {
        currentTenant.remove();
    }
}
