package com.example.Projeto3.controllers;

import com.example.Projeto3.dtos.ComentarioRequest;
import com.example.Projeto3.entities.Comentario;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.services.ComentarioService;
import com.example.Projeto3.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/comentarios")
@CrossOrigin(origins = "*") // opcional: permite requisições do front-end
public class ComentarioController {

    private final ComentarioService comentarioService;
    private final FeedbackService feedbackService;

    @Autowired
    public ComentarioController(ComentarioService comentarioService, FeedbackService feedbackService) {
        this.comentarioService = comentarioService;
        this.feedbackService = feedbackService;
    }

    // 🔹 Criar um novo comentário
    @PostMapping
    public ResponseEntity<Comentario> createComentario(@RequestBody ComentarioRequest request) {
        Optional<Feedback> feedbackOpt = feedbackService.getFeedbackById(request.feedbackId());
        if (feedbackOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Comentario comentario = new Comentario();
        comentario.setMensagem(request.mensagem());
        comentario.setFeedback(feedbackOpt.get());
        comentario.setData(LocalDateTime.now());

        Comentario novoComentario = comentarioService.createComentario(comentario);
        return ResponseEntity.ok(novoComentario);
    }

    // 🔹 Listar todos os comentários de um feedback específico
    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<List<Comentario>> getComentariosByFeedbackId(@PathVariable Long feedbackId) {
        List<Comentario> comentarios = comentarioService.getComentariosByFeedbackId(feedbackId);

        if (comentarios.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(comentarios);
    }
}