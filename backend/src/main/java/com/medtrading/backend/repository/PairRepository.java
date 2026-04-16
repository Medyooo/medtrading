package com.medtrading.backend.repository;


import com.medtrading.backend.entity.Pair;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PairRepository extends JpaRepository<Pair, Long> {
    boolean existsBySymbol(String symbol);

}
