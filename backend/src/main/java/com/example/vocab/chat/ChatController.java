package com.example.vocab.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Cho phép gọi từ Frontend
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public Map<String, String> sendMessage(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String sessionId = payload.get("sessionId");
        String aiResponse = chatService.processMessage(userMessage, sessionId);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse);
        return response;
    }
}
