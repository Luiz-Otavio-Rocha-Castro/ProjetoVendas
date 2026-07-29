package com.minhavendas.vendas.services;

import java.io.IOException;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.model.Tenant;
import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.repository.TenantRepository;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.security.SecurityUtils;
import com.minhavendas.vendas.dto.request.TenantConfigRequest;

@Service
public class TenantService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private VendedorRepository vendedorRepository;

    @Transactional
    public void atualizarConfig(TenantConfigRequest request) {
        Tenant tenant = obterTenantDoVendedorLogado();
        tenant.setNomeEmpresa(request.getNomeEmpresa());
        tenantRepository.save(tenant);
    }

    @Transactional
    public void salvarLogo(MultipartFile logo) throws IOException {
        if (logo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo de logo inválido");
        }

        if (logo.getSize() > 5 * 1024 * 1024) { // Limite de 5MB
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A imagem não pode ser maior que 5MB");
        }

        Tenant tenant = obterTenantDoVendedorLogado();

        // Converte a imagem para Base64 para armazenar no TEXT logoUrl
        String contentType = logo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo deve ser uma imagem válida");
        }

        String base64Image = Base64.getEncoder().encodeToString(logo.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64Image;

        tenant.setLogoUrl(dataUrl);
        tenantRepository.save(tenant);
    }

    private Tenant obterTenantDoVendedorLogado() {
        Integer vendedorId = SecurityUtils.getVendedorIdLogado();
        if (vendedorId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        Vendedor vendedor = vendedorRepository.findById(vendedorId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado"));

        if (vendedor.getTenantId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendedor não pertence a nenhuma empresa.");
        }

        return tenantRepository.findById(vendedor.getTenantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada"));
    }
}
