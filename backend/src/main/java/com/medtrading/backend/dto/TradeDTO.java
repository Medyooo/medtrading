package com.medtrading.backend.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TradeDTO {

    public record CreateTradeRequest(
            @NotNull(message = "pairId est obligatoire")
            Long pairId,

            @NotBlank(message = "La direction est obligatoire")
            String direction,

            @NotNull(message = "Le prix d'entrée est obligatoire")
            @Positive(message = "Le prix doit être positif")
            BigDecimal entryPrice,

            BigDecimal stopLoss,

            BigDecimal takeProfit,

            @NotNull(message = "La taille du lot est obligatoire")
            @Positive(message = "Le lot doit être positif")
            BigDecimal lotSize,

            @Size(max = 50, message = "La stratégie ne doit pas dépasser 50 caractères")
            String strategy,

            @Size(max = 20)
            String timeframe,

            String notes
    ) {}

    public record CloseTradeRequest(
            @NotNull(message = "Le prix de sortie est obligatoire")
            @Positive(message = "Le prix doit être positif")
            BigDecimal exitPrice
    ){}

    public record TradeResponse(
            Long id,
            String pairSymbol,
            String direction,
            BigDecimal entryPrice,
            BigDecimal exitPrice,
            BigDecimal stopLoss,
            BigDecimal takeProfit,
            BigDecimal lotSize,
            BigDecimal profitLoss,
            String status,
            String strategy,
            String timeframe,
            String notes,
            LocalDateTime openedAt,
            LocalDateTime closedAt
    ) {}

    public record TradeStatsResponse(
            long totalTrades,
            long openTrades,
            long closedTrades,
            long winningTrades,
            long losingTrades,
            double winRate,
            BigDecimal totalPnl,
            BigDecimal bestTrade,
            BigDecimal worstTrade
    ) {}

    public record DailyPnlResponse(
            LocalDate date,
            BigDecimal pnl,
            long totalTrades,
            long winningTrades,
            long losingTrades
    ) {}

    public record TopPairResponse(
            String symbol,
            BigDecimal totalPnl,
            long trades,
            double winRate
    ) {}

    public record PnlDistributionResponse(
            String direction,
            long count,
            BigDecimal totalPnl
    ) {}
}
