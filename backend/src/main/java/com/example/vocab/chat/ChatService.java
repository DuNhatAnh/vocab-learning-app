package com.example.vocab.chat;

import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChatService {

    private final WordRepository wordRepository;
    private final Random random = new Random();

    // Các mẫu câu ngữ pháp (Sentence Patterns)
    private final List<String> patterns = Arrays.asList(
        "S + find + it + adj + to V (VD: I find it easy to learn English)",
        "S + be + looking forward to + V-ing (VD: I am looking forward to meeting you)",
        "It + be + adj + (for someone) + to V (VD: It is difficult for me to remember new words)",
        "S + used to + V (VD: I used to play soccer every day)"
    );

    public ChatService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    public String processMessage(String message) {
        String msg = message.toLowerCase().trim();

        // 1. Chào hỏi
        if (msg.contains("hi") || msg.contains("hello") || msg.contains("chào")) {
            return "Hello! I'm your AI Tutor. Ready to practice some English today?";
        }

        // 2. Yêu cầu dạy mẫu câu
        if (msg.contains("mẫu câu") || msg.contains("pattern") || msg.contains("grammar")) {
            String pattern = patterns.get(random.nextInt(patterns.size()));
            return "Let's learn this pattern: **" + pattern + "**. Can you try to make a sentence with it?";
        }

        // 3. Hỏi về từ vựng cụ thể
        if (msg.contains("nghĩa của từ") || msg.contains("what is") || msg.contains("meaning of")) {
            return handleDefinitionRequest(msg);
        }

        // 4. Mặc định: Gợi ý luyện tập với từ vựng trong Database
        return handleGeneralRequest();
    }

    private String handleDefinitionRequest(String msg) {
        // Tạm thời bóc tách đơn giản từ cuối cùng
        String[] words = msg.split("\\s+");
        String target = words[words.length - 1].replace("?", "");
        
        List<Word> allWords = wordRepository.findRandomWords(100);
        for (Word w : allWords) {
            if (w.getEnglish().equalsIgnoreCase(target)) {
                return "The meaning of '**" + w.getEnglish() + "**' is: " + w.getVietnamese() + 
                       ". Example: " + w.getExample();
            }
        }
        return "I'm sorry, I don't have that word in my database yet. Would you like to add it?";
    }

    private String handleGeneralRequest() {
        List<Word> words = wordRepository.findRandomWords(1);
        if (words.isEmpty()) {
            return "You haven't added any words yet. Let's start by adding some new vocabulary!";
        }
        Word w = words.get(0);
        return "I see you've learned the word '**" + w.getEnglish() + "**'. Can you use it in a sentence for me?";
    }
}
