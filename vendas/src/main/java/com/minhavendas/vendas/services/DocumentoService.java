package com.minhavendas.vendas.services;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.minhavendas.vendas.dto.response.DocumentoResponse;
import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.model.Documento;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.repository.DocumentoRepository;
import com.minhavendas.vendas.security.SecurityUtils;

@Service
public class DocumentoService {

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public DocumentoResponse salvar(Integer clienteId, MultipartFile arquivo) throws IOException {
        Integer vendedorId = getVendedorLogadoSeguro();
        
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado com ID: " + clienteId));

        if (cliente.getVendedorId() != null && !cliente.getVendedorId().equals(vendedorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode enviar documentos para um cliente que não é seu.");
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas arquivos PDF são aceitos.");
        }

        Documento doc = new Documento();
        doc.setNomeArquivo(arquivo.getOriginalFilename());
        doc.setTamanhoBytes(arquivo.getSize());
        doc.setDataEnvio(LocalDate.now());
        doc.setConteudo(arquivo.getBytes());
        doc.setCliente(cliente);
        doc.setVendedorId(vendedorId);

        doc = documentoRepository.save(doc);

        return toResponse(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarTodos() {
        Integer vendedorId = getVendedorLogadoSeguro();
        return documentoRepository.findByVendedorIdOrVendedorIdIsNull(vendedorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] baixarConteudo(Integer id) {
        Documento doc = buscarDocumentoValidandoDono(id);
        return doc.getConteudo();
    }

    @Transactional(readOnly = true)
    public String buscarNomeArquivo(Integer id) {
        Documento doc = buscarDocumentoValidandoDono(id);
        return doc.getNomeArquivo();
    }

    @Transactional
    public void deletar(Integer id) {
        Documento doc = buscarDocumentoValidandoDono(id);
        documentoRepository.delete(doc);
    }

    /* --- MÉTODOS PRIVADOS DE APOIO --- */

    private Integer getVendedorLogadoSeguro() {
        Integer id = SecurityUtils.getVendedorIdLogado();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return id;
    }

    private Documento buscarDocumentoValidandoDono(Integer id) {
        Documento doc = documentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado: " + id));
                
        if (doc.getVendedorId() != null && !doc.getVendedorId().equals(getVendedorLogadoSeguro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este documento.");
        }
        
        return doc;
    }

    private DocumentoResponse toResponse(Documento doc) {
        DocumentoResponse resp = new DocumentoResponse();
        resp.setId(doc.getId());
        resp.setNomeArquivo(doc.getNomeArquivo());
        resp.setTamanhoBytes(doc.getTamanhoBytes());
        resp.setDataEnvio(doc.getDataEnvio());
        if (doc.getCliente() != null) {
            resp.setClienteId(doc.getCliente().getId());
            resp.setClienteNome(doc.getCliente().getNome());
        }
        return resp;
    }
}
