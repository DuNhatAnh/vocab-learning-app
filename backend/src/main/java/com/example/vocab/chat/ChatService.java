package com.example.vocab.chat;

import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatService {

    private final WordRepository wordRepository;
    private final GeminiService geminiService;

    // Quản lý trạng thái hội thoại
    private final Map<String, String> sessionStates = new ConcurrentHashMap<>();

    public ChatService(WordRepository wordRepository, GeminiService geminiService) {
        this.wordRepository = wordRepository;
        this.geminiService = geminiService;
    }

    public String processMessage(String message) {
        return processMessage(message, "default-user");
    }

    public String processMessage(String message, String sessionId) {
        String effectiveSessionId = sessionId != null ? sessionId : "default-user";
        String targetWord = sessionStates.get(effectiveSessionId);

        // Tạo system prompt mới: Thẳng thắn, ngắn gọn, như một người bạn
        StringBuilder systemPrompt = new StringBuilder();
        systemPrompt.append("You are a cool, direct friend helping the user learn English. \n");
        systemPrompt.append("Rules:\n");
        systemPrompt.append("1. Be concise. No fluff, no 'Good job', no encouragement.\n");
        systemPrompt.append("2. If the user makes a mistake, correct it immediately and give a 1-sentence explanation.\n");
        systemPrompt.append("3. Always provide a natural example sentence for any correction or definition.\n");
        systemPrompt.append("4. Level Up: If the user's sentence is too simple, suggest a more advanced or natural way to say it.\n");
        systemPrompt.append("5. Chat naturally like a friend, but stay focused on helping them improve.\n");
        
        if (targetWord != null) {
            systemPrompt.append("The user is practicing: '").append(targetWord).append("'. Check its usage.\n");
            sessionStates.remove(effectiveSessionId); 
        }

        systemPrompt.append("User message: ").append(message);

        // Gọi Gemini
        String aiResponse = geminiService.generateContent(systemPrompt.toString());

        // Gợi ý từ mới nhưng không dùng lời động viên
        if (message.toLowerCase().contains("luyện tập") || message.toLowerCase().contains("practice")) {
            List<Word> words = wordRepository.findRandomWords(1);
            if (!words.isEmpty()) {
                Word w = words.get(0);
                sessionStates.put(effectiveSessionId, w.getEnglish());
                aiResponse += "\n\nPractice this word: '**" + w.getEnglish() + "**'. Use it in a sentence.";
            }
        }

        return aiResponse;
    }
}
