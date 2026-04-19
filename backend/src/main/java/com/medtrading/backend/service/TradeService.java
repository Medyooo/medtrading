package com.medtrading.backend.service;

import com.medtrading.backend.dto.TradeDTO;
import com.medtrading.backend.entity.Pair;
import com.medtrading.backend.entity.Trade;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.PairRepository;
import com.medtrading.backend.repository.TradeRepository;
import com.medtrading.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TradeService {

    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;
    private final PairRepository pairRepository;

    public TradeService(TradeRepository tradeRepository, PairRepository pairRepository, UserRepository userRepository){

        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
        this.pairRepository = pairRepository;
    }

    public List<TradeDTO.TradeResponse> getTradesByUser(Long userId) {
        return tradeRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public TradeDTO.TradeStatsResponse getTradeStats(Long userId) {
        List<Trade> trades = tradeRepository.findByUserId(userId);

        long totalTrades = trades.size();
        long openTrades = trades.stream()
                .filter(trade -> trade.getStatus().equals("OPEN"))
                .count();
        long closedTrades = trades.stream()
                .filter(trade -> trade.getStatus().equals("CLOSED"))
                .count();
        long winningTrades = trades.stream()
                .filter(trade -> trade.getStatus().equals("CLOSED"))
                .filter(trade -> trade.getProfitLoss() != null)
                .filter(trade -> trade.getProfitLoss().compareTo(BigDecimal.ZERO) > 0)
                .count();

        BigDecimal totalPnl = trades.stream()
                .filter(trade -> trade.getProfitLoss() != null)
                .map(Trade::getProfitLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal bestTrade = trades.stream()
                .filter(trade -> trade.getProfitLoss() != null)
                .map(Trade::getProfitLoss)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal worstTrade = trades.stream()
                .filter(trade -> trade.getProfitLoss() != null)
                .map(Trade::getProfitLoss)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        double winRate = closedTrades > 0
                ? (double) winningTrades / closedTrades * 100
                : 0;

        return new TradeDTO.TradeStatsResponse(
                totalTrades,
                openTrades,
                closedTrades,
                winningTrades,
                closedTrades - winningTrades,
                Math.round(winRate * 100.0) / 100.0,
                totalPnl,
                bestTrade,
                worstTrade
        );
    }

    public List<TradeDTO.DailyPnlResponse> getDailyPnl(Long userId) {
        List<Trade> trades = tradeRepository.findByUserId(userId)
                .stream()
                .filter(trade -> trade.getStatus().equals("CLOSED"))
                .filter(trade -> trade.getProfitLoss() != null)
                .sorted(Comparator.comparing(Trade::getClosedAt))
                .toList();

        Map<LocalDate, List<Trade>> tradesByDay = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.getClosedAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return tradesByDay.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<Trade> dayTrades = entry.getValue();

                    BigDecimal pnl = dayTrades.stream()
                            .map(Trade::getProfitLoss)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long winning = dayTrades.stream()
                            .filter(trade -> trade.getProfitLoss().compareTo(BigDecimal.ZERO) > 0)
                            .count();

                    long losing = dayTrades.stream()
                            .filter(trade -> trade.getProfitLoss().compareTo(BigDecimal.ZERO) < 0)
                            .count();

                    return new TradeDTO.DailyPnlResponse(
                            date,
                            pnl,
                            dayTrades.size(),
                            winning,
                            losing
                    );
                })
                .toList();
    }

    public List<TradeDTO.TopPairResponse> getTopPairs(Long userId) {
        List<Trade> trades = tradeRepository.findByUserId(userId)
                .stream()
                .filter(trade -> trade.getStatus().equals("CLOSED"))
                .filter(trade -> trade.getProfitLoss() != null)
                .toList();

        Map<String, List<Trade>> byPair = trades.stream()
                .collect(Collectors.groupingBy(trade -> trade.getPair().getSymbol()));

        return byPair.entrySet().stream()
                .map(entry -> {
                    String symbol = entry.getKey();
                    List<Trade> pairTrades = entry.getValue();

                    BigDecimal totalPnl = pairTrades.stream()
                            .map(Trade::getProfitLoss)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long winning = pairTrades.stream()
                            .filter(trade -> trade.getProfitLoss().compareTo(BigDecimal.ZERO) > 0)
                            .count();

                    double winRate = (double) winning / pairTrades.size() * 100;

                    return new TradeDTO.TopPairResponse(
                            symbol,
                            totalPnl,
                            pairTrades.size(),
                            Math.round(winRate * 100.0) / 100.0
                    );
                })
                .sorted(Comparator.comparing(TradeDTO.TopPairResponse::totalPnl).reversed())
                .toList();
    }

    public List<TradeDTO.PnlDistributionResponse> getPnlDistribution(Long userId) {
        List<Trade> trades = tradeRepository.findByUserId(userId)
                .stream()
                .filter(trade -> trade.getStatus().equals("CLOSED"))
                .filter(trade -> trade.getProfitLoss() != null)
                .toList();

        Map<String, List<Trade>> byDirection = trades.stream()
                .collect(Collectors.groupingBy(Trade::getDirection));

        return byDirection.entrySet().stream()
                .map(entry -> {
                    BigDecimal totalPnl = entry.getValue().stream()
                            .map(Trade::getProfitLoss)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new TradeDTO.PnlDistributionResponse(
                            entry.getKey(),
                            entry.getValue().size(),
                            totalPnl
                    );
                })
                .toList();}

    public List<TradeDTO.TradeResponse> getRecentTrades(Long userId) {
        return tradeRepository.findByUserId(userId)
                .stream()
                .sorted(Comparator.comparing(Trade::getOpenedAt).reversed())
                .limit(5)
                .map(this::toResponse)
                .toList();
    }
    public TradeDTO.TradeResponse getTradeById(long id, long userId){
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Trade introuvable avec l'id " + id));

        if (!trade.getUser().getId().equals(userId)){
            throw new ApiException(HttpStatus.FORBIDDEN, "Ce trade ne vous appartient pas");
        }

        return toResponse(trade);
    }

    @Transactional
    public TradeDTO.TradeResponse createTrade(Long userId, TradeDTO.CreateTradeRequest request){
        User user = userRepository.findById((userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User introuvable"));

        Pair pair = pairRepository.findById((request.pairId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pair introuvable avec l'id " + request.pairId()));

        Trade trade = new Trade();
        trade.setUser(user);
        trade.setPair(pair);
        trade.setDirection(request.direction());
        trade.setEntryPrice(request.entryPrice());
        trade.setStopLoss(request.stopLoss());
        trade.setTakeProfit(request.takeProfit());
        trade.setLotSize(request.lotSize());
        trade.setStrategy(request.strategy());
        trade.setTimeframe(request.timeframe());
        trade.setNotes(request.notes());
        trade.setStatus("OPEN");
        trade.setOpenedAt(LocalDateTime.now());

        Trade saved = tradeRepository.save(trade);
        return toResponse(saved);
    }

    @Transactional
    public TradeDTO.TradeResponse closeTrade(Long id, TradeDTO.CloseTradeRequest request, Long userId) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Trade introuvable avec l'id" + id));

        if (!trade.getUser().getId().equals(userId)){
            throw new ApiException(HttpStatus.FORBIDDEN, "Ce trade ne vous appartient pas");
        }

        if (trade.getStatus().equals("CLOSED")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ce trade est deja cloture");
        }

        trade.setExitPrice(request.exitPrice());
        trade.setStatus("CLOSED");
        trade.setClosedAt(LocalDateTime.now());

        calculateProfitLoss(trade);

        Trade saved =  tradeRepository.save(trade);
        return toResponse(saved);
    }

    @Transactional
    public void deleteTrade(Long id, Long userId) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Trade introuvable avec l'id " + id));

        if (!trade.getUser().getId().equals(userId)){
            throw new ApiException(HttpStatus.FORBIDDEN, "Ce trade ne vous appartient pas");
        }

        tradeRepository.delete(trade);
    }

    private TradeDTO.TradeResponse toResponse(Trade trade){
        return new TradeDTO.TradeResponse(
                trade.getId(),
                trade.getPair().getSymbol(),
                trade.getDirection(),
                trade.getEntryPrice(),
                trade.getExitPrice(),
                trade.getStopLoss(),
                trade.getTakeProfit(),
                trade.getLotSize(),
                trade.getProfitLoss(),
                trade.getStatus(),
                trade.getStrategy(),
                trade.getTimeframe(),
                trade.getNotes(),
                trade.getOpenedAt(),
                trade.getClosedAt()

        );
    }

    private void calculateProfitLoss(Trade trade) {
        BigDecimal diff = trade.getExitPrice().subtract(trade.getEntryPrice());

        if (trade.getDirection().equals("SELL")) {
            diff = diff.negate();
        }

        // Forex standard lot = 100 000 unités
        // Gold = 100 unités par lot
        BigDecimal pipValue = new BigDecimal("100000");

        trade.setProfitLoss(diff.multiply(trade.getLotSize()).multiply(pipValue)
                .setScale(2, java.math.RoundingMode.HALF_UP));
    }
}



