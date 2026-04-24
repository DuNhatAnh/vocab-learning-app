package com.example.vocab.common.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            String keyJson = System.getenv("FIREBASE_KEY_JSON");
            InputStream serviceAccount;

            if (keyJson != null && !keyJson.isEmpty()) {
                serviceAccount = new ByteArrayInputStream(keyJson.getBytes(StandardCharsets.UTF_8));
            } else {
                String keyPath = System.getenv("FIREBASE_KEY_PATH");
                if (keyPath == null || keyPath.isEmpty()) {
                    keyPath = "serviceAccountKey.json";
                }
                try {
                    serviceAccount = new FileInputStream(keyPath);
                } catch (Exception e) {
                    throw new RuntimeException("Firebase key not found in FIREBASE_KEY_JSON or at path: " + keyPath);
                }
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
        }
        return FirestoreClient.getFirestore();
    }
}
