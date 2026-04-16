package com.medtrading.backend.repository;

import com.medtrading.backend.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByUserId(Long userId);

    List<Trade> findByUserIdAndStatus(Long userId, String status);
}
