package com.example.vocab.quiz.repository;

import com.example.vocab.quiz.domain.QuizHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizHistoryRepository extends JpaRepository<QuizHistory, UUID> {
    @Query(value = "SELECT * FROM quiz_history ORDER BY timestamp DESC LIMIT 5", nativeQuery = true)
    List<QuizHistory> findTop5ByOrderByTimestampDesc();
}
