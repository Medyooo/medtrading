package com.medtrading.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Setter
@Getter
@NoArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "pair_id", nullable = false)
    private Pair pair;

    @Column(nullable = false, length = 10)
    private String direction;

    @Column(nullable = false)
    private BigDecimal entryPrice;

    private BigDecimal exitPrice;

    private BigDecimal stopLoss;

    private BigDecimal takeProfit;

    @Column(nullable = false)
    private BigDecimal lotSize;

    private BigDecimal profitLoss;

    @Column(nullable = false)
    private LocalDateTime openedAt;

    private LocalDateTime closedAt;

    @Column(nullable = false , length = 10)
    private  String status;

    @Column(length = 100)
    private String strategy;

    @Column(length = 20)
    private String timeframe;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(precision = 12, scale = 4)
    private BigDecimal riskRewardRatio;

}
