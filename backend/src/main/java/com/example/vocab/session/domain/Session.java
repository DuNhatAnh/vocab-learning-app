package com.example.vocab.session.domain;

import com.example.vocab.common.enums.SessionStatus;
import com.google.cloud.firestore.annotation.DocumentId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
    @DocumentId
    private String id;
    private Long createdAt;
    private SessionStatus status;
    private String topic;
    private Integer wordCount;
}
