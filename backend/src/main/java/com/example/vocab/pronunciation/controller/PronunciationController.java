package com.example.vocab.pronunciation.controller;

import com.example.vocab.pronunciation.service.PronunciationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pronunciation")
public class PronunciationController {

    private final PronunciationService pronunciationService;

    @Autowired
    public PronunciationController(PronunciationService pronunciationService) {
        this.pronunciationService = pronunciationService;
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkPronunciation(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam("targetWord") String targetWord) {
        
        if (audioFile.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng đính kèm file ghi âm"));
        }
        
        // Forward thẳng file vào service xử lý on-memory
        Map<String, Object> result = pronunciationService.assessPronunciation(audioFile, targetWord);
        return ResponseEntity.ok(result);
    }
}
