package com.kanban.controller;

import com.kanban.security.JwtAuthenticationFilter;
import com.kanban.security.JwtTokenProvider;
import com.kanban.security.SecurityConfig;
import com.kanban.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=test-secret-value-at-least-32-characters-long",
    "jwt.expiry-ms=3600000"
})
class CardStartDateControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtTokenProvider jwtTokenProvider;

    @MockBean
    CardService cardService;

    // TC-1801-08: PATCH without token → 401
    @Test
    void patchCard_withoutToken_returns401() throws Exception {
        mockMvc.perform(patch("/api/v1/cards/{id}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"2026-07-01\"}"))
                .andExpect(status().isUnauthorized());
    }

    // TC-1801-09: invalid date string → 422
    @Test
    void patchCard_invalidDateString_returns422() throws Exception {
        String token = jwtTokenProvider.generateToken(UUID.randomUUID(), "user@example.com");

        mockMvc.perform(patch("/api/v1/cards/{id}", UUID.randomUUID())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"not-a-date\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }
}
