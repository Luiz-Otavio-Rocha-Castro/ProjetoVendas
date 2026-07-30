package com.minhavendas.vendas.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.repository.TenantRepository;
import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.model.Tenant;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class MigrationRunner implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationRunner.class);

    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Executando MigrationRunner para atualizar tenant_id...");
        
        Integer defaultTenantId = 1;
        try {
            if (tenantRepository.findAll().isEmpty()) {
                Tenant t = new Tenant();
                t.setNomeEmpresa("Minha Empresa");
                t.setSubscriptionStatus("ACTIVE");
                t = tenantRepository.save(t);
                defaultTenantId = t.getId();
                logger.info("Criado Tenant padrão (ID " + defaultTenantId + ").");
            } else {
                // Se já existir tenants, pegamos o ID do primeiro para usar como fallback pros vendedores antigos
                defaultTenantId = tenantRepository.findAll().get(0).getId();
            }
        } catch (Exception e) {
            logger.warn("Não foi possível criar o Tenant padrão (possível duplicação). Pegando o primeiro disponível...");
            if (!tenantRepository.findAll().isEmpty()) {
                defaultTenantId = tenantRepository.findAll().get(0).getId();
            }
        }

        List<Vendedor> semTenant = vendedorRepository.findAll().stream()
            .filter(v -> v.getTenantId() == null)
            .collect(Collectors.toList());
            
        for(Vendedor v : semTenant) {
            v.setTenantId(defaultTenantId);
            vendedorRepository.save(v);
        }

        try {
            // Inteligência para recuperar dados criados sem tenantId, 
            // buscando o tenant_id do vendedor dono do registro.
            jdbcTemplate.execute("UPDATE cliente SET tenant_id = (SELECT tenant_id FROM vendedor WHERE vendedor.id = cliente.vendedor_id) WHERE tenant_id IS NULL");
            jdbcTemplate.execute("UPDATE venda SET tenant_id = (SELECT tenant_id FROM vendedor WHERE vendedor.id = venda.vendedor_id) WHERE tenant_id IS NULL");
            jdbcTemplate.execute("UPDATE visita SET tenant_id = (SELECT tenant_id FROM vendedor WHERE vendedor.id = visita.vendedor_id) WHERE tenant_id IS NULL");
            jdbcTemplate.execute("UPDATE documento SET tenant_id = (SELECT tenant_id FROM vendedor WHERE vendedor.id = documento.vendedor_id) WHERE tenant_id IS NULL");
            logger.info("Registros com tenant_id null foram recuperados com sucesso baseados no vendedor dono!");
        } catch (Exception e) {
            logger.error("Erro ao rodar migração de dados no BD: " + e.getMessage());
        }
    }
}
