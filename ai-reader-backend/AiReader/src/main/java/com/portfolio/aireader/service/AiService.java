package com.portfolio.aireader.service;

import java.io.IOException;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiService {

	
	private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestClient restClient;

    public AiService() {
        this.restClient = RestClient.create();
    }

    public String getAnswer(String question, MultipartFile file) throws IOException {
        String requestBody;

        if (file != null) {
            // Case 1: Image/PDF + Text
            String base64File = Base64.getEncoder().encodeToString(file.getBytes());
            requestBody = """
                {
                    "contents": [{
                        "parts": [
                            {"text": "%s"},
                            {
                                "inline_data": {
                                    "mime_type": "%s",
                                    "data": "%s"
                                }
                            }
                        ]
                    }]
                }
                """.formatted(question, file.getContentType(), base64File);
        } else {
            // Case 2: Text Only
            requestBody = """
                {
                    "contents": [{
                        "parts": [
                            {"text": "%s"}
                        ]
                    }]
                }
                """.formatted(question);
        }

        return restClient.post()
                .uri(GEMINI_URL + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(String.class);
    }
}