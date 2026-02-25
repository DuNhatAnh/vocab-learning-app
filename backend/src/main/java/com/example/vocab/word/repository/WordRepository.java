package com.example.vocab.word.repository;

import com.example.vocab.word.domain.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WordRepository extends JpaRepository<Word, UUID> {
    List<Word> findAllBySessionIdOrderByOrderIndexAsc(UUID sessionId);

    void deleteAllBySessionId(UUID sessionId);
}
