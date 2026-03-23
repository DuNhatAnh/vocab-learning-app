package com.example.vocab.session.domain;

import com.example.vocab.common.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
    private String id;
    private Long createdAt;
    private SessionStatus status;
    private String topic;
    private Integer wordCount;
}
