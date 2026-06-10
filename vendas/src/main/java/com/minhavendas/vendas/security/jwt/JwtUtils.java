package com.minhavendas.vendas.security.jwt;

import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;

import com.minhavendas.vendas.security.VendedorDetails;


/**
 * Responsável por criar o Token JWT criptografado quando o usuário faz login com sucesso 
 * e também por validar o token que o React envia nas requisições seguintes.
 */


// A anotação @Component diz ao Spring Boot que esta classe é um componente gerenciado por ele.
// Isso permite que você a injete em outras classes (como no Controller de Login) usando @Autowired.
@Component
public class JwtUtils {
    
    // Busca a senha mestre de assinatura no arquivo 'application.properties'
    @Value("${projeto.jwtSecret}")
    private String jwtSecret;

    // Busca o tempo de validade do token (em milissegundos) no arquivo 'application.properties'
    @Value("${projeto.jwtExpirationMs}")
    private int jwtExpirationsMs;

    
    // GERAR O TOKEN (O Crachá do Usuário)
    // Este método é chamado quando o vendedor digita e-mail e senha corretos. 
    // Ele cria a string criptografada que o React vai salvar no navegador.
    public String generateTokenFromVendedorDetails(VendedorDetails vendedorDetails ){
        return Jwts.builder()
        .setSubject(vendedorDetails.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date((new Date().getTime()) + jwtExpirationsMs))
        .signWith(getSigninKey())
        .compact();

        // Jwts.builder() inicia a fabricação do Token
        // .setIssuedAt define a data/hora exata em que o token foi criado (Agora)
    
        // .setExpiration define o momento exato em que o token vai vencer.
        // Ele pega a hora atual em milissegundos e soma o tempo configurado (ex: 24 horas).
        

        // .signWith assina o token digitalmente.

        //.compact junta tudo que foi definido e tranforma em uma string
    }


    // CONVERTER A SENHA EM CHAVE CRIPTOGRÁFICA
    // O JWT não aceita o texto puro do 'application.properties' diretamente para assinar.
    // Este método pega o texto em Base64 do seu segredo e o transforma em um objeto de Chave Secreta real (SecretKey).
    public Key getSigninKey(){
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        return key;
    }

    public boolean validateJwtToken(String authtoken){
        try {
            Jwts.parserBuilder().setSigningKey(getSigninKey()).build().parseClaimsJws(authtoken);
            return true;
        
        } catch (MalformedJwtException e) {
            System.out.println("Token inválido" + e);
        }
         catch (ExpiredJwtException e) {
            System.out.println("Token expirado" + e);
        }
        catch (UnsupportedJwtException e) {
            System.out.println("Token não suportado" + e);
        }
        catch (IllegalArgumentException e) {
            System.out.println("Token Argumento inválido" + e);
        }

        return false;
    }

}

