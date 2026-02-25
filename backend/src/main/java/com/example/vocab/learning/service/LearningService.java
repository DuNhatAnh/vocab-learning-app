package com.example.vocab.learning.service;

import com.example.vocab.common.enums.SessionStatus;
import com.example.vocab.session.service.SessionService;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.service.WordService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearningService {
    private final SessionService sessionService;
    private final WordService wordService;

    @Data
    @Builder
    public static class EvaluationResult {
        private String english;
        private String vietnamese;
        private String userAnswer;
        private boolean correct;
    }

    @Transactional
    public List<EvaluationResult> submitLearning(UUID sessionId, Map<UUID, String> answers) {
        List<Word> words = wordService.getWordsBySessionId(sessionId);
        List<EvaluationResult> results = new ArrayList<>();

        for (Word word : words) {
            String userAnswer = answers.getOrDefault(word.getId(), "").trim();
            boolean correct = word.getEnglish().equalsIgnoreCase(userAnswer);

            word.setUserAnswer(userAnswer);
            word.setCorrect(correct);

            results.add(EvaluationResult.builder()
                    .english(word.getEnglish())
                    .vietnamese(word.getVietnamese())
                    .userAnswer(userAnswer)
                    .correct(correct)
                    .build());
        }

        wordService.updateWords(words);
        sessionService.updateStatus(sessionId, SessionStatus.DONE);
        return results;
    }

    public List<EvaluationResult> getResults(UUID sessionId) {
        List<Word> words = wordService.getWordsBySessionId(sessionId);
        List<EvaluationResult> results = new ArrayList<>();

        for (Word word : words) {
            results.add(EvaluationResult.builder()
                    .english(word.getEnglish())
                    .vietnamese(word.getVietnamese())
                    .userAnswer(word.getUserAnswer() != null ? word.getUserAnswer() : "")
                    .correct(word.getCorrect() != null ? word.getCorrect() : false)
                    .build());
        }
        return results;
    }
}
