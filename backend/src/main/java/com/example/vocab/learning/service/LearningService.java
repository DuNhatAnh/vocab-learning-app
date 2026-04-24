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

@Service
@RequiredArgsConstructor
public class LearningService {
    private final SessionService sessionService;
    private final WordService wordService;

    @Data
    @Builder
    public static class EvaluationResult {
        private String id;
        private String english;
        private String vietnamese;
        private String userAnswer;
        private boolean correct;
        private boolean skipped;
        private String imageUrl;
    }

    public List<EvaluationResult> submitLearning(String sessionId, Map<String, String> answers) {
        List<Word> words = wordService.getWordsBySessionId(sessionId);
        List<EvaluationResult> results = new ArrayList<>();

        for (Word word : words) {
            String userAnswer = answers.getOrDefault(word.getId(), "").trim();
            boolean skipped = userAnswer.equalsIgnoreCase("skip");
            boolean correct = !skipped && word.getEnglish().equalsIgnoreCase(userAnswer);

            word.setUserAnswer(userAnswer);
            word.setCorrect(correct);

            results.add(EvaluationResult.builder()
                    .id(word.getId())
                    .english(word.getEnglish())
                    .vietnamese(word.getVietnamese())
                    .userAnswer(userAnswer)
                    .correct(correct)
                    .skipped(skipped)
                    .imageUrl(word.getImageUrl())
                    .build());
        }

        wordService.updateWords(words);
        sessionService.updateStatus(sessionId, SessionStatus.DONE);
        return results;
    }

    public List<EvaluationResult> getResults(String sessionId) {
        List<Word> words = wordService.getWordsBySessionId(sessionId);
        List<EvaluationResult> results = new ArrayList<>();

        for (Word word : words) {
            String userAnswer = word.getUserAnswer() != null ? word.getUserAnswer() : "";
            boolean skipped = userAnswer.equalsIgnoreCase("skip");
            results.add(EvaluationResult.builder()
                    .id(word.getId())
                    .english(word.getEnglish())
                    .vietnamese(word.getVietnamese())
                    .userAnswer(userAnswer)
                    .correct(word.getCorrect() != null ? word.getCorrect() : false)
                    .skipped(skipped)
                    .imageUrl(word.getImageUrl())
                    .build());
        }
        return results;
    }
}
