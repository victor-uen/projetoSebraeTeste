package com.example.Projeto3.services;

import com.example.Projeto3.entities.Categoria;
import com.example.Projeto3.entities.Comentario;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.repositories.ComentarioRepository;
import com.example.Projeto3.repositories.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComentarioRepository comentarioRepository;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, ComentarioRepository comentarioRepository) {
        this.feedbackRepository = feedbackRepository;
        this.comentarioRepository = comentarioRepository;
    }

    // Criar um novo feedback
    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    // Obter todos os feedbacks
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    // Obter feedbacks por categoria
    public List<Feedback> getFeedbacksByCategoria(Categoria categoria) {return feedbackRepository.findByCategoria(categoria);}

    // Obter um feedback por ID
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    // Editar um feedback existente
    public Optional<Feedback> updateFeedback(Long id, Feedback feedbackDetails) {
        Optional<Feedback> optionalFeedback = feedbackRepository.findById(id);

        if (optionalFeedback.isPresent()) {
            Feedback feedbackExistente = optionalFeedback.get();
            feedbackExistente.setTitulo(feedbackDetails.getTitulo());
            feedbackExistente.setMensagem(feedbackDetails.getMensagem());
            feedbackExistente.setCategoria(feedbackDetails.getCategoria());
            feedbackExistente.setCurso(feedbackDetails.getCurso());

            return Optional.of(feedbackRepository.save(feedbackExistente));
        } else {
            return Optional.empty();
        }
    }

    // Deletar um feedback
    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Comentario> createComentario(Long feedbackId, Comentario comentario) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);

        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            comentario.setFeedback(feedback);
            Comentario salvo = comentarioRepository.save(comentario);
            return Optional.of(salvo);
        } else {
            return Optional.empty();
        }
    }

}