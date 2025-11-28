package com.example.Projeto3.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Table(name = "comentario")
@Entity
@Getter
@Setter
@NoArgsConstructor

public class Comentario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idComentario;

    private String mensagem;

    @ManyToOne
    @JoinColumn(name = "idFeedback")
    @JsonBackReference
    private Feedback feedback;

    private LocalDateTime data = LocalDateTime.now();
}
