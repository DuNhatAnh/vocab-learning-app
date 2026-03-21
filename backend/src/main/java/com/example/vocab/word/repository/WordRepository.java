package com.example.vocab.word.repository;

import com.example.vocab.word.domain.Word;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class WordRepository {
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "words";

    public WordRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Word> findAllBySessionIdOrderByOrderIndexAsc(String sessionId) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("sessionId", sessionId)
                    .orderBy("orderIndex", Query.Direction.ASCENDING)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Word> words = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                words.add(document.toObject(Word.class));
            }
            return words;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching words", e);
        }
    }

    public List<Word> findRandomWords(int limit) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .limit(500)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Word> words = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                words.add(document.toObject(Word.class));
            }
            Collections.shuffle(words);
            return words.stream().limit(limit).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching random words", e);
        }
    }

    public void deleteAllBySessionId(String sessionId) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("sessionId", sessionId)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            WriteBatch batch = firestore.batch();
            for (QueryDocumentSnapshot document : documents) {
                batch.delete(document.getReference());
            }
            batch.commit().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting words by session", e);
        }
    }

    public Optional<Word> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION_NAME).document(Objects.requireNonNull(id)).get().get();
            if (doc.exists()) {
                return Optional.ofNullable(doc.toObject(Word.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching word by id", e);
        }
    }

    public List<Word> saveAll(List<Word> words) {
        try {
            WriteBatch batch = firestore.batch();
            for (Word word : words) {
                DocumentReference docRef;
                if (word.getId() == null) {
                    docRef = firestore.collection(COLLECTION_NAME).document();
                    word.setId(docRef.getId());
                } else {
                    docRef = firestore.collection(COLLECTION_NAME).document(Objects.requireNonNull(word.getId()));
                }
                batch.set(docRef, word);
            }
            batch.commit().get();
            return words;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving words", e);
        }
    }

    public Word save(Word word) {
        try {
            if (word.getId() == null) {
                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
                word.setId(docRef.getId());
                docRef.set(word).get();
            } else {
                firestore.collection(COLLECTION_NAME).document(Objects.requireNonNull(word.getId())).set(word).get();
            }
            return word;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving word", e);
        }
    }
}
