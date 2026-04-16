package com.medtrading.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrading.backend.dto.TradeDTO;
import com.medtrading.backend.exception.GlobalExceptionHandler;
import com.medtrading.backend.service.AuthService;
import com.medtrading.backend.service.TradeService;
import com.medtrading.backend.entity.User;
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

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TradeController.class)
@AutoConfigureMockMvc
@Import({SecurityConfig.class, GlobalExceptionHandler.class, WebMvcSecurityTestConfig.class})
public class TradeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TradeService tradeService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles = "USER")
    void createTrade_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeResponse response = new TradeDTO.TradeResponse(
                1L, "XAUUSD", "BUY", new BigDecimal("2650.50"),
                null, null, null, new BigDecimal("0.10"),
                null, "OPEN", "Breakout", "H4", null, null, null
        );
        when(tradeService.createTrade(eq(1L), any())).thenReturn(response);

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null,
                new BigDecimal("0.10"), "Breakout", "H4", null
        );

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pairSymbol").value("XAUUSD"))
                .andExpect(jsonPath("$.direction").value("BUY"));
    }

    @Test
    void createTrade_without_auth_returns401() throws Exception {
        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null,
                new BigDecimal("0.10"), null, null, null
        );

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void createTrade_invalid_body_returns422() throws Exception {
        String invalidBody = "{}";

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isUnprocessableEntity());
    }
}