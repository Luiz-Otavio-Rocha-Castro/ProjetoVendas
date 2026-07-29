package com.minhavendas.vendas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.minhavendas.vendas.services.TenantService;
import com.minhavendas.vendas.dto.request.TenantConfigRequest;

@RestController
@RequestMapping("api/tenant")
public class TenantController {

    @Autowired
    private TenantService tenantService;

    @PutMapping("/config")
    public ResponseEntity<Void> atualizarConfig(@RequestBody TenantConfigRequest request) {
        tenantService.atualizarConfig(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadLogo(@RequestParam("logo") MultipartFile logo) {
        try {
            tenantService.salvarLogo(logo);
            return ResponseEntity.ok().build();
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e; // Deixa o Spring cuidar da resposta (400, 401, 404, etc)
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
