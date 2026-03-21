package com.example.vocab.common.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            InputStream serviceAccount;
            try {
                serviceAccount = new FileInputStream("serviceAccountKey.json");
            } catch (Exception e) {
                throw new RuntimeException("Firebase serviceAccountKey.json not found in the backend directory. Please provide it to connect to Firebase.");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
        }
        return FirestoreClient.getFirestore();
    }
}
