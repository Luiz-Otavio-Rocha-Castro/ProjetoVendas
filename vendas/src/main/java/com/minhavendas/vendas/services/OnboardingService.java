package com.minhavendas.vendas.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.billing.SubscriptionService;
import com.minhavendas.vendas.dto.request.OnboardingRequest;
import com.minhavendas.vendas.dto.response.OnboardingResponse;
import com.minhavendas.vendas.model.Tenant;
import com.minhavendas.vendas.model.Vendedor;
import com.minhavendas.vendas.repository.TenantRepository;
import com.minhavendas.vendas.repository.VendedorRepository;
import com.minhavendas.vendas.security.VendedorDetails;
import com.minhavendas.vendas.security.jwt.JwtUtils;
import com.minhavendas.vendas.util.EmailValidator;

/**
 * Serviço de Onboarding (Cadastro de Novo Cliente SaaS).
 *
 * GARANTIA TRANSACIONAL: O método `cadastrar` usa @Transactional para garantir
 * que a criação do Tenant e do Vendedor ocorram atomicamente.
 * Se qualquer etapa falhar (ex: e-mail duplicado), o banco faz rollback completo
 * e nenhum registro é persistido parcialmente.
 *
 * FLUXO:
 * 1. Valida e-mail único
 * 2. Cria o Tenant (Empresa)
 * 3. Cria o Vendedor Admin e vincula ao Tenant
 * 4. Gera JWT com tenantId e subscriptionStatus assinados
 * 5. Retorna resposta que permite login automático no frontend
 */
