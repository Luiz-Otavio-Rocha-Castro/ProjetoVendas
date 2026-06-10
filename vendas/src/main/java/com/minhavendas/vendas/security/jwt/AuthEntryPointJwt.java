package com.minhavendas.vendas.security.jwt;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;


//a classe AuthEntryPointJwt serve para proteger as
// rotas do seu sistema contra intrusos e avisar o React quando 
// alguém tenta "burlar" o login.


@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint{


    // O método 'commence' é o método obrigatório do contrato (interface).
    // Ele é disparado AUTOMATICAMENTE pelo Spring toda vez que uma requisição falhar na autenticação.
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException, ServletException {
        
        // FORMATO DA RESPOSTA: Avisa ao navegador/React que o que vamos devolver é um texto no formato JSON.
        response.setContentType("application/json");
        // STATUS HTTP: Define o código de erro HTTP como 401 (SC_UNAUTHORIZED). 
        // Isso faz o React entender imediatamente na aba Network/Rede que o acesso foi negado.
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        // 3. O CORPO DA MENSAGEM: Criamos um "Map" (que funciona como um objeto chave:valor)
        // para estruturar a mensagem de erro que vai aparecer na tela para o desenvolvedor frontend.
        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        

        // 4. TRADUTOR DE OBJETOS: O 'ObjectMapper' é uma ferramenta da biblioteca Jackson.
        // Ele serve para pegar o nosso 'Map' do Java e transformá-lo lindamente em um texto JSON (string).
        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);



    }

    
}
