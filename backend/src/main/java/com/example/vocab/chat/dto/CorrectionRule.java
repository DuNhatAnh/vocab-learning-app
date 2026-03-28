package com.example.vocab.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionRule {
    private String input;
    private Output output;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Output {
        @JsonProperty("corrected_sentence")
        private String corrected_sentence;
        private List<Mistake> mistakes;
        @JsonProperty("natural_reply")
        private String natural_reply;
        @JsonProperty("follow_up_question")
        private String follow_up_question;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Mistake {
        private String wrong;
        private String reason;
        private String fix;
    }
}
