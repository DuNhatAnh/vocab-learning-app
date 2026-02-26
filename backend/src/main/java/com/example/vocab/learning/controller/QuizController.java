package com.example.vocab.learning.controller;

import com.example.vocab.learning.service.LearningService;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {
    private final WordRepository wordRepository;

    @GetMapping("/random")
    public List<Word> getRandomQuiz() {
        return wordRepository.findRandomWords(10);
    }

    @PostMapping("/submit")
    public List<LearningService.EvaluationResult> submitQuiz(@RequestBody Map<UUID, String> answers) {
        List<LearningService.EvaluationResult> results = new ArrayList<>();

        for (Map.Entry<UUID, String> entry : answers.entrySet()) {
            Word word = wordRepository.findById(entry.getKey())
                    .orElse(null);

            if (word != null) {
                String userAnswer = entry.getValue().trim();
                boolean correct = word.getEnglish().equalsIgnoreCase(userAnswer);

                results.add(LearningService.EvaluationResult.builder()
                        .id(word.getId())
                        .english(word.getEnglish())
                        .vietnamese(word.getVietnamese())
                        .userAnswer(userAnswer)
                        .correct(correct)
                        .build());
            }
        }

        return results;
    }
}
