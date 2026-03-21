package com.example.vocab.pronunciation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.vosk.Model;
import org.vosk.Recognizer;

import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class PronunciationService {

    private final Model voskModel;
    private final ObjectMapper objectMapper;

    @Autowired
    public PronunciationService(Model voskModel) {
        this.voskModel = voskModel;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> assessPronunciation(MultipartFile audioFile, String targetWord) {
        Map<String, Object> result = new HashMap<>();
        String recognizedText = "";
        
        // 1. Đọc luồng âm thanh và thu thập chữ (Không lưu file ra ổ đĩa - xử lý ngay trên RAM)
        try (InputStream is = new BufferedInputStream(audioFile.getInputStream());
             AudioInputStream ais = AudioSystem.getAudioInputStream(is)) {
             
            // Yêu cầu của Vosk thông thường là 16kHz
            int sampleRate = (int) ais.getFormat().getSampleRate();
            if (sampleRate <= 0) sampleRate = 16000;
            
            try (Recognizer recognizer = new Recognizer(voskModel, sampleRate)) {
                int nbytes;
                byte[] b = new byte[4096];
                while ((nbytes = ais.read(b)) >= 0) {
                    recognizer.acceptWaveForm(b, nbytes);
                }
                String finalResult = recognizer.getFinalResult();
                
                // Bóc tách file JSON của Vosk trả về: {"text": "apple"}
                JsonNode jsonNode = objectMapper.readTree(finalResult);
                recognizedText = jsonNode.has("text") ? jsonNode.get("text").asText() : "";
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đọc File Wav: Bạn phải đảm bảo App gửi đúng file chuẩn chuẩn Wav. " + e.getMessage(), e);
        }

        // 2. Chấm điểm phát âm bằng Levenshtein
        int score = calculateScore(recognizedText, targetWord);
        
        result.put("target_word", targetWord);
        result.put("recognized_text", recognizedText);
        result.put("score", score);
        
        // Luồng InputStream thuộc MultipartFile sẽ tự động gỡ bỏ ở Finally block
        // File âm thanh hoàn toàn không bị lưu lại
        return result;
    }

    private int calculateScore(String userSpoken, String target) {
        if (target == null || target.trim().isEmpty()) return 0;
        if (userSpoken == null || userSpoken.trim().isEmpty()) return 0;

        String s1 = userSpoken.toLowerCase().trim();
        String s2 = target.toLowerCase().trim();

        int distance = computeLevenshteinDistance(s1, s2);
        int maxLength = Math.max(s1.length(), s2.length());
        
        if (maxLength == 0) return 100;
        
        double accuracy = (1.0 - ((double) distance / maxLength)) * 100;
        return Math.max(0, (int) Math.round(accuracy));
    }

    private int computeLevenshteinDistance(String lhs, String rhs) {
        int[][] distance = new int[lhs.length() + 1][rhs.length() + 1];

        for (int i = 0; i <= lhs.length(); i++) distance[i][0] = i;
        for (int j = 1; j <= rhs.length(); j++) distance[0][j] = j;

        for (int i = 1; i <= lhs.length(); i++) {
            for (int j = 1; j <= rhs.length(); j++) {
                int cost = (lhs.charAt(i - 1) == rhs.charAt(j - 1)) ? 0 : 1;
                distance[i][j] = Math.min(
                    Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1),
                    distance[i - 1][j - 1] + cost
                );
            }
        }
        return distance[lhs.length()][rhs.length()];
    }
}