@Service
public class OnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingService.class);

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.minhavendas.vendas.services.EmailService emailService;

    /**
     * Cadastra uma nova empresa e seu primeiro usuário administrador em UMA ÚNICA TRANSAÇÃO.
     *
     * @param request Dados do formulário de cadastro.
     * @return OnboardingResponse com dados do tenant/usuário criados e mensagem de verificação.
     * @throws ResponseStatusException 409 se e-mail já estiver em uso.
     * @throws ResponseStatusException 400 se campos obrigatórios estiverem ausentes.
     */
    @Transactional
    public OnboardingResponse cadastrar(OnboardingRequest request) {
        // --- VALIDAÇÕES INICIAIS ---
        validarRequest(request);

        // Verifica unicidade do e-mail antes de criar qualquer registro
        java.util.Optional<Vendedor> existente = vendedorRepository.findFirstByEmail(request.getEmail().trim().toLowerCase());
        if (existente.isPresent()) {
            Vendedor v = existente.get();
            // Se o e-mail ja foi verificado, bloqueia o cadastro.
            if (v.getEmailVerificado() != null && v.getEmailVerificado()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Este e-mail jA estA cadastrado e ativo no sistema.");
            } else {
                // Se nao foi verificado, o usuario provavelmente perdeu o link ou deu erro antes.
                // Ao inves de deletar (o que causa erro 500 no banco por conflito de transacao), nos ATUALIZAMOS a conta.
                logger.info("Atualizando conta nao verificada antiga para nova tentativa: {}", v.getEmail());
                
                v.setNome(request.getNomeVendedor().trim());
                v.setSenha(passwordEncoder.encode(request.getSenha()));
                v.setRegiaoAtuacao(request.getRegiaoAtuacao());
                
                String token = java.util.UUID.randomUUID().toString();
                v.setTokenVerificacao(token);
                v.setDataExpiracaoToken(java.time.LocalDateTime.now().plusHours(24));
                vendedorRepository.save(v);
                
                Tenant t = tenantRepository.findById(v.getTenantId()).orElse(new Tenant());
                t.setNomeEmpresa(request.getNomeEmpresa().trim());
                t.setCnpj(request.getCnpj());
                t.setSubscriptionStatus(SubscriptionService.STATUS_TRIAL);
                try {
                    tenantRepository.save(t);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "O nome da empresa '" + t.getNomeEmpresa() + "' jA estA em uso. Tente outro nome.");
                }
                
                emailService.enviarEmailVerificacao(v.getEmail(), v.getNome(), token);
                
                OnboardingResponse response = new OnboardingResponse();
                response.setTenantId(t.getId());
                response.setNomeEmpresa(t.getNomeEmpresa());
                response.setSubscriptionStatus(t.getSubscriptionStatus());
                response.setVendedorId(v.getId());
                response.setNomeVendedor(v.getNome());
                response.setEmail(v.getEmail());
                response.setMensagem("Cadastro realizado com sucesso! Verifique sua caixa de entrada (e spam) para ativar sua conta.");
                return response;
            }
        }

        // --- ETAPA 1: Criar o Tenant (Empresa) ---
        Tenant tenant = new Tenant();
        tenant.setNomeEmpresa(request.getNomeEmpresa().trim());
        tenant.setCnpj(request.getCnpj());
        tenant.setSubscriptionStatus(SubscriptionService.STATUS_TRIAL); // Começa em período de teste
        try {
            tenant = tenantRepository.save(tenant);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "O nome da empresa '" + tenant.getNomeEmpresa() + "' jA estA em uso no sistema. Por favor, tente um nome diferente ou adicione um sufixo (Ex: Empresa Filial).");
        }

        logger.info("Tenant criado: id={}, empresa='{}'", tenant.getId(), tenant.getNomeEmpresa());

        // --- ETAPA 2: Criar o Vendedor Admin vinculado ao Tenant (Aguardando Verificação) ---
        Vendedor vendedor = new Vendedor();
        vendedor.setNome(request.getNomeVendedor().trim());
        vendedor.setEmail(request.getEmail().trim().toLowerCase());
        vendedor.setSenha(passwordEncoder.encode(request.getSenha())); // Hash BCrypt
        vendedor.setRegiaoAtuacao(request.getRegiaoAtuacao());
        vendedor.setTenantId(tenant.getId()); // VÍNCULO: Vendedor → Tenant
        
        // Bloqueia a conta e gera token de verificação
        vendedor.setEmailVerificado(false);
        String token = java.util.UUID.randomUUID().toString();
        vendedor.setTokenVerificacao(token);
        vendedor.setDataExpiracaoToken(java.time.LocalDateTime.now().plusHours(24));
        
        vendedor = vendedorRepository.save(vendedor);

        logger.info("Vendedor Admin criado: id={}, email='{}', tenantId={}. Aguardando verificação de e-mail.",
                vendedor.getId(), vendedor.getEmail(), tenant.getId());

        // --- ETAPA 3: Disparar e-mail de verificação (Assíncrono via Resend/Log) ---
        emailService.enviarEmailVerificacao(vendedor.getEmail(), vendedor.getNome(), token);

        // --- ETAPA 4: Montar e retornar a resposta (Sem JWT!) ---
        OnboardingResponse response = new OnboardingResponse();
        response.setTenantId(tenant.getId());
        response.setNomeEmpresa(tenant.getNomeEmpresa());
        response.setSubscriptionStatus(tenant.getSubscriptionStatus());
        response.setVendedorId(vendedor.getId());
        response.setNomeVendedor(vendedor.getNome());
        response.setEmail(vendedor.getEmail());
        response.setMensagem("Cadastro realizado com sucesso! Verifique sua caixa de entrada (e spam) para ativar sua conta.");

        return response;
    }

    /**
     * Valida os campos obrigatórios do formulário de cadastro.
     * Lança ResponseStatusException 400 com mensagem descritiva para o frontend exibir.
     */
    private void validarRequest(OnboardingRequest request) {
        if (request.getNomeEmpresa() == null || request.getNomeEmpresa().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nome da empresa é obrigatório.");
        }
        if (request.getNomeVendedor() == null || request.getNomeVendedor().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nome do responsável é obrigatório.");
        }
        // Delega validação de e-mail para o utilitário centralizado
        EmailValidator.validarOuLancarErro(request.getEmail());

        if (request.getSenha() == null || request.getSenha().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A senha deve ter no mínimo 8 caracteres.");
        }
    }
}
