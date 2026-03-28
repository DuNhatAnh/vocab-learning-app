package com.example.vocab.chat;

import com.example.vocab.chat.dto.CorrectionRule;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatService {

    private final WordRepository wordRepository;
    private final Random random = new Random();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Lưu trữ các quy tắc từ JSON
    private final List<CorrectionRule> rules = new ArrayList<>();

    // Quản lý trạng thái hội thoại (đơn giản hóa cho 1 người dùng hoặc theo session-id nếu có)
    // Map<sessionId, currentWordEnglish>
    private final Map<String, String> sessionStates = new ConcurrentHashMap<>();

    private final List<String> patterns = Arrays.asList(
            "S + find + it + adj + to V (VD: I find it easy to learn English)",
            "S + be + looking forward to + V-ing (VD: I am looking forward to meeting you)",
            "It + be + adj + (for someone) + to V (VD: It is difficult for me to remember new words)",
            "S + used to + V (VD: I used to play soccer every day)");

    public ChatService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @PostConstruct
    public void loadRules() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:training_data/*.json");
            for (Resource resource : resources) {
                List<CorrectionRule> fileRules = objectMapper.readValue(
                        resource.getInputStream(),
                        new TypeReference<List<CorrectionRule>>() {}
                );
                rules.addAll(fileRules);
            }
            log.info("Loaded {} correction rules from JSON.", rules.size());
        } catch (IOException e) {
            log.error("Failed to load correction rules: {}", e.getMessage());
        }
    }

    public String processMessage(String message) {
        String sessionId = "default-user"; // Tạm thời dùng ID mặc định
        String msg = message.toLowerCase().trim();

        // 1. Kiểm tra trạng thái: Nếu đang chờ phản hồi cho một từ cụ thể
        if (sessionStates.containsKey(sessionId)) {
            return handleSentenceResponse(sessionId, message);
        }

        // 2. Chào hỏi
        if (msg.contains("hi") || msg.contains("hello") || msg.contains("chào")) {
            return "Hello! I'm your AI Tutor. Ready to practice some English today?";
        }

        // 3. Yêu cầu dạy mẫu câu
        if (msg.contains("mẫu câu") || msg.contains("pattern") || msg.contains("grammar")) {
            String pattern = patterns.get(random.nextInt(patterns.size()));
            return "Let's learn this pattern: **" + pattern + "**. Can you try to make a sentence with it?";
        }

        // 4. Hỏi về từ vựng cụ thể
        if (msg.contains("nghĩa của từ") || msg.contains("what is") || msg.contains("meaning of")) {
            return handleDefinitionRequest(msg);
        }

        // 5. Mặc định: Gợi ý luyện tập từ vựng
        return handleGeneralRequest(sessionId);
    }

    private String handleSentenceResponse(String sessionId, String userSentence) {
        String targetWord = sessionStates.get(sessionId);
        sessionStates.remove(sessionId); // Xóa trạng thái sau khi xử lý

        // Tìm quy tắc khớp trong JSON (khớp chính xác hoặc gần đúng đơn giản)
        CorrectionRule matchedRule = findMatchedRule(userSentence);

        if (matchedRule != null) {
            CorrectionRule.Output output = matchedRule.getOutput();
            StringBuilder feedback = new StringBuilder();
            feedback.append("✨ **Feedback for your sentence:**\n\n");
            feedback.append("✅ **Corrected:** ").append(output.getCorrected_sentence()).append("\n");

            if (!output.getMistakes().isEmpty()) {
                feedback.append("❌ **Mistakes:**\n");
                for (CorrectionRule.Mistake m : output.getMistakes()) {
                    feedback.append("- '").append(m.getWrong()).append("': ").append(m.getReason()).append("\n");
                }
            }

            feedback.append("\n💡 **Natural Suggestion:** ").append(output.getNatural_reply()).append("\n");
            feedback.append("💬 **AI:** ").append(output.getFollow_up_question());

            return feedback.toString();
        }

        // Nếu không tìm thấy quy tắc cụ thể, kiểm tra xem từ mục tiêu có trong câu không
        if (userSentence.toLowerCase().contains(targetWord.toLowerCase())) {
            return "Great job using the word '**" + targetWord + "**'! Your sentence sounds good. \n\n" +
                    "Let's try another one or ask me anything!";
        } else {
            return "I don't see the word '**" + targetWord + "**' in your sentence. Can you try again?";
        }
    }

    private CorrectionRule findMatchedRule(String userSentence) {
        String normalizedInput = userSentence.toLowerCase().replaceAll("[^a-zA-Z ]", "").trim();
        for (CorrectionRule rule : rules) {
            String ruleInput = rule.getInput().toLowerCase().replaceAll("[^a-zA-Z ]", "").trim();
            if (normalizedInput.equals(ruleInput)) {
                return rule;
            }
        }
        return null;
    }

    private String handleDefinitionRequest(String msg) {
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

    private String handleGeneralRequest(String sessionId) {
        List<Word> words = wordRepository.findRandomWords(1);
        if (words.isEmpty()) {
            return "You haven't added any words yet. Let's start by adding some new vocabulary!";
        }
        Word w = words.get(0);
        sessionStates.put(sessionId, w.getEnglish()); // Lưu trạng thái đang luyện từ này
        return "I see you've learned the word '**" + w.getEnglish() + "**'. Can you use it in a sentence for me?";
    }
}
