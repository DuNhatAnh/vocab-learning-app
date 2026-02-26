package com.example.vocab.word.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "words")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID sessionId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String english;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String vietnamese;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    private Boolean correct;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;
}
