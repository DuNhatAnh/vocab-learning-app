package com.example.vocab.chat;

import com.example.vocab.chat.dto.CorrectionRule;
import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ChatService {
    private static final String DEFAULT_SESSION_ID = "default-user";
    private static final List<String> GREETING_KEYWORDS = List.of("hi", "hello", "chao", "xin chao");
    private static final List<String> PATTERN_KEYWORDS = List.of("mau cau", "pattern", "grammar", "cau truc");
    private static final List<String> PRACTICE_KEYWORDS = List.of(
            "tu moi",
            "new word",
            "another word",
            "practice",
            "practice word",
            "practice vocabulary",
            "luyen tu vung",
            "tu khac",
            "word to practice");
    private static final List<String> HELP_KEYWORDS = List.of("help", "giup", "huong dan", "ban lam duoc gi", "you can do");
    private static final List<String> UNDERSTOOD_KEYWORDS = List.of(
            "em hieu roi",
            "minh hieu roi",
            "toi hieu roi",
            "da hieu",
            "hieu roi",
            "i understand",
            "understand now",
            "got it",
            "i got it");
    private static final List<String> NOT_UNDERSTOOD_KEYWORDS = List.of(
            "chua hieu",
            "khong hieu",
            "van chua hieu",
            "not yet",
            "i dont understand",
            "i don't understand",
            "dont understand",
            "don't understand");
    private static final List<Pattern> DEFINITION_PATTERNS = List.of(
            Pattern.compile("\\bnghia cua(?: tu)?\\s+([a-zA-Z'-]+)\\b"),
            Pattern.compile("\\bwhat is the meaning of\\s+([a-zA-Z'-]+)\\b"),
            Pattern.compile("\\bmeaning of\\s+([a-zA-Z'-]+)\\b"),
            Pattern.compile("\\bwhat does\\s+([a-zA-Z'-]+)\\s+mean\\b"));

    private final WordRepository wordRepository;
    private final Random random = new Random();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final List<CorrectionRule> rules = new ArrayList<>();
    private final Map<String, ChatSessionState> sessionStates = new ConcurrentHashMap<>();

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
        return processMessage(message, DEFAULT_SESSION_ID);
    }

    public String processMessage(String message, String sessionId) {
        String effectiveSessionId = resolveSessionId(sessionId);
        String rawMessage = message == null ? "" : message.trim();

        if (rawMessage.isBlank()) {
            return "Send me a short message and I'll help you practice English.";
        }

        String normalizedIntent = normalizeForIntent(rawMessage);
        CorrectionRule matchedRule = findMatchedRule(rawMessage);
        ChatSessionState state = getOrCreateState(effectiveSessionId);

        if (containsAnyPhrase(normalizedIntent, GREETING_KEYWORDS)) {
            return buildGreetingResponse(state);
        }

        String definitionTarget = extractDefinitionTarget(normalizedIntent);
        if (definitionTarget != null) {
            clearState(effectiveSessionId);
            return handleDefinitionRequest(definitionTarget);
        }

        if (containsAnyPhrase(normalizedIntent, PATTERN_KEYWORDS)) {
            return handlePatternRequest(effectiveSessionId);
        }

        if (containsAnyPhrase(normalizedIntent, PRACTICE_KEYWORDS)) {
            return handleGeneralRequest(effectiveSessionId);
        }

        if (containsAnyPhrase(normalizedIntent, HELP_KEYWORDS)) {
            return buildHelpMessage(state);
        }

        if (state.isAwaitingConfirmation()) {
            return handleUnderstandingConfirmation(effectiveSessionId, state, rawMessage, normalizedIntent, matchedRule);
        }

        if (state.isAwaitingSentence() || state.hasExpectedSentence()) {
            return handleActivePractice(effectiveSessionId, state, rawMessage, matchedRule);
        }

        if (matchedRule != null) {
            return startCorrectionLoop(effectiveSessionId, state, matchedRule, "this sentence");
        }

        if (looksLikeSentenceAttempt(rawMessage, null)) {
            return "That sentence looks okay to me. If you want, I can check another sentence, give you a new word, or teach a pattern.";
        }

        return buildHelpMessage(state);
    }

    private String handleActivePractice(String sessionId, ChatSessionState state, String userMessage, CorrectionRule matchedRule) {
        if (state.hasTargetWord() && !containsWord(userMessage, state.getTargetWord())) {
            if (matchedRule != null) {
                return buildFeedbackResponse(matchedRule, state)
                        + "\n\nNow write a new sentence that includes the word '" + state.getTargetWord() + "'.";
            }
            return "I still need a sentence with the word '" + state.getTargetWord() + "'. Try one more time.";
        }

        if (matchedRule != null) {
            return startCorrectionLoop(sessionId, state, matchedRule, state.getScopeLabel());
        }

        if (isSuccessfulAttempt(userMessage, state)) {
            state.moveToUnderstandingCheck();
            return buildUnderstandingPrompt("Nice, that sentence is correct.", state);
        }

        if (state.hasExpectedSentence()) {
            return "Almost there. Please rewrite the corrected sentence once more:\n"
                    + state.getExpectedSentence();
        }

        if (state.hasTargetWord()) {
            return "I still need a sentence with the word '" + state.getTargetWord() + "'. Try one more time.";
        }

        return "Try one more sentence and I'll keep checking until it is right.";
    }

    private String handleUnderstandingConfirmation(
            String sessionId,
            ChatSessionState state,
            String userMessage,
            String normalizedIntent,
            CorrectionRule matchedRule
    ) {
        if (containsAnyPhrase(normalizedIntent, NOT_UNDERSTOOD_KEYWORDS)) {
            state.resumePractice();
            if (state.hasTargetWord()) {
                return "No problem. Write one more sentence with '" + state.getTargetWord() + "' and I'll check it again.";
            }
            return "No problem. Write one more sentence and I'll keep guiding you.";
        }

        if (containsAnyPhrase(normalizedIntent, UNDERSTOOD_KEYWORDS)) {
            String completedScope = state.getScopeLabel();
            clearState(sessionId);
            return "Great. You've confirmed that you understand " + completedScope + ". This exercise is done.";
        }

        if (matchedRule != null) {
            return startCorrectionLoop(sessionId, state, matchedRule, state.getScopeLabel());
        }

        if (isSuccessfulAttempt(userMessage, state)) {
            return buildUnderstandingPrompt("Nice, that sentence is also correct.", state);
        }

        return "If you understand already, reply 'em hiểu rồi' or 'I understand' to finish. "
                + "If not, send me one more sentence and I'll keep helping.";
    }

    private String startCorrectionLoop(
            String sessionId,
            ChatSessionState state,
            CorrectionRule matchedRule,
            String fallbackScopeLabel
    ) {
        CorrectionRule.Output output = matchedRule.getOutput();

        if (state.isIdle()) {
            state.beginFreeSentencePractice(fallbackScopeLabel);
        }

        boolean keepsTargetWordPractice = state.hasTargetWord()
                && (containsWord(output.getCorrected_sentence(), state.getTargetWord())
                || containsAnyMistakeForWord(output, state.getTargetWord()));

        if (!keepsTargetWordPractice && !state.hasTargetWord()) {
            state.setScopeLabel(fallbackScopeLabel);
        }

        state.startCorrectionLoop(output.getCorrected_sentence());
        sessionStates.put(sessionId, state);

        return buildFeedbackResponse(matchedRule, state)
                + "\n\nPlease rewrite the corrected sentence once."
                + "\nAfter that, when you understand, reply 'em hiểu rồi' or 'I understand'.";
    }

    private String handleDefinitionRequest(String target) {
        List<Word> allWords = wordRepository.findRandomWords(500);
        for (Word word : allWords) {
            if (word.getEnglish().equalsIgnoreCase(target)) {
                String example = word.getExample() == null || word.getExample().isBlank()
                        ? ""
                        : " Example: " + word.getExample();
                return "The meaning of '" + word.getEnglish() + "' is: " + word.getVietnamese() + "." + example;
            }
        }
        return "I don't have the word '" + target + "' in the vocabulary list yet. Try adding it first.";
    }

    private String handleGeneralRequest(String sessionId) {
        List<Word> words = wordRepository.findRandomWords(1);
        if (words.isEmpty()) {
            clearState(sessionId);
            return "You haven't added any words yet. Let's start by adding some new vocabulary!";
        }

        Word word = words.get(0);
        ChatSessionState state = new ChatSessionState();
        state.beginWordPractice(word.getEnglish());
        sessionStates.put(sessionId, state);

        return "Let's practice the word '" + word.getEnglish() + "'. Can you make a sentence with it?";
    }

    private String handlePatternRequest(String sessionId) {
        String pattern = patterns.get(random.nextInt(patterns.size()));
        ChatSessionState state = new ChatSessionState();
        state.beginPatternPractice();
        sessionStates.put(sessionId, state);
        return "Let's learn this pattern: " + pattern + ". Try to make one sentence with it, and I'll keep checking until it is right.";
    }

    private String buildGreetingResponse(ChatSessionState state) {
        if (state.isIdle()) {
            return "Hello! I'm your AI Tutor. Ask for a new word, a pattern, or send me a short English sentence.";
        }

        if (state.hasTargetWord()) {
            return "Hello again! We're still practicing the word '" + state.getTargetWord() + "'. "
                    + "Send me another sentence, or say 'another word' if you want to switch.";
        }

        return "Hello again! We're still working on " + state.getScopeLabel()
                + ". Send me another sentence and I'll keep checking.";
    }

    private String buildHelpMessage(ChatSessionState state) {
        if (state.hasTargetWord()) {
            return "You're currently practicing the word '" + state.getTargetWord() + "'. "
                    + "Send me a sentence with it, ask for 'another word', say 'mau cau', or ask 'nghia cua tu apple'.";
        }

        if (state.hasExpectedSentence() || state.isAwaitingConfirmation()) {
            return "We're still working on " + state.getScopeLabel()
                    + ". You can rewrite the corrected sentence, send one more sentence, or reply 'em hiểu rồi' when you're done.";
        }

        return "I can help you practice vocabulary, teach a pattern, explain a word, or review a short English sentence. "
                + "Try 'new word', 'mau cau', or 'nghia cua tu apple'.";
    }

    private String buildFeedbackResponse(CorrectionRule matchedRule, ChatSessionState state) {
        CorrectionRule.Output output = matchedRule.getOutput();
        StringBuilder feedback = new StringBuilder();
        feedback.append("Feedback for your sentence:\n");
        feedback.append("Corrected: ").append(output.getCorrected_sentence()).append("\n");

        if (output.getMistakes() != null && !output.getMistakes().isEmpty()) {
            feedback.append("Mistakes:\n");
            for (CorrectionRule.Mistake mistake : output.getMistakes()) {
                feedback.append("- '").append(mistake.getWrong()).append("': ").append(mistake.getReason()).append("\n");
            }
        }

        if (output.getNatural_reply() != null && !output.getNatural_reply().isBlank()) {
            feedback.append("Natural suggestion: ").append(output.getNatural_reply()).append("\n");
        }
        if (output.getFollow_up_question() != null && !output.getFollow_up_question().isBlank()) {
            feedback.append("Follow-up: ").append(output.getFollow_up_question());
        }

        if (state.hasTargetWord() && !containsWord(output.getCorrected_sentence(), state.getTargetWord())) {
            feedback.append("\n\nRemember to use the word '").append(state.getTargetWord()).append("' in your next sentence.");
        }

        return feedback.toString().trim();
    }

    private String buildUnderstandingPrompt(String prefix, ChatSessionState state) {
        return prefix + "\nDo you understand " + state.getScopeLabel()
                + " now? Reply 'em hiểu rồi' or 'I understand' to finish, or send one more sentence if you want more practice.";
    }

    private ChatSessionState getOrCreateState(String sessionId) {
        return sessionStates.computeIfAbsent(sessionId, id -> new ChatSessionState());
    }

    private void clearState(String sessionId) {
        sessionStates.remove(sessionId);
    }

    private CorrectionRule findMatchedRule(String userSentence) {
        String normalizedInput = normalizeForRuleMatching(userSentence);
        if (normalizedInput.isBlank()) {
            return null;
        }

        CorrectionRule bestRule = null;
        double bestScore = 0.0;

        for (CorrectionRule rule : rules) {
            String ruleInput = normalizeForRuleMatching(rule.getInput());
            if (normalizedInput.equals(ruleInput)) {
                return rule;
            }

            int wordCountDifference = Math.abs(countWords(normalizedInput) - countWords(ruleInput));
            double similarity = calculateSimilarity(normalizedInput, ruleInput);
            if (wordCountDifference <= 1 && similarity > bestScore) {
                bestScore = similarity;
                bestRule = rule;
            }
        }

        if (bestScore >= 0.92d) {
            return bestRule;
        }

        return null;
    }

    private boolean isSuccessfulAttempt(String message, ChatSessionState state) {
        if (!looksLikeSentenceAttempt(message, state.getTargetWord())) {
            return false;
        }

        if (state.hasTargetWord()) {
            return containsWord(message, state.getTargetWord());
        }

        return true;
    }

    private boolean containsAnyMistakeForWord(CorrectionRule.Output output, String targetWord) {
        if (output.getMistakes() == null || targetWord == null) {
            return false;
        }

        for (CorrectionRule.Mistake mistake : output.getMistakes()) {
            if (containsWord(mistake.getWrong(), targetWord) || containsWord(mistake.getFix(), targetWord)) {
                return true;
            }
        }
        return false;
    }

    private String resolveSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return DEFAULT_SESSION_ID;
        }
        return sessionId.trim();
    }

    private String extractDefinitionTarget(String normalizedIntent) {
        for (Pattern pattern : DEFINITION_PATTERNS) {
            Matcher matcher = pattern.matcher(normalizedIntent);
            if (matcher.find()) {
                return matcher.group(1).toLowerCase(Locale.ROOT);
            }
        }
        return null;
    }

    private boolean containsAnyPhrase(String normalizedIntent, List<String> phrases) {
        String paddedMessage = " " + normalizedIntent + " ";
        for (String phrase : phrases) {
            if (paddedMessage.contains(" " + phrase + " ")) {
                return true;
            }
        }
        return false;
    }

    private boolean looksLikeSentenceAttempt(String message, String targetWord) {
        if (targetWord != null && containsWord(message, targetWord)) {
            return true;
        }
        return countWords(normalizeForIntent(message)) >= 3;
    }

    private boolean containsWord(String text, String targetWord) {
        if (text == null || targetWord == null) {
            return false;
        }
        String normalizedText = " " + normalizeForIntent(text) + " ";
        String normalizedTarget = normalizeForIntent(targetWord);
        return normalizedText.contains(" " + normalizedTarget + " ");
    }

    private String normalizeForIntent(String text) {
        String withoutAccent = Normalizer.normalize(text == null ? "" : text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccent.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9' ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String normalizeForRuleMatching(String text) {
        return (text == null ? "" : text)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private int countWords(String normalizedText) {
        if (normalizedText == null || normalizedText.isBlank()) {
            return 0;
        }
        return normalizedText.split("\\s+").length;
    }

    private double calculateSimilarity(String left, String right) {
        int maxLength = Math.max(left.length(), right.length());
        if (maxLength == 0) {
            return 1.0d;
        }
        int distance = levenshteinDistance(left, right);
        return 1.0d - ((double) distance / maxLength);
    }

    private int levenshteinDistance(String left, String right) {
        int[][] dp = new int[left.length() + 1][right.length() + 1];

        for (int i = 0; i <= left.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= right.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= left.length(); i++) {
            for (int j = 1; j <= right.length(); j++) {
                int cost = left.charAt(i - 1) == right.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost);
            }
        }

        return dp[left.length()][right.length()];
    }

    private static class ChatSessionState {
        private String targetWord;
        private String scopeLabel;
        private String expectedSentence;
        private boolean awaitingSentence;
        private boolean awaitingConfirmation;

        void beginWordPractice(String targetWord) {
            this.targetWord = targetWord;
            this.scopeLabel = "the word '" + targetWord + "'";
            this.expectedSentence = null;
            this.awaitingSentence = true;
            this.awaitingConfirmation = false;
        }

        void beginPatternPractice() {
            this.targetWord = null;
            this.scopeLabel = "this pattern";
            this.expectedSentence = null;
            this.awaitingSentence = true;
            this.awaitingConfirmation = false;
        }

        void beginFreeSentencePractice(String scopeLabel) {
            this.targetWord = null;
            this.scopeLabel = scopeLabel == null ? "this sentence" : scopeLabel;
            this.expectedSentence = null;
            this.awaitingSentence = true;
            this.awaitingConfirmation = false;
        }

        void startCorrectionLoop(String expectedSentence) {
            this.expectedSentence = expectedSentence;
            this.awaitingSentence = true;
            this.awaitingConfirmation = false;
        }

        void moveToUnderstandingCheck() {
            this.expectedSentence = null;
            this.awaitingSentence = false;
            this.awaitingConfirmation = true;
        }

        void resumePractice() {
            this.awaitingSentence = true;
            this.awaitingConfirmation = false;
        }

        boolean hasTargetWord() {
            return targetWord != null && !targetWord.isBlank();
        }

        boolean hasExpectedSentence() {
            return expectedSentence != null && !expectedSentence.isBlank();
        }

        boolean isAwaitingSentence() {
            return awaitingSentence;
        }

        boolean isAwaitingConfirmation() {
            return awaitingConfirmation;
        }

        boolean isIdle() {
            return !hasTargetWord() && !hasExpectedSentence() && !awaitingSentence && !awaitingConfirmation && scopeLabel == null;
        }

        String getTargetWord() {
            return targetWord;
        }

        String getExpectedSentence() {
            return expectedSentence;
        }

        String getScopeLabel() {
            if (scopeLabel == null || scopeLabel.isBlank()) {
                return "this sentence";
            }
            return scopeLabel;
        }

        void setScopeLabel(String scopeLabel) {
            this.scopeLabel = scopeLabel;
        }
    }
}
