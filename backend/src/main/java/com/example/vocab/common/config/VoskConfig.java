package com.example.vocab.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.vosk.LibVosk;
import org.vosk.LogLevel;
import org.vosk.Model;

import java.io.IOException;

@Configuration
public class VoskConfig {

    @Bean
    public Model voskModel() {
        String modelPath = System.getenv("VOSK_MODEL_PATH");
        if (modelPath == null || modelPath.isEmpty()) {
            modelPath = "src/main/resources/model";
        }
        
        try {
            LibVosk.setLogLevel(LogLevel.WARNINGS);
            return new Model(modelPath);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi: Không thể tìm thấy Model âm thanh tại '" + modelPath + "'", e);
        }
    }
}
