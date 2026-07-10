package com.minhavendas.vendas.services;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.minhavendas.vendas.dto.response.DocumentoResponse;
import com.minhavendas.vendas.model.Cliente;
import com.minhavendas.vendas.model.Documento;
import com.minhavendas.vendas.repository.ClienteRepository;
import com.minhavendas.vendas.repository.DocumentoRepository;

@Service
public class DocumentoService {

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public DocumentoResponse salvar(Integer clienteId, MultipartFile arquivo) throws IOException {
        Optional<Cliente> clienteOpt = clienteRepository.findById(clienteId);
        if (clienteOpt.isEmpty()) {
            throw new RuntimeException("Cliente não encontrado com ID: " + clienteId);
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Apenas arquivos PDF são aceitos.");
        }

        Documento doc = new Documento();
        doc.setNomeArquivo(arquivo.getOriginalFilename());
        doc.setTamanhoBytes(arquivo.getSize());
        doc.setDataEnvio(LocalDate.now());
        doc.setConteudo(arquivo.getBytes());
        doc.setCliente(clienteOpt.get());

        doc = documentoRepository.save(doc);

        return toResponse(doc);
    }

    public List<DocumentoResponse> listarTodos() {
        return documentoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public byte[] baixarConteudo(Integer id) {
        Documento doc = documentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado: " + id));
        return doc.getConteudo();
    }

    public String buscarNomeArquivo(Integer id) {
        Documento doc = documentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado: " + id));
        return doc.getNomeArquivo();
    }

    public void deletar(Integer id) {
        if (!documentoRepository.existsById(id)) {
            throw new RuntimeException("Documento não encontrado: " + id);
        }
        documentoRepository.deleteById(id);
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
