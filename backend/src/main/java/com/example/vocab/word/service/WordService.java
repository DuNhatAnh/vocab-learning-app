package com.example.vocab.word.service;

import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WordService {
    private final WordRepository wordRepository;

    public List<Word> getWordsBySessionId(String sessionId) {
        return wordRepository.findAllBySessionIdOrderByOrderIndexAsc(sessionId);
    }

    public List<Word> saveWords(String sessionId, List<Word> words) {
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

    public List<Word> updateWords(List<Word> words) {
        if (words == null)
            return List.of();
        return wordRepository.saveAll(words);
    }

    public void deleteWordsBySessionId(String sessionId) {
        wordRepository.deleteAllBySessionId(sessionId);
    }

    public Word updateWord(String wordId, String english, String vietnamese, String imageUrl) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Word not found"));
        word.setEnglish(english);
        word.setVietnamese(vietnamese);
        word.setImageUrl(imageUrl);
        return wordRepository.save(word);
    }
}
