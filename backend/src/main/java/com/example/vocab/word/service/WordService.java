package com.example.vocab.word.service;

import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WordService {
    private final WordRepository wordRepository;

    public List<Word> getWordsBySessionId(UUID sessionId) {
        return wordRepository.findAllBySessionIdOrderByOrderIndexAsc(sessionId);
    }

    @Transactional
    public List<Word> saveWords(UUID sessionId, List<Word> words) {
        if (words == null || sessionId == null)
            return List.of();
        wordRepository.deleteAllBySessionId(sessionId);
        for (int i = 0; i < words.size(); i++) {
            Word word = words.get(i);
            if (word == null)
                continue;
            word.setSessionId(sessionId);
            word.setOrderIndex(i);
        }
        return wordRepository.saveAll(words);
    }

    @Transactional
    public List<Word> updateWords(List<Word> words) {
        if (words == null)
            return List.of();
        return wordRepository.saveAll(words);
    }

    @Transactional
    public void deleteWordsBySessionId(UUID sessionId) {
        wordRepository.deleteAllBySessionId(sessionId);
    }

    @Transactional
    public Word updateWord(UUID wordId, String english, String vietnamese, String imageUrl) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Word not found"));
        word.setEnglish(english);
        word.setVietnamese(vietnamese);
        word.setImageUrl(imageUrl);
        return wordRepository.save(word);
    }
}
