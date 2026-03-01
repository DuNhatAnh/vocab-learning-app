package com.example.vocab.learning.controller;

import com.example.vocab.learning.service.LearningService;
import com.example.vocab.quiz.domain.QuizHistory;
import com.example.vocab.quiz.repository.QuizHistoryRepository;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {
    private final WordRepository wordRepository;
    private final QuizHistoryRepository quizHistoryRepository;

    @GetMapping("/random")
    public List<Word> getRandomQuiz() {
        List<Word> allWords = wordRepository.findAll();
        List<QuizHistory> last5Sessions = quizHistoryRepository.findTop5ByOrderByTimestampDesc();

        // Count occurrences of each word in last 5 sessions
        Map<UUID, Integer> wordOccurrences = new HashMap<>();
        for (QuizHistory history : last5Sessions) {
            String[] ids = history.getWordIds().split(",");
            for (String idStr : ids) {
                if (!idStr.isEmpty()) {
                    UUID id = UUID.fromString(idStr);
                    wordOccurrences.put(id, wordOccurrences.getOrDefault(id, 0) + 1);
                }
            }
        }

        // Filter words: appearing < 2 times
        List<Word> availableWords = allWords.stream()
                .filter(w -> wordOccurrences.getOrDefault(w.getId(), 0) < 2)
                .collect(Collectors.toList());

        // If not enough words (unlikely with 102 words and 5*10=50 slots), fallback to
        // all words
        if (availableWords.size() < 10) {
            availableWords = allWords;
        }

        // Prioritize words with 0 occurrences to ensure rotation
        List<Word> zeroOccurrenceWords = availableWords.stream()
                .filter(w -> wordOccurrences.getOrDefault(w.getId(), 0) == 0)
                .collect(Collectors.toList());

        List<Word> selectedWords = new ArrayList<>();
        Collections.shuffle(zeroOccurrenceWords);

        selectedWords.addAll(zeroOccurrenceWords.subList(0, Math.min(zeroOccurrenceWords.size(), 10)));

        if (selectedWords.size() < 10) {
            List<Word> oneOccurrenceWords = availableWords.stream()
                    .filter(w -> wordOccurrences.getOrDefault(w.getId(), 0) == 1)
                    .collect(Collectors.toList());
            Collections.shuffle(oneOccurrenceWords);
            selectedWords.addAll(
                    oneOccurrenceWords.subList(0, Math.min(oneOccurrenceWords.size(), 10 - selectedWords.size())));
        }

        // In case we still don't have 10 (though impossible with 102 words), shuffle
        // and pick from available
        if (selectedWords.size() < 10) {
            Collections.shuffle(availableWords);
            for (Word w : availableWords) {
                if (!selectedWords.contains(w)) {
                    selectedWords.add(w);
                    if (selectedWords.size() == 10)
                        break;
                }
            }
        }

        return selectedWords;
    }

    @PostMapping("/submit")
    public List<LearningService.EvaluationResult> submitQuiz(@RequestBody Map<UUID, String> answers) {
        List<LearningService.EvaluationResult> results = new ArrayList<>();
        List<UUID> wordIds = new ArrayList<>();
        int score = 0;

        for (Map.Entry<UUID, String> entry : answers.entrySet()) {
            if (entry.getKey() == null)
                continue;

            wordIds.add(entry.getKey());
            Word word = wordRepository.findById(entry.getKey()).orElse(null);

            if (word != null) {
                String userAnswer = entry.getValue().trim();
                boolean correct = word.getEnglish().equalsIgnoreCase(userAnswer);
                if (correct)
                    score++;

                results.add(LearningService.EvaluationResult.builder()
                        .id(word.getId())
                        .english(word.getEnglish())
                        .vietnamese(word.getVietnamese())
                        .userAnswer(userAnswer)
                        .correct(correct)
                        .imageUrl(word.getImageUrl())
                        .build());
            }
        }

        // Save history
        String wordIdsStr = wordIds.stream().map(UUID::toString).collect(Collectors.joining(","));
        QuizHistory history = QuizHistory.builder()
                .timestamp(LocalDateTime.now())
                .score(score)
                .total(wordIds.size())
                .wordIds(wordIdsStr)
                .type("RANDOM")
                .topic("Luyện tập ngẫu nhiên")
                .build();
        quizHistoryRepository.save(history);

        maintainHistoryLimit(10);

        return results;
    }

    @PostMapping("/grammar-submit")
    public void submitGrammarHistory(@RequestBody Map<String, Object> data) {
        String type = (String) data.get("type");
        String topic = (String) data.get("topic");
        Integer score = (Integer) data.get("score");
        Integer total = (Integer) data.get("total");

        QuizHistory history = QuizHistory.builder()
                .timestamp(LocalDateTime.now())
                .score(score)
                .total(total)
                .type(type)
                .topic(topic)
                .build();
        quizHistoryRepository.save(history);

        maintainHistoryLimit(10);
    }

    private void maintainHistoryLimit(int limit) {
        List<QuizHistory> allHistory = quizHistoryRepository.findAll();
        if (allHistory.size() > limit) {
            allHistory.sort(Comparator.comparing(QuizHistory::getTimestamp));
            int toDelete = allHistory.size() - limit;
            for (int i = 0; i < toDelete; i++) {
                QuizHistory oldest = allHistory.get(i);
                if (oldest != null) {
                    quizHistoryRepository.delete(oldest);
                }
            }
        }
    }

    @GetMapping("/history")
    public List<QuizHistory> getQuizHistory() {
        return quizHistoryRepository.findTop5ByOrderByTimestampDesc();
    }
}
