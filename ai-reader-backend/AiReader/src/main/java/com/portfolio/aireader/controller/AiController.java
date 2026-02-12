package com.portfolio.aireader.controller;

import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import com.portfolio.aireader.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping(value = "/ask", consumes = "multipart/form-data")
    public ResponseEntity<String> askQuestion(
            @RequestParam("question") String question,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            String answer = aiService.getAnswer(question, file);
            return ResponseEntity.ok(answer);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body("Google API Error: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server Error: " + e.getMessage());
        }
    }
}