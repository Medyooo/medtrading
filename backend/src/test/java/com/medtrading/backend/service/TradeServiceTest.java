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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

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
                1L, "BUY", new BigDecimal("2650.50"), null, null, new BigDecimal("0.10"), "Breakout", "H4", null,
                null
        );

        TradeDTO.TradeResponse response = tradeService.createTrade(1L, request);

        assertNotNull(response);
        assertEquals("XAUUSD", response.pairSymbol());
        assertEquals("BUY", response.direction());
        verify(tradeRepository, times(1)).save(any(Trade.class));
    }

    @Test
    void createTrade_computesRiskRewardRatio_fromStopLossAndTakeProfit() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(pairRepository.findById(1L)).thenReturn(Optional.of(testPair));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> {
            Trade t = invocation.getArgument(0);
            t.setId(99L);
            return t;
        });

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L,
                "LONG",
                new BigDecimal("100"),
                new BigDecimal("90"),
                new BigDecimal("120"),
                new BigDecimal("0.10"),
                null,
                null,
                null,
                null);

        TradeDTO.TradeResponse response = tradeService.createTrade(1L, request);

        ArgumentCaptor<Trade> captor = ArgumentCaptor.forClass(Trade.class);
        verify(tradeRepository).save(captor.capture());
        assertEquals(0, new BigDecimal("2.0000").compareTo(captor.getValue().getRiskRewardRatio()));
        assertEquals(0, new BigDecimal("2.0000").compareTo(response.riskRewardRatio()));
    }

    @Test
    void createTrade_userNotFound_throws404() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        TradeDTO.CreateTradeRequest request = new TradeDTO.CreateTradeRequest(
                1L, "BUY", new BigDecimal("2650.50"), null, null,
                new BigDecimal("0.10"), null, null, null,
                null
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
        when(tradeRepository.findByUserIdOrderByOpenedAtDesc(1L)).thenReturn(List.of(testTrade));

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
    @Test
    void getDailyPnl_success() {
        Trade trade1 = new Trade();
        trade1.setUser(testUser);
        trade1.setPair(testPair);
        trade1.setStatus("CLOSED");
        trade1.setProfitLoss(new BigDecimal("150.00"));
        trade1.setClosedAt(LocalDateTime.of(2026, 4, 1, 10, 0));

        Trade trade2 = new Trade();
        trade2.setUser(testUser);
        trade2.setPair(testPair);
        trade2.setStatus("CLOSED");
        trade2.setProfitLoss(new BigDecimal("-50.00"));
        trade2.setClosedAt(LocalDateTime.of(2026, 4, 1, 15, 0));

        Trade trade3 = new Trade();
        trade3.setUser(testUser);
        trade3.setPair(testPair);
        trade3.setStatus("CLOSED");
        trade3.setProfitLoss(new BigDecimal("200.00"));
        trade3.setClosedAt(LocalDateTime.of(2026, 4, 2, 10, 0));

        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(trade1, trade2, trade3));

        List<TradeDTO.DailyPnlResponse> result = tradeService.getDailyPnl(1L);

        assertEquals(2, result.size());

        // Jour 1 — 01/04
        assertEquals(LocalDate.of(2026, 4, 1), result.get(0).date());
        assertEquals(new BigDecimal("100.00"), result.get(0).pnl());
        assertEquals(2, result.get(0).totalTrades());
        assertEquals(1, result.get(0).winningTrades());
        assertEquals(1, result.get(0).losingTrades());

        // Jour 2 — 02/04
        assertEquals(LocalDate.of(2026, 4, 2), result.get(1).date());
        assertEquals(new BigDecimal("200.00"), result.get(1).pnl());
        assertEquals(1, result.get(1).totalTrades());
        assertEquals(1, result.get(1).winningTrades());
        assertEquals(0, result.get(1).losingTrades());
    }

    @Test
    void getDailyPnl_ignoresOpenTrades() {
        Trade openTrade = new Trade();
        openTrade.setUser(testUser);
        openTrade.setPair(testPair);
        openTrade.setStatus("OPEN");

        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(openTrade));

        List<TradeDTO.DailyPnlResponse> result = tradeService.getDailyPnl(1L);

        assertEquals(0, result.size());
    }

    @Test
    void getTopPairs_success() {
        Trade xauTrade1 = new Trade();
        xauTrade1.setUser(testUser);
        xauTrade1.setPair(testPair); // XAUUSD
        xauTrade1.setStatus("CLOSED");
        xauTrade1.setProfitLoss(new BigDecimal("300.00"));

        Trade xauTrade2 = new Trade();
        xauTrade2.setUser(testUser);
        xauTrade2.setPair(testPair); // XAUUSD
        xauTrade2.setStatus("CLOSED");
        xauTrade2.setProfitLoss(new BigDecimal("-100.00"));

        Pair eurPair = new Pair();
        eurPair.setId(2L);
        eurPair.setSymbol("EURUSD");
        eurPair.setName("Euro / US Dollar");

        Trade eurTrade = new Trade();
        eurTrade.setUser(testUser);
        eurTrade.setPair(eurPair);
        eurTrade.setStatus("CLOSED");
        eurTrade.setProfitLoss(new BigDecimal("150.00"));

        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(xauTrade1, xauTrade2, eurTrade));

        List<TradeDTO.TopPairResponse> result = tradeService.getTopPairs(1L);

        assertEquals(2, result.size());

        // XAUUSD en premier — PnL 200$ > EURUSD 150$
        assertEquals("XAUUSD", result.get(0).symbol());
        assertEquals(new BigDecimal("200.00"), result.get(0).totalPnl());
        assertEquals(2, result.get(0).trades());
        assertEquals(50.0, result.get(0).winRate());

        // EURUSD en deuxième
        assertEquals("EURUSD", result.get(1).symbol());
        assertEquals(new BigDecimal("150.00"), result.get(1).totalPnl());
        assertEquals(1, result.get(1).trades());
        assertEquals(100.0, result.get(1).winRate());
    }
    @Test
    void getPnlDistribution_success() {
        Trade buyWin = new Trade();
        buyWin.setUser(testUser);
        buyWin.setPair(testPair);
        buyWin.setDirection("BUY");
        buyWin.setStatus("CLOSED");
        buyWin.setProfitLoss(new BigDecimal("200.00"));

        Trade buyLoss = new Trade();
        buyLoss.setUser(testUser);
        buyLoss.setPair(testPair);
        buyLoss.setDirection("BUY");
        buyLoss.setStatus("CLOSED");
        buyLoss.setProfitLoss(new BigDecimal("-50.00"));

        Trade sellWin = new Trade();
        sellWin.setUser(testUser);
        sellWin.setPair(testPair);
        sellWin.setDirection("SELL");
        sellWin.setStatus("CLOSED");
        sellWin.setProfitLoss(new BigDecimal("100.00"));

        when(tradeRepository.findByUserId(1L)).thenReturn(List.of(buyWin, buyLoss, sellWin));

        List<TradeDTO.PnlDistributionResponse> result = tradeService.getPnlDistribution(1L);

        assertEquals(2, result.size());

        TradeDTO.PnlDistributionResponse buy = result.stream()
                .filter(r -> r.direction().equals("BUY"))
                .findFirst()
                .orElseThrow();

        TradeDTO.PnlDistributionResponse sell = result.stream()
                .filter(r -> r.direction().equals("SELL"))
                .findFirst()
                .orElseThrow();

        assertEquals(2, buy.count());
        assertEquals(new BigDecimal("150.00"), buy.totalPnl());
        assertEquals(1, sell.count());
        assertEquals(new BigDecimal("100.00"), sell.totalPnl());
    }

    @Test
    void getRecentTrades_returnsMax5() {
        List<Trade> trades = new java.util.ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            Trade t = new Trade();
            t.setId((long) i);
            t.setUser(testUser);
            t.setPair(testPair);
            t.setDirection("BUY");
            t.setStatus("OPEN");
            t.setEntryPrice(new BigDecimal("2650.00"));
            t.setLotSize(new BigDecimal("0.10"));
            t.setOpenedAt(LocalDateTime.now().minusDays(i));
            trades.add(t);
        }

        when(tradeRepository.findByUserIdOrderByOpenedAtDesc(1L)).thenReturn(trades);

        List<TradeDTO.TradeResponse> result = tradeService.getRecentTrades(1L);

        assertEquals(5, result.size());
    }

    @Test
    void getRecentTrades_orderedByMostRecent() {
        Trade older = new Trade();
        older.setId(1L);
        older.setUser(testUser);
        older.setPair(testPair);
        older.setDirection("BUY");
        older.setStatus("OPEN");
        older.setEntryPrice(new BigDecimal("2650.00"));
        older.setLotSize(new BigDecimal("0.10"));
        older.setOpenedAt(LocalDateTime.now().minusDays(2));

        Trade newer = new Trade();
        newer.setId(2L);
        newer.setUser(testUser);
        newer.setPair(testPair);
        newer.setDirection("SELL");
        newer.setStatus("OPEN");
        newer.setEntryPrice(new BigDecimal("2660.00"));
        newer.setLotSize(new BigDecimal("0.10"));
        newer.setOpenedAt(LocalDateTime.now().minusDays(1));

        when(tradeRepository.findByUserIdOrderByOpenedAtDesc(1L)).thenReturn(List.of(newer, older));

        List<TradeDTO.TradeResponse> result = tradeService.getRecentTrades(1L);

        assertEquals(2, result.size());
        assertEquals("SELL", result.get(0).direction()); // ← plus récent en premier
        assertEquals("BUY", result.get(1).direction());
    }

}
