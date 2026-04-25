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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

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
                null, "OPEN", "Breakout", "H4", null, null, null,
                null
        );
        when(tradeService.createTrade(eq(1L), any())).thenReturn(response);

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null,
                new BigDecimal("0.10"), "Breakout", "H4", null,
                null
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
                new BigDecimal("0.10"), null, null, null,
                null
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
    @Test
    @WithMockUser(roles = "USER")
    void getMyTrades_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeResponse response = new TradeDTO.TradeResponse(
                1L, "XAUUSD", "BUY", new BigDecimal("2650.50"),
                null, null, null, new BigDecimal("0.10"),
                null, "OPEN", "Breakout", "H4", null,
                LocalDateTime.now(), null,
                null
        );
        when(tradeService.getTradesByUser(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/trades/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pairSymbol").value("XAUUSD"));
    }

    @Test
    void getMyTrades_without_auth_returns401() throws Exception {
        mockMvc.perform(get("/api/trades/user/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getTradeById_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeResponse response = new TradeDTO.TradeResponse(
                1L, "XAUUSD", "BUY", new BigDecimal("2650.50"),
                null, null, null, new BigDecimal("0.10"),
                null, "OPEN", "Breakout", "H4", null,
                LocalDateTime.now(), null,
                null
        );
        when(tradeService.getTradeById(1L, 1L)).thenReturn(response);

        mockMvc.perform(get("/api/trades/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pairSymbol").value("XAUUSD"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void closeTrade_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeResponse response = new TradeDTO.TradeResponse(
                1L, "XAUUSD", "BUY", new BigDecimal("2650.50"),
                new BigDecimal("2680.00"), null, null, new BigDecimal("0.10"),
                new BigDecimal("2950.00"), "CLOSED", "Breakout", "H4", null,
                LocalDateTime.now(), LocalDateTime.now(),
                null
        );
        when(tradeService.closeTrade(eq(1L), any(), eq(1L))).thenReturn(response);

        TradeDTO.CloseTradeRequest request = new TradeDTO.CloseTradeRequest(
                new BigDecimal("2680.00")
        );

        mockMvc.perform(post("/api/trades/1/close")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteTrade_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        mockMvc.perform(delete("/api/trades/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getMyStats_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeStatsResponse stats = new TradeDTO.TradeStatsResponse(
                10L, 2L, 8L, 5L, 3L, 62.5,
                new BigDecimal("500.00"),
                new BigDecimal("200.00"),
                new BigDecimal("-50.00")
        );
        when(tradeService.getTradeStats(1L)).thenReturn(stats);

        mockMvc.perform(get("/api/trades/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTrades").value(10))
                .andExpect(jsonPath("$.winRate").value(62.5));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getDailyPnl_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.DailyPnlResponse daily = new TradeDTO.DailyPnlResponse(
                LocalDate.of(2026, 4, 1),
                new BigDecimal("150.00"),
                2L, 1L, 1L
        );
        when(tradeService.getDailyPnl(1L)).thenReturn(List.of(daily));

        mockMvc.perform(get("/api/trades/stats/daily-pnl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pnl").value(150.00));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getTopPairs_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TopPairResponse topPair = new TradeDTO.TopPairResponse(
                "XAUUSD", new BigDecimal("500.00"), 10L, 70.0
        );
        when(tradeService.getTopPairs(1L)).thenReturn(List.of(topPair));

        mockMvc.perform(get("/api/trades/stats/top-pairs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("XAUUSD"))
                .andExpect(jsonPath("$[0].totalPnl").value(500.00));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getRecentTrades_returns200() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        when(authService.getCurrentUser()).thenReturn(mockUser);

        TradeDTO.TradeResponse response = new TradeDTO.TradeResponse(
                1L, "XAUUSD", "BUY", new BigDecimal("2650.50"),
                null, null, null, new BigDecimal("0.10"),
                null, "OPEN", "Breakout", "H4", null,
                LocalDateTime.now(), null,
                null
        );
        when(tradeService.getRecentTrades(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/trades/recent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pairSymbol").value("XAUUSD"));
    }
}