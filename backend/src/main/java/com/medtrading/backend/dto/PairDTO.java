package com.medtrading.backend.dto;

import jakarta.validation.constraints.*;

public class PairDTO {

    public record CreatePairRequest(
            @NotBlank(message = "Le symbole est obligatoire")
            @Size(max = 20, message = "Le symbole ne doit pas dépasser 20 caractères")
            String symbol,

            @NotBlank(message = "Le nom est obligatoire")
            @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
            String name,

            @Size(max = 10)
            String baseCurrency,

            @Size(max = 10)
            String quoteCurrency
    ) {}

    public record PairResponse(
            Long id,
            String symbol,
            String name,
            String baseCurrency,
            String quoteCurrency
    ) {}
}