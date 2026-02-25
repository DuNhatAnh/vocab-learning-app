package com.example.vocab.word.controller;

import com.example.vocab.common.enums.SessionStatus;
import com.example.vocab.session.service.SessionService;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.service.WordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions/{sessionId}/words")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WordController {
    private final WordService wordService;
    private final SessionService sessionService;

    @GetMapping
    public List<Word> getWords(@PathVariable UUID sessionId) {
        return wordService.getWordsBySessionId(sessionId);
    }

    @PostMapping
    public List<Word> saveWords(@PathVariable UUID sessionId, @RequestBody List<Word> words) {
        List<Word> savedWords = wordService.saveWords(sessionId, words);
        sessionService.updateWordCount(sessionId, savedWords.size());
        sessionService.updateStatus(sessionId, SessionStatus.LEARNING);
        return savedWords;
    }

    @PutMapping("/{wordId}")
    public Word updateWord(@PathVariable UUID sessionId, @PathVariable UUID wordId, @RequestBody Word wordData) {
        return wordService.updateWord(wordId, wordData.getEnglish(), wordData.getVietnamese());
    }
}
