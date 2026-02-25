package com.example.vocab.learning.controller;

import com.example.vocab.learning.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions/{sessionId}/submit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LearningController {
    private final LearningService learningService;

    @PostMapping
    public List<LearningService.EvaluationResult> submit(@PathVariable UUID sessionId,
            @RequestBody Map<UUID, String> answers) {
        return learningService.submitLearning(sessionId, answers);
    }

    @GetMapping("/results")
    public List<LearningService.EvaluationResult> getResults(@PathVariable UUID sessionId) {
        return learningService.getResults(sessionId);
    }
}
