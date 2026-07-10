package com.minhavendas.vendas.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.minhavendas.vendas.dto.response.DocumentoResponse;
import com.minhavendas.vendas.services.DocumentoService;

@RestController
@RequestMapping("api/documentos")
public class DocumentoController {

    @Autowired
    private DocumentoService documentoService;

    /** Lista todos os documentos (sem o conteúdo binário) */
    @GetMapping
    public ResponseEntity<List<DocumentoResponse>> listar() {
        return ResponseEntity.ok(documentoService.listarTodos());
    }

    /**
     * Faz upload de um PDF associando-o a um cliente.
     * Recebe: arquivo (multipart) + clienteId (form param)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoResponse> upload(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("clienteId") Integer clienteId) {
        try {
            DocumentoResponse resp = documentoService.salvar(clienteId, arquivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            // Ex: cliente não encontrado
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /** Baixa o conteúdo do PDF */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Integer id) {
        byte[] conteudo = documentoService.baixarConteudo(id);
        String nome = documentoService.buscarNomeArquivo(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(nome != null ? nome : "documento.pdf").build());

        return ResponseEntity.ok().headers(headers).body(conteudo);
    }

    /** Remove um documento */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        documentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
