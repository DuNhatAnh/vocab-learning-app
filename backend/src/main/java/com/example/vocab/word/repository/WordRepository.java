package com.example.vocab.word.repository;

import com.example.vocab.word.domain.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WordRepository extends JpaRepository<Word, UUID> {
    List<Word> findAllBySessionIdOrderByOrderIndexAsc(UUID sessionId);

    @Query(value = "SELECT * FROM words ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Word> findRandomWords(@Param("limit") int limit);

    void deleteAllBySessionId(UUID sessionId);
}
