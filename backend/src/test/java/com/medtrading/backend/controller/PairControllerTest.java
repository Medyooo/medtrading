package com.medtrading.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrading.backend.dto.PairDTO;
import com.medtrading.backend.entity.Pair;
import com.medtrading.backend.exception.GlobalExceptionHandler;
import com.medtrading.backend.repository.PairRepository;
import com.medtrading.backend.repository.UserRepository;
import com.medtrading.backend.security.SecurityConfig;
import com.medtrading.backend.support.WebMvcSecurityTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PairController.class)
@AutoConfigureMockMvc
@Import({SecurityConfig.class, GlobalExceptionHandler.class, WebMvcSecurityTestConfig.class})
public class PairControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PairRepository pairRepository;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles="USER")
    void getAllPairs_returns200() throws Exception {
        Pair pair = new Pair();
        pair.setId(1L);
        pair.setSymbol("XAUUSD");
        pair.setName("Gold / US Dollar");

        when(pairRepository.findAll()).thenReturn(List.of(pair));

        mockMvc.perform(get("/api/pairs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("XAUUSD"));
    }

    @Test
    void getAllPairs_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/pairs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createPair_asAdmin_returns200() throws Exception {
        when(pairRepository.existsBySymbol("EURUSD")).thenReturn(false);

        Pair saved = new Pair();
        saved.setId(2L);
        saved.setSymbol("EURUSD");
        saved.setName("Euro / US Dollar");
        when(pairRepository.save(org.mockito.ArgumentMatchers.any(Pair.class))).thenReturn(saved);

        PairDTO.CreatePairRequest request = new PairDTO.CreatePairRequest(
                "EURUSD", "Euro / US Dollar", "EUR", "USD"
        );

        mockMvc.perform(post("/api/pairs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("EURUSD"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createPair_asUser_returns403() throws Exception {
        PairDTO.CreatePairRequest request = new PairDTO.CreatePairRequest(
                "EURUSD", "Euro / US Dollar", "EUR", "USD"
        );

        mockMvc.perform(post("/api/pairs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createPair_duplicate_returns409() throws Exception {
        when(pairRepository.existsBySymbol("XAUUSD")).thenReturn(true);

        PairDTO.CreatePairRequest request = new PairDTO.CreatePairRequest(
                "XAUUSD", "Gold", "XAU", "USD"
        );

        mockMvc.perform(post("/api/pairs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}