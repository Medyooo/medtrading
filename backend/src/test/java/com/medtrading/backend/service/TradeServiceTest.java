package com.medtrading.backend.service;

import com.medtrading.backend.dto.TradeDTO;
import com.medtrading.backend.entity.Pair;
import com.medtrading.backend.entity.Trade;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.PairRepository;
import com.medtrading.backend.repository.TradeRepository;
import com.medtrading.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PairRepository pairRepository;

    @InjectMocks
    private TradeService tradeService;

    private User testUser;
    private Pair testPair;
    private Trade testTrade;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("mohamed");
        testUser.setEmail("med@test.com");
        testUser.setPassword("hashed");
        testUser.setRole("USER");

        testPair = new Pair();
        testPair.setId(1L);
        testPair.setSymbol("XAUUSD");
        testPair.setName("Gold / US Dollar");

        testTrade = new Trade();
        testTrade.setId(1L);
        testTrade.setUser(testUser);
        testTrade.setPair(testPair);
        testTrade.setDirection("BUY");
        testTrade.setEntryPrice(new BigDecimal("2650.50"));
        testTrade.setLotSize(new BigDecimal("0.10"));
        testTrade.setStatus("OPEN");
    }

    @Test
    void createTrade_succes() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(pairRepository.findById(1L)).thenReturn(Optional.of(testPair));
        when(tradeRepository.save(any(Trade.class))).thenReturn(testTrade);

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null, new BigDecimal("0.10"), "Breakout", "H4", null
        );

        TradeDTO.TradeResponse response = tradeService.createTrade(1L, request);

        assertNotNull(response);
        assertEquals("XAUUSD", response.pairSymbol());
        assertEquals("BUY", response.direction());
        verify(tradeRepository, times(1)).save(any(Trade.class));
    }

    @Test
    void createTrade_userNotFound_throws404() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null,
                new BigDecimal("0.10"), null, null, null
        );

        ApiException exception = assertThrows(ApiException.class, () -> {
            tradeService.createTrade(999L, request);
        });

        assertEquals(404, exception.getStatus().value());
    }

    @Test
    void getTradeById_success() {
        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));

        TradeDTO.TradeResponse response = tradeService.getTradeById(1L, 1L);

        assertNotNull(response);
        assertEquals("XAUUSD", response.pairSymbol());
    }

    @Test
    void getTradeById_notFound_throws404() {
        when(tradeRepository.findById(anyLong())).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> {
            tradeService.getTradeById(1L, 999L);
        });

        assertEquals(404, exception.getStatus().value());
    }

    @Test
    void getTradeById_wrongUser_throws403() {
        User otherUser = new User();
        otherUser.setId(2L);
        testTrade.setUser(otherUser);

        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));

        ApiException exception = assertThrows(ApiException.class, () -> {
            tradeService.getTradeById(1L, 1L);
        });

        assertEquals(403, exception.getStatus().value());
    }

    @Test
    void closeTrade_success() {
        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));
        when(tradeRepository.save(any(Trade.class))).thenReturn(testTrade);

        TradeDTO.CloseTradeRequest request = new TradeDTO.CloseTradeRequest(
                new BigDecimal("2680.00")
        );

        TradeDTO.TradeResponse response = tradeService.closeTrade(1L, request, 1L);

        assertNotNull(response);
        assertEquals("CLOSED", testTrade.getStatus());
        assertNotNull(testTrade.getClosedAt());
    }

    @Test
    void closeTrade_alreadyClosed_throws400() {
        testTrade.setStatus("CLOSED");
        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));

        TradeDTO.CloseTradeRequest request = new TradeDTO.CloseTradeRequest(
                new BigDecimal("2680.00")
        );

        ApiException exception = assertThrows(ApiException.class, () -> {
            tradeService.closeTrade(1L, request, 1L);
        });

        assertEquals(400, exception.getStatus().value());
    }

    @Test
    void deleteTrade_success() {
        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));

        tradeService.deleteTrade(1L, 1L);

        verify(tradeRepository, times(1)).delete(testTrade);
    }

    @Test
    void getTradesByUser_returnsList() {
        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(testTrade));

        List<TradeDTO.TradeResponse> trades = tradeService.getTradesByUser(1L);

        assertEquals(1, trades.size());
        assertEquals("XAUUSD", trades.get(0).pairSymbol());
    }

    @Test
    void getTradeStats_success() {
        Trade closedWin = new Trade();
        closedWin.setUser(testUser);
        closedWin.setPair(testPair);
        closedWin.setStatus("CLOSED");
        closedWin.setProfitLoss(new BigDecimal("150.00"));

        Trade closedLoss = new Trade();
        closedLoss.setUser(testUser);
        closedLoss.setPair(testPair);
        closedLoss.setStatus("CLOSED");
        closedLoss.setProfitLoss(new BigDecimal("-50.00"));

        Trade openTrade = new Trade();
        openTrade.setUser(testUser);
        openTrade.setPair(testPair);
        openTrade.setStatus("OPEN");

        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(closedWin, closedLoss, openTrade));

        TradeDTO.TradeStatsResponse stats = tradeService.getTradeStats(1L);

        assertEquals(3, stats.totalTrades());
        assertEquals(1, stats.openTrades());
        assertEquals(2, stats.closedTrades());
        assertEquals(1, stats.winningTrades());
        assertEquals(1, stats.losingTrades());
        assertEquals(50.0, stats.winRate());
        assertEquals(new BigDecimal("100.00"), stats.totalPnl());
        assertEquals(new BigDecimal("150.00"), stats.bestTrade());
        assertEquals(new BigDecimal("-50.00"), stats.worstTrade());
    }

    @Test
    void getTradeStats_noTrades_returnsZeros() {
        when(tradeRepository.findByUserId(1L)).thenReturn(List.of());

        TradeDTO.TradeStatsResponse stats = tradeService.getTradeStats(1L);

        assertEquals(0, stats.totalTrades());
        assertEquals(0.0, stats.winRate());
        assertEquals(BigDecimal.ZERO, stats.totalPnl());
        assertEquals(BigDecimal.ZERO, stats.bestTrade());
        assertEquals(BigDecimal.ZERO, stats.worstTrade());
    }

}
