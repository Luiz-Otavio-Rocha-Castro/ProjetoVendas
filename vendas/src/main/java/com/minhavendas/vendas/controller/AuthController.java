package com.minhavendas.vendas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minhavendas.vendas.dto.AuthenticationDTO;
import com.minhavendas.vendas.dto.request.OnboardingRequest;
import com.minhavendas.vendas.services.AuthService;
import com.minhavendas.vendas.services.OnboardingService;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private OnboardingService onboardingService;

    /**
     * Login de usuário existente.
     * POST /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationDTO authDto) {
        return ResponseEntity.ok(authService.login(authDto));
    }

    @Autowired
    private com.minhavendas.vendas.repository.VendedorRepository vendedorRepository;

    /**
     * Cadastro de nova empresa + primeiro usuário (Onboarding SaaS).
     * POST /auth/signup
     *
     * Cria Tenant e Vendedor em transação atômica e retorna mensagem para verificar email.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody OnboardingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(onboardingService.cadastrar(request));
    }

    /**
     * Endpoint chamado quando o usuário clica no link enviado por e-mail.
     * GET /auth/verificar-email?token=xxx
     */
    @org.springframework.web.bind.annotation.GetMapping("/verificar-email")
    public ResponseEntity<?> verificarEmail(@org.springframework.web.bind.annotation.RequestParam String token) {
        com.minhavendas.vendas.model.Vendedor vendedor = vendedorRepository.findByTokenVerificacao(token)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Token de verificação inválido ou não encontrado."
            ));

        if (vendedor.getDataExpiracaoToken() != null && java.time.LocalDateTime.now().isAfter(vendedor.getDataExpiracaoToken())) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Este link de verificação expirou. Por favor, solicite um novo."
            );
        }

        // Ativa a conta
        vendedor.setEmailVerificado(true);
        vendedor.setTokenVerificacao(null);
        vendedor.setDataExpiracaoToken(null);
        vendedorRepository.save(vendedor);

        return ResponseEntity.ok(java.util.Map.of(
            "mensagem", "Sua conta foi ativada com sucesso! Você já pode fazer login no aplicativo."
        ));
    }
}

