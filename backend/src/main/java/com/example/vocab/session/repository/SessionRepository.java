package com.example.vocab.session.repository;

import com.example.vocab.session.domain.Session;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class SessionRepository {
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "sessions";

    public SessionRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Session> findAllByOrderByCreatedAtDesc() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get();
            QuerySnapshot querySnapshot = future.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
            List<Session> sessions = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                sessions.add(document.toObject(Session.class));
            }
            return sessions;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching sessions", e);
        }
    }

    public Optional<Session> findById(String id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("Session ID cannot be null");
            }
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                return Optional.ofNullable(document.toObject(Session.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching session", e);
        }
    }

    public Session save(Session session) {
        try {
            if (session.getId() == null) {
                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
                session.setId(docRef.getId());
                if (session.getCreatedAt() == null) {
                    session.setCreatedAt(System.currentTimeMillis());
                }
                docRef.set(session).get();
            } else {
                String sessionId = session.getId();
                if (sessionId == null) {
                    throw new IllegalArgumentException("Session ID cannot be null for update");
                }
                firestore.collection(COLLECTION_NAME).document(sessionId).set(session).get();
            }
            return session;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving session", e);
        }
    }

    public void deleteById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("Session ID cannot be null");
        }
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }
}
