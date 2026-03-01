package com.example.vocab.quiz.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer total;

    @Column(columnDefinition = "TEXT")
    private String wordIds; // Comma-separated UUIDs

    @Column(nullable = false)
    private String type; // RANDOM, GRAMMAR_MCQ, GRAMMAR_FITB

    private String topic; // Grammar tense or topic name
}
