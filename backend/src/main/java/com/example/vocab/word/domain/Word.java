package com.example.vocab.word.domain;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {
    @DocumentId
    private String id;
    private String sessionId;
    private String english;
    private String vietnamese;
    private Integer orderIndex;
    private String userAnswer;
    private Boolean correct;
    private String imageUrl;
}
