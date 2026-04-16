package com.medtrading.backend.controller;


import com.medtrading.backend.dto.TradeDTO;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.service.AuthService;
import com.medtrading.backend.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeService tradeService;
    private final AuthService authService;

    public TradeController(TradeService tradeService, AuthService authService){

        this.tradeService = tradeService;
        this.authService = authService;
    }

    @GetMapping("/user/{userId}")
    public List<TradeDTO.TradeResponse> getMyTrades() {
        Long userId = authService.getCurrentUser().getId();
        return tradeService.getTradesByUser(userId);
    }

    @GetMapping("/{id}")
    public TradeDTO.TradeResponse getTradeById(@PathVariable  long id){
    long user = authService.getCurrentUser().getId();
        return tradeService.getTradeById(id, user);
    }

    @PostMapping()
    public TradeDTO.TradeResponse openTrade(@Valid @RequestBody TradeDTO.CreateTradeRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return tradeService.createTrade(userId,request);
    }

    @PostMapping("/{id}/close")
    public TradeDTO.TradeResponse closeTrade(@PathVariable long id,@Valid @RequestBody TradeDTO.CloseTradeRequest request) {
        Long userId = authService.getCurrentUser().getId();

        return tradeService.closeTrade(id, request, userId);
    }

    @DeleteMapping("/{id}")
    public void deleteTrade(@PathVariable long id){
        Long userId = authService.getCurrentUser().getId();

        tradeService.deleteTrade(id, userId);
    }

    @GetMapping("/stats")
    public TradeDTO.TradeStatsResponse getMyStats() {
        Long userId = authService.getCurrentUser().getId();
        return tradeService.getTradeStats(userId);
    }
}
