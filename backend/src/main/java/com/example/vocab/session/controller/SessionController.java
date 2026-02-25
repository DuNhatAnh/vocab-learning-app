package com.example.vocab.session.controller;

import com.example.vocab.common.enums.SessionStatus;
import com.example.vocab.session.domain.Session;
import com.example.vocab.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionController {
    private final SessionService sessionService;

    @GetMapping
    public List<Session> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/{id}")
    public Session getSessionById(@PathVariable UUID id) {
        return sessionService.getSessionById(id);
    }

    @PostMapping
    public Session createSession() {
        return sessionService.createSession();
    }

    @PatchMapping("/{id}/status")
    public Session updateStatus(@PathVariable UUID id, @RequestBody SessionStatus status) {
        return sessionService.updateStatus(id, status);
    }
}
