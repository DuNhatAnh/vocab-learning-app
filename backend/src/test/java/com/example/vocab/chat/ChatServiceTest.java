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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private WordRepository wordRepository;

    @Mock
    private GeminiService geminiService;

    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(wordRepository, geminiService);
    }

    @Test
    void shouldReturnGeminiResponse() {
        when(geminiService.generateContent(anyString())).thenReturn("This is an AI response.");
        
        String response = chatService.processMessage("hello", "session-1");
        
        assertThat(response).isEqualTo("This is an AI response.");
    }

    @Test
    void shouldAddPracticeWordWhenRequested() {
        Word apple = Word.builder()
                .english("apple")
                .vietnamese("qua tao")
                .build();

        when(wordRepository.findRandomWords(1)).thenReturn(List.of(apple));
        when(geminiService.generateContent(anyString())).thenReturn("Let's practice.");

        String response = chatService.processMessage("practice", "session-1");

        assertThat(response).contains("apple");
        assertThat(response).contains("Practice this word");
    }
}
