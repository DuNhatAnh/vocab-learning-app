package com.example.vocab.chat;

import com.example.vocab.word.domain.Word;
import com.example.vocab.word.repository.WordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private WordRepository wordRepository;

    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(wordRepository);
        chatService.loadRules();
    }

    @Test
    void shouldKeepPracticeStateUntilUserUsesTargetWord() {
        Word apple = Word.builder()
                .english("apple")
                .vietnamese("qua tao")
                .example("I eat an apple every day.")
                .build();

        when(wordRepository.findRandomWords(1)).thenReturn(List.of(apple));

        String practicePrompt = chatService.processMessage("new word", "session-1");
        String retryPrompt = chatService.processMessage("This fruit is sweet.", "session-1");
        String successResponse = chatService.processMessage("I eat an apple every day.", "session-1");
        String doneResponse = chatService.processMessage("em hiểu rồi", "session-1");

        assertThat(practicePrompt).contains("apple");
        assertThat(retryPrompt).contains("apple").contains("I still need a sentence");
        assertThat(successResponse).contains("Do you understand the word 'apple' now?");
        assertThat(doneResponse).contains("This exercise is done");
    }

    @Test
    void shouldHandleVietnameseDefinitionRequestEvenWhenPracticeIsPending() {
        Word apple = Word.builder()
                .english("apple")
                .vietnamese("qua tao")
                .example("I eat an apple every day.")
                .build();

        when(wordRepository.findRandomWords(1)).thenReturn(List.of(apple));
        when(wordRepository.findRandomWords(500)).thenReturn(List.of(apple));

        chatService.processMessage("new word", "session-2");
        String definitionResponse = chatService.processMessage("nghĩa của từ apple là gì", "session-2");

        assertThat(definitionResponse).contains("apple").contains("qua tao");
    }

    @Test
    void shouldKeepCorrectingSentenceUntilUserConfirmsUnderstanding() {
        String correctionResponse = chatService.processMessage("She don't like him.", "session-3");
        String rewriteResponse = chatService.processMessage("She doesn't like him.", "session-3");
        String doneResponse = chatService.processMessage("I understand", "session-3");

        assertThat(correctionResponse).contains("Corrected: She doesn't like him.");
        assertThat(correctionResponse).contains("Please rewrite the corrected sentence once.");
        assertThat(rewriteResponse).contains("Do you understand this sentence now?");
        assertThat(doneResponse).contains("This exercise is done");
    }
}
