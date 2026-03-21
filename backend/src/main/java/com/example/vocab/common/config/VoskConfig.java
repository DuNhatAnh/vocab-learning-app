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
        try {
            LibVosk.setLogLevel(LogLevel.WARNINGS);
            
            // Note: Using relative path works when running the app directly via mvn or IDE.
            // For a production fat-JAR, this model directory should be copied outside the JAR, 
            // or extracted to a temp folder dynamically.
            return new Model("src/main/resources/model");
        } catch (IOException e) {
            throw new RuntimeException("Lỗi: Không thể tìm thấy Model âm thanh tại 'src/main/resources/model'", e);
        }
    }
}
