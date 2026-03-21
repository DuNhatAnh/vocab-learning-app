package com.example.vocab.session.service;

import com.example.vocab.common.enums.SessionStatus;
import com.example.vocab.session.domain.Session;
import com.example.vocab.session.repository.SessionRepository;
import com.example.vocab.word.service.WordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SessionService {
    private final SessionRepository sessionRepository;
    private final WordService wordService;

    public List<Session> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc();
    }

    public Session getSessionById(String id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public Session createSession(String topic) {
        Session session = Session.builder()
                .status(SessionStatus.NEW)
                .topic(topic != null && !topic.trim().isEmpty() ? topic : "Chưa thêm chủ đề")
                .wordCount(0)
                .build();
        return sessionRepository.save(session);
    }

    public Session updateTopic(String id, String topic) {
        Session session = getSessionById(id);
        session.setTopic(topic != null && !topic.trim().isEmpty() ? topic : "Chưa thêm chủ đề");
        return sessionRepository.save(session);
    }

    public Session updateStatus(String id, SessionStatus status) {
        Session session = getSessionById(id);
        session.setStatus(status);
        return sessionRepository.save(session);
    }

    public void updateWordCount(String id, int count) {
        Session session = getSessionById(id);
        session.setWordCount(count);
        sessionRepository.save(session);
    }

    public void deleteSession(String id) {
        wordService.deleteWordsBySessionId(id);
        sessionRepository.deleteById(id);
    }
}
