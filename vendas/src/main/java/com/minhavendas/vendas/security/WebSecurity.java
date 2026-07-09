package com.minhavendas.vendas.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

import com.minhavendas.vendas.security.jwt.AuthEntryPointJwt;
import com.minhavendas.vendas.security.jwt.AuthFilterToken;

@Configuration
@EnableMethodSecurity
public class WebSecurity {

    /**
 * É a central de regras de segurança. 
 * Ela define quais rotas são abertas (como o login), quais são trancadas, 
 * desabilita sessões na memória (Stateless) e ativa o criptografador de senhas (BCrypt).
 */
    
    // Injeta (chama) o "Porteiro" (AuthEntryPointJwt) que você criou antes.
    // Se alguém tentar acessar o sistema sem token, essa classe vai usar ele para barrar.
    @Autowired
    private AuthEntryPointJwt unauthorized;

    // FERRAMENTA 1: O CRIPTOGRAFADOR DE SENHAS
    // Este @Bean cria um codificador usando o algoritmo BCrypt.
    // Quando o vendedor cadastrar uma senha (ex: "123456"), esse cara transforma em um monte de letras doidas.
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // FERRAMENTA 2: O GERENTE DE AUTENTICAÇÃO
    // Esse é o "Cérebro" que orquestra o login. Quando o usuário mandar e-mail e senha,
    // o Spring usa esse AuthenticationManager para validar se as credenciais batem com o banco.
    @Bean
    public AuthenticationManager autheticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }


    @Bean
    public AuthFilterToken authFilterToken(){
        return new AuthFilterToken();
    }

    // FERRAMENTA 3: A ESTEIRA DE SEGURANÇA (SecurityFilterChain)
    // Esse método é o mais importante de todos. Ele funciona como uma "esteira de aeroporto" (filtro).
    // Cada requisição que vem do React entra nessa esteira e passa por todas as checagens abaixo:
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        // 1. CORS: Libera o React (que roda na porta 3000) para conseguir acessar o Java (na porta 8080).
        http.cors(Customizer.withDefaults());
        
        // 2. CSRF: Desabilitamos a proteção CSRF. Como nosso sistema usa JWT, essa proteção antiga 
        // baseada em cookies não é necessária e só atrapalharia o React.
        http.csrf(csrf -> csrf.disable())
        
            // 3. TRATAMENTO DE ERROS: Diz ao Spring: "Se alguém falhar na autenticação, 
            // use o porteiro que injetamos lá em cima ('unauthorized') para responder".
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorized))
            
            // 4. POLÍTICA DE SESSÃO STATELESS: O Java não vai salvar nada na memória dele.
            // O servidor não lembra quem você é. Cada requisição do React DEVE trazer o Token JWT para se identificar.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 5. REGRAS DE ACESSO (Quem entra onde):
            // .requestMatchers("/auth/**").permitAll(): Abre uma EXCEÇÃO. Qualquer rota que comece com "/auth/"
            // (como /auth/login ou /auth/cadastro) está TOTALMENTE LIBERADA para qualquer um acessar sem token.
            .authorizeHttpRequests(auth ->  auth.requestMatchers("/auth/**").permitAll()
                                   .requestMatchers("/api/vendas-vendedor/**").permitAll()
                                   .requestMatchers("/api/health").permitAll()
                                .anyRequest().authenticated());
            
        http.addFilterBefore(authFilterToken(), UsernamePasswordAuthenticationFilter.class);

        // Finaliza a montagem da esteira e devolve ela pronta para o Spring Boot monitorar o sistema.
        return http.build();

    }

    // Configuração Global de CORS para permitir requisições do frontend com o Token
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite qualquer domínio de frontend acessar a API (seguro com JWT e necessário para o deploy)
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}